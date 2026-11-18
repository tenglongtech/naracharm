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

    def test_public_assets_match_build_and_home_is_indexable(self):
        sitemap = f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>{self.origin}</loc></url></urlset>'
        feed = "<rss><channel><title>Nara Charm</title></channel></rss>"
        robots = f"User-Agent: *\nAllow: /\nSitemap: {self.origin}/sitemap.xml\n"
        html = f'<html><head><link rel="canonical" href="{self.origin}"/></head><body><h1>Nara Charm</h1></body></html>'
        with TemporaryDirectory() as directory:
            for name, body in (("sitemap.xml", sitemap), ("google-feed.xml", feed), ("robots.txt", robots), ("index.html", html)):
                Path(directory, name).write_text(body)
                mime = "text/html" if name.endswith(".html") else "application/xml" if name.endswith(".xml") else "text/plain"
                self.responses[("GET", "/" if name == "index.html" else "/" + name)] = (200, {"Content-Type": mime}, body)
            self.assertEqual(self.run_verifier("--exported-site", directory).returncode, 0)
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
