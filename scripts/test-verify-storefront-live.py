import json
import subprocess
import sys
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Thread

SCRIPT = Path(__file__).with_name("verify-storefront-live.py")
HEALTH = {"ok": True, "service": "naracharm-api", "db": "up", "schema": "ready"}
CONFIG = {"quoteReview": True, "publishableKey": "pk_live_fixture123456"}
CORS = {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
    "Cache-Control": "no-store",
}


class LiveReleaseTest(unittest.TestCase):
    def setUp(self):
        self.requests = []
        self.responses = {}
        scenario = self

        class Fixture(BaseHTTPRequestHandler):
            def respond(self):
                scenario.requests.append((self.command, self.path, dict(self.headers)))
                status, headers, body = scenario.responses.get((self.command, self.path), (404, {}, ""))
                self.send_response(status)
                for key, value in headers.items():
                    self.send_header(key, value)
                self.end_headers()
                self.wfile.write(body.encode())

            do_GET = do_OPTIONS = respond

            def log_message(self, *args):
                pass

        server = ThreadingHTTPServer(("127.0.0.1", 0), Fixture)
        self.origin = f"http://127.0.0.1:{server.server_port}"
        worker = Thread(target=server.serve_forever, kwargs={"poll_interval": 0.01}, daemon=True)
        worker.start()
        self.addCleanup(server.server_close)
        self.addCleanup(worker.join, 1)
        self.addCleanup(server.shutdown)

        self.cors = {**CORS, "Access-Control-Allow-Origin": self.origin}
        self.set_json("/api/health", HEALTH)
        self.set_json("/api/checkout?config=1", CONFIG, self.cors)
        self.set_json("/api/auth/get-session", None, self.cors)
        for route in ("/api/checkout", "/api/auth/sign-in/email"):
            self.responses[("OPTIONS", route)] = (204, self.cors, "")

    def set_json(self, route, data, headers=None, status=200):
        self.responses[("GET", route)] = (
            status, {"Content-Type": "application/json", **(headers or {})}, json.dumps(data)
        )

    def run_verifier(self, *args):
        return subprocess.run(
            [sys.executable, str(SCRIPT), "--site-origin", self.origin, "--api-origin", self.origin, *args],
            capture_output=True, text=True, timeout=8, check=False,
        )

    def test_ready_backend_uses_only_public_reads_and_preflight(self):
        result = self.run_verifier()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertNotIn(CONFIG["publishableKey"], result.stdout + result.stderr)
        self.assertEqual({method for method, _, _ in self.requests}, {"GET", "OPTIONS"})
        self.assertIn(("GET", "/api/auth/get-session"), [(method, route) for method, route, _ in self.requests])
        for method, route, headers in self.requests:
            if method == "OPTIONS":
                self.assertEqual(headers["Access-Control-Request-Method"], "POST")
                self.assertEqual(headers["Access-Control-Request-Headers"], "content-type")
                self.assertEqual(headers["Origin"], self.origin)
                self.assertNotIn("Cookie", headers, route)

    def test_cloudflare_error_stops_before_other_api_checks(self):
        self.responses[("GET", "/api/health")] = (522, {}, "<html>Origin down</html>")
        result = self.run_verifier()
        self.assertEqual(result.returncode, 1)
        self.assertIn("HTTP 522", result.stderr)
        self.assertEqual([(method, route) for method, route, _ in self.requests], [("GET", "/api/health")])

    def test_html_with_200_and_pending_migration_fail(self):
        self.responses[("GET", "/api/health")] = (200, {"Content-Type": "text/html"}, "<html>Welcome</html>")
        self.assertIn("JSON", self.run_verifier().stderr)
        self.set_json("/api/health", {**HEALTH, "ok": False, "schema": "pending"}, status=503)
        result = self.run_verifier()
        self.assertEqual(result.returncode, 1)
        self.assertIn("schema=pending", result.stderr)

    def test_redirect_and_wrong_checkout_contract_fail(self):
        self.responses[("GET", "/api/health")] = (302, {"Location": "/redirected"}, "")
        self.assertIn("HTTP 302", self.run_verifier().stderr)
        self.assertNotIn("/redirected", [route for _, route, _ in self.requests])
        self.set_json("/api/health", HEALTH)
        self.set_json("/api/checkout?config=1", {**CONFIG, "quoteReview": False}, self.cors)
        self.assertIn("quoteReview", self.run_verifier().stderr)
        self.set_json("/api/checkout?config=1", {**CONFIG, "publishableKey": "pk_test_fixture1234"}, self.cors)
        self.assertIn("live publishable key", self.run_verifier().stderr)
        self.assertEqual(self.run_verifier("--stripe-mode", "test").returncode, 0)

    def test_credentialed_browser_requests_need_exact_origin(self):
        self.responses[("OPTIONS", "/api/auth/sign-in/email")] = (204, {**self.cors, "Access-Control-Allow-Origin": "*"}, "")
        result = self.run_verifier()
        self.assertEqual(result.returncode, 1)
        self.assertIn("Access-Control-Allow-Origin", result.stderr)

    def catalog_export(self, directory):
        root = Path(directory)
        (root / "products").mkdir()
        products = ("silver-band", "stone-charm")
        urls = [self.origin] + [f"{self.origin}/products/{slug}" for slug in products]
        sitemap = "<urlset>" + "".join(f"<url><loc>{url}</loc></url>" for url in urls) + "</urlset>"
        (root / "sitemap.xml").write_text(sitemap)

        def offer(sku, price, in_stock):
            status = "InStock" if in_stock else "OutOfStock"
            return {
                "@type": "Product", "sku": sku,
                "offers": {"price": price, "priceCurrency": "USD", "availability": f"https://schema.org/{status}"},
            }

        markup = [
            {"@type": "ProductGroup", "hasVariant": [offer("SLIM", "49.00", True), offer("WIDE", "63.50", False)]},
            offer("CHARM", "17.25", True),
        ]
        for slug, schema in zip(products, markup):
            (root / "products" / f"{slug}.html").write_text(
                f'<link rel="canonical" href="{self.origin}/products/{slug}"><h1>{slug}</h1>'
                f'<script type="application/ld+json">{{"@type":"OnlineStore"}}</script>'
                f'<script type="application/ld+json">{json.dumps(schema)}</script>'
            )
        return sitemap

    def set_catalog(self, *variants):
        catalog = [
            {"slug": "silver-band", "offers": list(variants)},
            {"slug": "stone-charm", "offers": [{"sku": "CHARM", "unitPriceCents": 1725, "stock": 7}]},
        ]
        self.set_json("/api/catalog/offer?catalog=1", {"catalog": catalog}, self.cors)
        return catalog

    def test_catalog_preflight_checks_each_sku_without_requiring_the_candidate_to_be_live(self):
        slim = {"sku": "SLIM", "unitPriceCents": 4900, "stock": 2}
        wide = {"sku": "WIDE", "unitPriceCents": 6350, "stock": 0}
        self.set_catalog(slim, wide)
        with TemporaryDirectory() as directory:
            self.catalog_export(directory)
            result = self.run_verifier("--catalog-export", directory)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn("2 product pages and 3 SKUs", result.stdout)
            requests = [(route, headers) for method, route, headers in self.requests if route.startswith("/api/catalog/")]
            self.assertEqual([route for route, _ in requests], ["/api/catalog/offer?catalog=1"])
            self.assertTrue(all(headers.get("Origin") == self.origin and "Cookie" not in headers for _, headers in requests))
            self.assertNotIn("/sitemap.xml", [route for _, route, _ in self.requests])

            catalog = self.set_catalog({**slim, "unitPriceCents": 5199, "stock": 0}, {"sku": "EXTRA", "unitPriceCents": 6500, "stock": 6})
            catalog[1] = {"slug": "new-bracelet", "offers": []}
            self.set_json("/api/catalog/offer?catalog=1", {"catalog": catalog}, self.cors)
            result = self.run_verifier("--catalog-export", directory)
            self.assertEqual(result.returncode, 1)
            for field in (
                "SLIM", "WIDE", "EXTRA", "$49.00", "$51.99", "out of stock",
                "Active product 'new-bracelet' is missing from the export",
                "Exported product 'stone-charm' is no longer active",
            ):
                self.assertIn(field, result.stderr)

    def test_catalog_preflight_fails_on_unusable_api_and_wrong_canonical_origin(self):
        with TemporaryDirectory() as directory:
            sitemap = self.catalog_export(directory)
            self.responses[("GET", "/api/catalog/offer?catalog=1")] = (503, {}, "")
            self.assertIn("HTTP 503", self.run_verifier("--catalog-export", directory).stderr)
            self.set_catalog({"sku": "SLIM", "unitPriceCents": 4900, "stock": True})
            self.assertIn("invalid offer", self.run_verifier("--catalog-export", directory).stderr)
            Path(directory, "sitemap.xml").write_text(sitemap.replace(self.origin, "https://another-shop.example"))
            self.assertIn("must target the storefront", self.run_verifier("--catalog-export", directory).stderr)

    def test_inquiry_only_release_verifies_without_the_payment_api(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            self.responses[("GET", "/api/health")] = (522, {}, "")
            sitemap = f'<urlset><url><loc>{self.origin}</loc></url></urlset>'
            checkout = '<meta name="robots" content="noindex"><main id="main" data-checkout-mode="inquiry"><h1>Checkout</h1></main>'
            home = f'<link rel="canonical" href="{self.origin}"><h1>Nara Charm</h1>'
            for path, mime, body in (
                ("/sitemap.xml", "application/xml", sitemap),
                ("/google-feed.xml", "application/xml", "<rss><channel/></rss>"),
                ("/robots.txt", "text/plain", f"User-agent: *\nSitemap: {self.origin}/sitemap.xml\n"),
                ("/checkout", "text/html", checkout),
                ("/", "text/html", home),
            ):
                name = {"/": "index.html", "/checkout": "checkout.html"}.get(path, path.lstrip("/"))
                (root / name).write_text(body)
                self.responses[("GET", path)] = (200, {"Content-Type": mime}, body)

            result = self.run_verifier("--exported-site", directory)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertFalse(any(path.startswith("/api/") for _, path, _ in self.requests))
            self.responses[("GET", "/checkout")] = (200, {"Content-Type": "text/html"}, checkout.replace('"inquiry"', '"online"'))
            self.assertIn("did not match the inquiry-only export", self.run_verifier("--exported-site", directory).stderr)

    def test_inquiry_release_checks_every_sitemap_page_and_rejects_stale_metadata(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            self.inquiry_pages(root)
            route = "/collections/necklaces"
            status, headers, body = self.responses[("GET", route)]
            for code, response_headers, markup, failure in (
                (404, headers, body, "GET /collections/necklaces returned HTTP 404"),
                (status, {**headers, "X-Robots-Tag": "noindex"}, body, "/collections/necklaces has a noindex directive"),
                (status, headers, body.replace("Necklace selection", "Old collection"), "/collections/necklaces search title or description differs"),
            ):
                with self.subTest(failure=failure):
                    self.responses[("GET", route)] = (code, response_headers, markup)
                    failed = self.run_verifier("--exported-site", directory)
                    self.assertEqual(failed.returncode, 1)
                    self.assertIn(failure, failed.stderr)
            self.responses[("GET", route)] = (status, headers, body)
            result = self.run_verifier("--exported-site", directory)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn("all 3 canonical pages", result.stdout)
            self.assertFalse(any(path.startswith("/api/") for _, path, _ in self.requests))

    def test_online_inquiry_requires_the_live_form_and_write_only_endpoint(self):
        with TemporaryDirectory() as directory:
            root = Path(directory)
            self.inquiry_pages(root)
            form = '<main id="main" data-inquiry-mode="online"><h1>Contact</h1></main>'
            (root / "contact.html").write_text(form)
            self.responses[("GET", "/contact")] = (200, {"Content-Type": "text/html"}, form)
            result = self.run_verifier("--exported-site", directory)
            self.assertEqual(result.returncode, 1)
            self.assertIn("GET /api/inquiries", result.stderr)

            self.set_json("/api/inquiries", {"error": "method"}, {
                "Allow": "POST", "Cache-Control": "no-store", "X-Robots-Tag": "noindex",
            }, status=405)
            result = self.run_verifier("--exported-site", directory)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn("inquiry endpoint is deployed", result.stdout)
            self.assertEqual({method for method, _, _ in self.requests}, {"GET"})
            self.responses[("GET", "/contact")] = (200, {"Content-Type": "text/html"}, form.replace('"online"', '"email"'))
            self.assertIn("Live inquiry form", self.run_verifier("--exported-site", directory).stderr)

    def test_inquiry_release_rejects_published_purchase_offers(self):
        with TemporaryDirectory() as directory:
            self.inquiry_pages(Path(directory))
            route = "/products/silver-band"
            status, headers, body = self.responses[("GET", route)]
            self.responses[("GET", route)] = (status, headers, body.replace('"sku":"BAND"', '"sku":"BAND","offers":{"@type":"Offer"}'))
            result = self.run_verifier("--exported-site", directory)
            self.assertEqual(result.returncode, 1)
            self.assertIn("/products/silver-band includes an offer in inquiry mode", result.stderr)

    def inquiry_pages(self, root):
        routes = ("/", "/collections/necklaces", "/products/silver-band")
        urls = [self.origin + route.rstrip("/") for route in routes]
        sitemap = "<urlset>" + "".join(f"<url><loc>{url}</loc></url>" for url in urls) + "</urlset>"
        checkout = '<meta name="robots" content="noindex"><main id="main" data-checkout-mode="inquiry"><h1>Checkout</h1></main>'
        responses = {
            "/sitemap.xml": ("application/xml", sitemap),
            "/google-feed.xml": ("application/xml", "<rss><channel/></rss>"),
            "/robots.txt": ("text/plain", f"User-agent: *\nSitemap: {self.origin}/sitemap.xml\n"),
            "/checkout": ("text/html", checkout),
        }
        for route, label in zip(routes, ("Nara Charm", "Necklace selection", "Silver Band")):
            schema = '<script type="application/ld+json">{"@type":"Product","name":"Silver Band","sku":"BAND"}</script>' if route.startswith("/products/") else ""
            html = f'<title>{label}</title><meta name="description" content="{label} guide"><link rel="canonical" href="{self.origin}{route.rstrip("/")}"><h1>{label}</h1>{schema}'
            responses[route] = ("text/html", html)
        for route, (mime, body) in responses.items():
            name = ("index.html" if route == "/" else route.lstrip("/") + ".html") if mime == "text/html" else route.lstrip("/")
            file = root / name
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_text(body)
            self.responses[("GET", route)] = (200, {"Content-Type": mime}, body)

    def test_public_assets_match_build_and_home_is_indexable(self):
        feed = "<rss><channel><title>Nara Charm</title></channel></rss>"
        robots = f"User-Agent: *\nAllow: /\nSitemap: {self.origin}/sitemap.xml\n"
        html = f'<html><head><link rel="canonical" href="{self.origin}"/></head><body><h1>Nara Charm</h1></body></html>'
        with TemporaryDirectory() as directory:
            sitemap = self.catalog_export(directory)
            self.set_catalog({"sku": "SLIM", "unitPriceCents": 4900, "stock": 2}, {"sku": "WIDE", "unitPriceCents": 6350, "stock": 0})
            for slug in ("silver-band", "stone-charm"):
                body = Path(directory, "products", f"{slug}.html").read_text()
                self.responses[("GET", f"/products/{slug}")] = (200, {"Content-Type": "text/html"}, body)
            for name, body in (("sitemap.xml", sitemap), ("google-feed.xml", feed), ("robots.txt", robots), ("index.html", html)):
                Path(directory, name).write_text(body)
                mime = "text/html" if name.endswith(".html") else "application/xml" if name.endswith(".xml") else "text/plain"
                self.responses[("GET", "/" if name == "index.html" else "/" + name)] = (200, {"Content-Type": mime}, body)
            self.assertEqual(self.run_verifier("--exported-site", directory).returncode, 0)
            published = self.responses[("GET", "/products/stone-charm")]
            self.responses[("GET", "/products/stone-charm")] = (200, published[1], published[2].replace('"17.25"', '"19.00"'))
            stale_page = self.run_verifier("--exported-site", directory)
            self.assertEqual(stale_page.returncode, 1)
            self.assertIn("stone-charm SKU 'CHARM' price differs (export $17.25, published page $19.00)", stale_page.stderr)
            self.responses[("GET", "/products/stone-charm")] = published
            self.responses[("GET", "/robots.txt")] = (200, {"Content-Type": "text/plain"}, robots.replace("Allow:", "Disallow:"))
            self.assertIn("robots.txt blocks Googlebot", self.run_verifier("--exported-site", directory).stderr)
            self.responses[("GET", "/robots.txt")] = (200, {"Content-Type": "text/plain"}, robots)
            self.responses[("GET", "/google-feed.xml")] = (200, {"Content-Type": "application/xml"}, feed.replace("Nara Charm", "Older feed"))
            self.assertIn("Shopping Feed differs", self.run_verifier("--exported-site", directory).stderr)
            self.responses[("GET", "/google-feed.xml")] = (200, {"Content-Type": "application/xml"}, feed)
            self.responses[("GET", "/")] = (200, {"Content-Type": "text/html", "X-Robots-Tag": "noindex"}, html)
            self.assertIn("noindex", self.run_verifier("--exported-site", directory).stderr)
            self.responses[("GET", "/")] = (200, {"Content-Type": "text/html"}, html)
            self.responses[("GET", "/sitemap.xml")] = (200, {"Content-Type": "application/xml"}, sitemap.replace(self.origin, self.origin + "/old"))
            self.assertIn("sitemap differs", self.run_verifier("--exported-site", directory).stderr)


if __name__ == "__main__":
    unittest.main()
