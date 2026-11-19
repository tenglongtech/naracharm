"""Read-only checks before switching the storefront and after deploying the static export."""

import argparse
import json
import re
import sys
from concurrent.futures import ThreadPoolExecutor
from http.client import HTTPException
from html.parser import HTMLParser
from pathlib import Path
from time import sleep
from urllib.error import HTTPError, URLError
from urllib.parse import unquote, urlsplit
from urllib.request import HTTPRedirectHandler, ProxyHandler, Request, build_opener
from urllib.robotparser import RobotFileParser
from xml.etree import ElementTree

MAX_BODY = 4 * 1024 * 1024
LOOPBACK = ("localhost", "127.0.0.1", "::1")
PRODUCT_SLUG = r"[a-z0-9]+(?:-[a-z0-9]+)*"
RETRYABLE_HTTP = {408, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524}


class VerificationError(Exception):
    pass


class ResponseReadError(VerificationError):
    pass


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def origin(value):
    parsed = urlsplit(value)
    loopback = parsed.hostname in LOOPBACK
    if (
        not parsed.hostname or parsed.username is not None or parsed.password is not None
        or parsed.query or parsed.fragment or parsed.path not in ("", "/")
        or not (parsed.scheme == "https" or parsed.scheme == "http" and loopback)
    ):
        raise argparse.ArgumentTypeError("Use an HTTPS origin or a loopback HTTP origin.")
    return f"{parsed.scheme}://{parsed.netloc}"


def read(opener, target, timeout, *, method="GET", headers=None):
    url = urlsplit(target)
    route = url.path + ("?" + url.query if url.query else "")
    request = Request(target, method=method, headers={"User-Agent": "NaraCharm-ReleaseVerifier/1.0", **(headers or {})})
    try:
        response = opener.open(request, timeout=timeout)
    except HTTPError as error:
        response = error
    except (URLError, OSError, HTTPException) as error:
        raise ResponseReadError(f"{method} {route} could not connect ({type(getattr(error, 'reason', error)).__name__})") from error
    with response:
        try:
            body = response.read(MAX_BODY + 1)
        except (OSError, HTTPException) as error:
            raise ResponseReadError(f"{method} {route} body could not be read") from error
        require(len(body) <= MAX_BODY, f"{method} {route} response exceeds {MAX_BODY} bytes")
        return response.code, response.headers, body


def origin_opener(value):
    if urlsplit(value).hostname in LOOPBACK:
        return build_opener(ProxyHandler({}), NoRedirect())
    return build_opener(NoRedirect())


def require(condition, message):
    if not condition:
        raise VerificationError(message)


def json_response(headers, body, label):
    require(headers.get_content_type() == "application/json", f"{label} did not return JSON")
    try:
        return json.loads(body)
    except (UnicodeError, json.JSONDecodeError) as error:
        raise VerificationError(f"{label} returned invalid JSON") from error


def tokens(headers, header):
    return {token.strip().lower() for value in (headers.get_all(header) or []) for token in value.split(",")}


def verify_cors(headers, site, label, preflight=False):
    require(headers.get_all("Access-Control-Allow-Origin") == [site], f"{label} has an invalid Access-Control-Allow-Origin")
    require(headers.get("Access-Control-Allow-Credentials") == "true", f"{label} does not allow browser credentials")
    require("origin" in tokens(headers, "Vary"), f"{label} must vary by Origin")
    if preflight:
        require("post" in tokens(headers, "Access-Control-Allow-Methods"), f"{label} preflight does not allow POST")
        require("content-type" in tokens(headers, "Access-Control-Allow-Headers"), f"{label} preflight does not allow Content-Type")
    else:
        require("no-store" in tokens(headers, "Cache-Control"), f"{label} is missing Cache-Control: no-store")


def verify_api(opener, api, site, timeout, stripe_mode):
    label = "GET /api/health"
    code, headers, body = read(opener, api + "/api/health", timeout)
    if code == 503 and headers.get_content_type() == "application/json":
        health = json_response(headers, body, label)
        if isinstance(health, dict) and health.get("service") == "naracharm-api":
            db = health.get("db")
            schema = health.get("schema")
            raise VerificationError(
                f"{label} returned HTTP 503 (db={db if db in ('up', 'down') else 'unknown'}, "
                f"schema={schema if schema in ('ready', 'pending') else 'unknown'})"
            )
    require(code == 200, f"{label} returned HTTP {code}")
    health = json_response(headers, body, label)
    require(
        isinstance(health, dict) and health.get("ok") is True and health.get("service") == "naracharm-api"
        and health.get("db") == "up" and health.get("schema") == "ready",
        f"{label} did not confirm database and schema readiness",
    )
    print("API database and schema are ready.")

    origin_header = {"Origin": site}
    label = "GET /api/checkout?config=1"
    code, headers, body = read(opener, api + "/api/checkout?config=1", timeout, headers=origin_header)
    require(code == 200, f"{label} returned HTTP {code}")
    verify_cors(headers, site, label)
    config = json_response(headers, body, label)
    require(isinstance(config, dict) and config.get("quoteReview") is True, f"{label} is missing quoteReview")
    key = config.get("publishableKey")
    require(
        isinstance(key, str) and re.fullmatch(rf"pk_{stripe_mode}_[A-Za-z0-9]+", key)
        and key.rsplit("_", 1)[-1].lower() not in {"placeholder", "xxx"},
        f"{label} has no {stripe_mode} publishable key",
    )

    label = "GET /api/auth/get-session"
    code, headers, body = read(opener, api + "/api/auth/get-session", timeout, headers=origin_header)
    require(code == 200, f"{label} returned HTTP {code}")
    verify_cors(headers, site, label)
    require(json_response(headers, body, label) is None, f"{label} did not return an anonymous session")

    preflight = {**origin_header, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type"}
    for path in ("/api/checkout", "/api/auth/sign-in/email"):
        label = "OPTIONS " + path
        code, headers, _ = read(opener, api + path, timeout, method="OPTIONS", headers=preflight)
        require(200 <= code < 300, f"{label} returned HTTP {code}")
        verify_cors(headers, site, label, preflight=True)
    print(f"Checkout quote review, Stripe {stripe_mode} configuration, and storefront login preflight passed.")


class SearchPage(HTMLParser):
    def __init__(self, body):
        super().__init__()
        self.canonicals = []
        self.noindex = False
        self.heading_count = 0
        self.titles = []
        self.descriptions = []
        self.checkout_mode = None
        self.inquiry_mode = None
        self.schema = []
        self._json_ld = None
        self._title = None
        self.feed(body.decode("utf-8"))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "link" and (attrs.get("rel") or "").lower() == "canonical":
            self.canonicals.append(attrs.get("href"))
        if tag == "meta" and (attrs.get("name") or "").lower() in ("robots", "googlebot"):
            self.noindex |= bool(re.search(r"\bnoindex\b", attrs.get("content") or "", re.I))
        if tag == "meta" and (attrs.get("name") or "").lower() == "description":
            self.descriptions.append(attrs.get("content"))
        if tag == "title":
            self._title = []
        if tag == "h1":
            self.heading_count += 1
        if tag == "main" and attrs.get("id") == "main":
            self.checkout_mode = attrs.get("data-checkout-mode")
            self.inquiry_mode = attrs.get("data-inquiry-mode")
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self._json_ld = []

    def handle_data(self, data):
        if self._json_ld is not None:
            self._json_ld.append(data)
        if self._title is not None:
            self._title.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self._json_ld is not None:
            self.schema.append("".join(self._json_ld))
            self._json_ld = None
        if tag == "title" and self._title is not None:
            self.titles.append("".join(self._title).strip())
            self._title = None


def xml(path, body, root_tag):
    try:
        tree = ElementTree.fromstring(body)
    except ElementTree.ParseError as error:
        raise VerificationError(f"{path} is not valid XML") from error
    require(tree.tag.rsplit("}", 1)[-1] == root_tag, f"{path} has the wrong XML root")
    return tree


def xml_signature(node):
    return (node.tag, tuple(sorted(node.attrib.items())), (node.text or "").strip(),
            tuple(sorted(xml_signature(child) for child in node)))


def compare_live_xml(opener, site, timeout, local_file, tag, label):
    name = local_file.name
    code, _, body = read(opener, f"{site}/{name}", timeout)
    require(code == 200, f"GET /{name} returned HTTP {code}")
    expected = xml(name, local_file.read_bytes(), tag)
    published = xml(name, body, tag)
    require(xml_signature(expected) == xml_signature(published), f"The live {label} differs from the verified export.")
    return expected


def sitemap_locations(sitemap, site):
    locations = [row.findtext("{*}loc") for row in sitemap.findall("{*}url")]
    require(locations and all(
        loc and f"{urlsplit(loc).scheme}://{urlsplit(loc).netloc}" == site for loc in locations
    ), "The export sitemap must target the storefront being checked.")
    canonical = [site if urlsplit(loc).path in ("", "/") else loc for loc in locations]
    require(
        len(set(canonical)) == len(canonical) and all(not urlsplit(loc).query and not urlsplit(loc).fragment for loc in locations),
        "The export sitemap contains a duplicate or non-canonical URL",
    )
    return canonical


def exported_page(exported, label):
    path = Path(unquote(label).lstrip("/"))
    require(not path.is_absolute() and ".." not in path.parts, f"Invalid export path: {label}")
    source = exported / path
    if label != "/" and source.with_name(source.name + ".html").is_file():
        source = source.with_name(source.name + ".html")
    else:
        source /= "index.html"
    require(source.is_file(), f"The export has no HTML for {label}")
    return SearchPage(source.read_bytes())


def product_data(page, label):
    try:
        nodes = [json.loads(raw) for raw in page.schema]
    except json.JSONDecodeError as error:
        raise VerificationError(f"{label} has invalid structured data") from error
    products = [node for node in nodes if isinstance(node, dict) and node.get("@type") in ("Product", "ProductGroup")]
    require(len(products) == 1, f"{label} has no unique product markup")
    return products[0]


def product_offers(page, label):
    product = product_data(page, label)
    variants = product.get("hasVariant") if product.get("@type") == "ProductGroup" else [product]
    require(isinstance(variants, list) and variants, f"{label} has no product offers")

    offers = {}
    for variant in variants:
        sku = variant.get("sku") if isinstance(variant, dict) else None
        require(isinstance(sku, str) and sku and sku not in offers, f"{label} has a missing or duplicate SKU")
        offer = variant.get("offers")
        require(isinstance(offer, dict) and offer.get("priceCurrency") == "USD", f"{label} has an invalid USD offer for {sku!r}")
        price = offer.get("price")
        status = offer.get("availability")
        require(isinstance(price, str) and re.fullmatch(r"[0-9]+\.[0-9]{2}", price), f"{label} has an invalid price for {sku!r}")
        require(status in ("https://schema.org/InStock", "https://schema.org/OutOfStock"), f"{label} has invalid availability for {sku!r}")
        cents = int(price.replace(".", ""))
        in_stock = status == "https://schema.org/InStock"
        require(cents > 0 or not in_stock, f"{label} has in-stock availability with a zero price for {sku!r}")
        offers[sku] = (cents, in_stock)
    return {sku: offer for sku, offer in offers.items() if offer[0] > 0}


def current_catalog(opener, api, site, timeout):
    route = "/api/catalog/offer?catalog=1"
    label = "GET " + route
    code, headers, body = read(opener, api + route, timeout, headers={"Origin": site})
    require(code == 200, f"{label} returned HTTP {code}")
    verify_cors(headers, site, label)
    data = json_response(headers, body, label)
    require(isinstance(data, dict) and isinstance(data.get("catalog"), list), f"{label} returned an invalid catalog response")
    catalog = {}
    for product in data["catalog"]:
        slug = product.get("slug") if isinstance(product, dict) else None
        require(
            isinstance(slug, str) and len(slug) <= 140 and re.fullmatch(PRODUCT_SLUG, slug)
            and slug not in catalog and isinstance(product.get("offers"), list),
            f"{label} returned an invalid or duplicate product",
        )
        offers = {}
        for offer in product["offers"]:
            require(isinstance(offer, dict), f"{label} returned an invalid offer for {slug}")
            sku, cents, stock = (offer.get(key) for key in ("sku", "unitPriceCents", "stock"))
            require(
                isinstance(sku, str) and sku and sku not in offers
                and type(cents) is int and cents > 0 and type(stock) is int and stock >= 0,
                f"{label} returned an invalid offer or duplicate SKU for {slug}",
            )
            offers[sku] = (cents, stock > 0)
        catalog[slug] = offers
    return catalog


def offer_differences(slug, expected, observed, source):
    issues = []
    stock_text = {True: "in stock", False: "out of stock"}
    for sku in sorted(expected.keys() - observed.keys()):
        issues.append(f"{slug} SKU {sku!r} is in the export but unavailable in the {source}")
    for sku in sorted(observed.keys() - expected.keys()):
        issues.append(f"{slug} SKU {sku!r} from the {source} is missing from the export")
    for sku in sorted(expected.keys() & observed.keys()):
        expected_price, expected_stock = expected[sku]
        price, in_stock = observed[sku]
        if price != expected_price:
            old = f"${expected_price // 100}.{expected_price % 100:02}"
            new = f"${price // 100}.{price % 100:02}"
            issues.append(f"{slug} SKU {sku!r} price differs (export {old}, {source} {new})")
        if in_stock != expected_stock:
            issues.append(f"{slug} SKU {sku!r} availability differs (export {stock_text[expected_stock]}, {source} {stock_text[in_stock]})")
    return issues


def verify_catalog(opener, api, site, timeout, exported, published=None):
    sitemap = xml("sitemap.xml", (exported / "sitemap.xml").read_bytes(), "urlset")
    locations = sitemap_locations(sitemap, site)
    slugs = set()
    for url in locations:
        path = urlsplit(url).path
        if path.startswith("/products/"):
            match = re.fullmatch(rf"/products/({PRODUCT_SLUG})/?", path)
            require(match and len(match[1]) <= 140, "The export sitemap contains an invalid product URL")
            slugs.add(match[1])
    require(slugs, "The export sitemap has no product pages to verify")

    catalog = current_catalog(opener, api, site, timeout)
    issues = [f"Active product {slug!r} is missing from the export" for slug in sorted(catalog.keys() - slugs)]
    issues += [f"Exported product {slug!r} is no longer active" for slug in sorted(slugs - catalog.keys())]
    count = 0
    for slug in sorted(slugs):
        path = f"/products/{slug}"
        exported_data = product_offers(exported_page(exported, path), path)
        count += len(exported_data)
        if slug in catalog:
            issues.extend(offer_differences(slug, exported_data, catalog[slug], "API"))
        if published is not None:
            issues.extend(offer_differences(slug, exported_data, product_offers(published[path], path), "published page"))
    require(not issues, "Catalog differences detected:\n" + "\n".join(issues))
    print(f"Verified current price and availability for {len(slugs)} product pages and {count} SKUs.")


def indexable_page(opener, timeout, url, robots):
    label = urlsplit(url).path or "/"
    require(robots.can_fetch("Googlebot", url), f"robots.txt blocks Googlebot on {label}")
    for attempt in range(3):
        try:
            code, headers, body = read(opener, url, timeout)
            if code not in RETRYABLE_HTTP or attempt == 2:
                break
        except ResponseReadError:
            if attempt == 2:
                raise
        sleep(0.5 * (attempt + 1))
    require(code == 200, f"GET {label} returned HTTP {code}")
    require(headers.get_content_type() == "text/html", f"{label} did not return HTML")
    document = SearchPage(body)
    header_noindex = re.search(r"\bnoindex\b", ",".join(headers.get_all("X-Robots-Tag") or []), re.I)
    require(not (document.noindex or header_noindex), f"{label} has a noindex directive")
    require(document.canonicals == [url] and document.heading_count == 1, f"{label} has unexpected canonical or main heading markup")
    return document


def verify_inquiry_form(opener, site, timeout, exported):
    contact = exported / "contact.html"
    if not contact.is_file() or SearchPage(contact.read_bytes()).inquiry_mode != "online":
        return
    code, headers, body = read(opener, site + "/contact", timeout)
    require(code == 200 and headers.get_content_type() == "text/html" and SearchPage(body).inquiry_mode == "online",
            "Live inquiry form differs from the export")

    label = "GET /api/inquiries"
    code, headers, body = read(opener, site + "/api/inquiries", timeout)
    require(code == 405 and tokens(headers, "Allow") == {"post"}, f"{label} did not return a POST-only response")
    require("noindex" in tokens(headers, "X-Robots-Tag") and "no-store" in tokens(headers, "Cache-Control"),
            f"{label} must prevent indexing and caching")
    require(json_response(headers, body, label) == {"error": "method"}, f"{label} returned unexpected data")
    print("The live inquiry endpoint is deployed and rejects read requests.")


def verify_front(opener, site, timeout, exported, *, inquiry=False):
    verify_inquiry_form(opener, site, timeout, exported)
    sitemap = compare_live_xml(opener, site, timeout, exported / "sitemap.xml", "urlset", "sitemap")
    locations = sitemap_locations(sitemap, site)
    compare_live_xml(opener, site, timeout, exported / "google-feed.xml", "rss", "Shopping Feed")

    code, _, body = read(opener, site + "/robots.txt", timeout)
    require(code == 200, f"GET /robots.txt returned HTTP {code}")
    directives = [line.split("#", 1)[0].strip() for line in body.decode("utf-8-sig").splitlines()]
    require(any(key.lower().strip() == "sitemap" and value.strip() == site + "/sitemap.xml"
                for key, _, value in (line.partition(":") for line in directives)), "robots.txt does not point to the storefront sitemap.")
    robots = RobotFileParser()
    robots.parse(directives)

    def check(url):
        path = urlsplit(url).path or "/"
        try:
            page = indexable_page(opener, timeout, url, robots)
            source = exported_page(exported, path)
            require((page.titles, page.descriptions) == (source.titles, source.descriptions),
                    f"{path} search title or description differs from the export")
            if path.startswith("/products/"):
                if inquiry:
                    product = product_data(page, path)
                    variants = product.get("hasVariant", [])
                    require(isinstance(variants, list) and all(isinstance(variant, dict) for variant in variants),
                            f"{path} has invalid product variants")
                    require("offers" not in product and all("offers" not in variant for variant in variants),
                            f"{path} includes an offer in inquiry mode")
                    require(product == product_data(source, path), f"{path} product markup differs from the export")
                return path.removesuffix("/"), page, None
            return path, None, None
        except (VerificationError, UnicodeError, OSError) as error:
            return path, None, str(error)

    with ThreadPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(check, locations))
    issues = [error for _, _, error in results if error]
    require(not issues, f"{len(issues)} canonical pages failed verification:\n" + "\n".join(issues[:15]))
    print(f"Live sitemap and Shopping Feed match the export. Verified robots.txt and all {len(locations)} canonical pages.")
    return {path: page for path, page, _ in results if page is not None}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site-origin", type=origin, default="https://naracharm.com")
    parser.add_argument("--api-origin", type=origin, default="https://api.naracharm.com")
    parser.add_argument("--stripe-mode", choices=("live", "test"), default="live")
    parser.add_argument("--timeout", type=int, default=25, help="Timeout in seconds per HTTP request.")
    exports = parser.add_mutually_exclusive_group()
    exports.add_argument("--catalog-export", type=Path, help="Check the extracted export's offers against the current API before publishing.")
    exports.add_argument("--exported-site", type=Path, help="Verify the public storefront and current offers against this extracted static export.")
    args = parser.parse_args()
    if args.timeout < 1:
        parser.error("--timeout must be at least one second.")

    try:
        exported = args.catalog_export or args.exported_site
        checkout_file = exported / "checkout.html" if exported else None
        if checkout_file and checkout_file.is_file() and SearchPage(checkout_file.read_bytes()).checkout_mode == "inquiry":
            require(args.exported_site, "Use --exported-site to verify a storefront with online checkout paused.")
            site_opener = origin_opener(args.site_origin)
            verify_front(site_opener, args.site_origin, args.timeout, exported, inquiry=True)
            code, _, body = read(site_opener, args.site_origin + "/checkout", args.timeout)
            require(code == 200, f"GET /checkout returned HTTP {code}")
            checkout_page = SearchPage(body)
            require(checkout_page.checkout_mode == "inquiry" and checkout_page.noindex, "Published checkout did not match the inquiry-only export")
            print("Published storefront is open for inquiries. Online checkout is paused.")
            return 0

        api_opener = origin_opener(args.api_origin)
        verify_api(api_opener, args.api_origin, args.site_origin, args.timeout, args.stripe_mode)
        published = None
        if args.exported_site:
            site_opener = origin_opener(args.site_origin)
            published = verify_front(site_opener, args.site_origin, args.timeout, args.exported_site)
        if exported:
            verify_catalog(api_opener, args.api_origin, args.site_origin, args.timeout, exported, published)
    except (VerificationError, UnicodeError, OSError) as error:
        print(f"Release verification failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
