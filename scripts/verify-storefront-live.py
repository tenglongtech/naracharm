"""Read-only checks before switching the storefront and after deploying the static export."""

import argparse
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, ProxyHandler, Request, build_opener
from urllib.robotparser import RobotFileParser
from xml.etree import ElementTree

MAX_BODY = 4 * 1024 * 1024
LOOPBACK = ("localhost", "127.0.0.1", "::1")


class VerificationError(Exception):
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
    except (URLError, OSError) as error:
        raise VerificationError(f"{method} {route} could not connect ({type(getattr(error, 'reason', error)).__name__})") from error
    with response:
        try:
            body = response.read(MAX_BODY + 1)
        except OSError as error:
            raise VerificationError(f"{method} {route} body could not be read") from error
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
        self.feed(body.decode("utf-8"))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "link" and (attrs.get("rel") or "").lower() == "canonical":
            self.canonicals.append(attrs.get("href"))
        if tag == "meta" and (attrs.get("name") or "").lower() in ("robots", "googlebot"):
            self.noindex |= bool(re.search(r"\bnoindex\b", attrs.get("content") or "", re.I))
        if tag == "h1":
            self.heading_count += 1


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


def verify_front(opener, site, timeout, exported):
    sitemap = compare_live_xml(opener, site, timeout, exported / "sitemap.xml", "urlset", "sitemap")
    locations = [row.findtext("{*}loc") for row in sitemap.findall("{*}url")]
    require(locations and all(
        loc and f"{urlsplit(loc).scheme}://{urlsplit(loc).netloc}" == site for loc in locations
    ), "The export sitemap must target the storefront being checked.")
    compare_live_xml(opener, site, timeout, exported / "google-feed.xml", "rss", "Shopping Feed")

    code, _, body = read(opener, site + "/robots.txt", timeout)
    require(code == 200, f"GET /robots.txt returned HTTP {code}")
    directives = [line.split("#", 1)[0].strip() for line in body.decode("utf-8-sig").splitlines()]
    require(any(key.lower().strip() == "sitemap" and value.strip() == site + "/sitemap.xml"
                for key, _, value in (line.partition(":") for line in directives)), "robots.txt does not point to the storefront sitemap.")
    robots = RobotFileParser()
    robots.parse(directives)

    choices = {loc.removesuffix("/") for loc in locations}
    samples = [site] + [site + path for path in ("/shop", "/studio", "/blog") if site + path in choices]
    for prefix in ("/products/", "/blog/"):
        sample = min((url for url in choices if url.startswith(site + prefix)), default=None)
        if sample:
            samples.append(sample)
    for url in samples:
        label = urlsplit(url).path or "/"
        require(robots.can_fetch("Googlebot", url), f"robots.txt blocks Googlebot on {label}")
        code, headers, body = read(opener, url, timeout)
        require(code == 200, f"GET {label} returned HTTP {code}")
        require(headers.get_content_type() == "text/html", f"{label} did not return HTML")
        document = SearchPage(body)
        header_noindex = re.search(r"\bnoindex\b", ",".join(headers.get_all("X-Robots-Tag") or []), re.I)
        require(not (document.noindex or header_noindex), f"{label} has a noindex directive")
        require(document.canonicals == [url] and document.heading_count == 1, f"{label} has unexpected canonical or main heading markup")
    print(f"Live sitemap and Shopping Feed match the export. Verified robots.txt and {len(samples)} representative pages.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site-origin", type=origin, default="https://naracharm.com")
    parser.add_argument("--api-origin", type=origin, default="https://api.naracharm.com")
    parser.add_argument("--stripe-mode", choices=("live", "test"), default="live")
    parser.add_argument("--timeout", type=int, default=25, help="Timeout in seconds per HTTP request.")
    parser.add_argument("--exported-site", type=Path, help="Also verify the public storefront against this extracted static export.")
    args = parser.parse_args()
    if args.timeout < 1:
        parser.error("--timeout must be at least one second.")

    try:
        verify_api(origin_opener(args.api_origin), args.api_origin, args.site_origin, args.timeout, args.stripe_mode)
        if args.exported_site:
            verify_front(origin_opener(args.site_origin), args.site_origin, args.timeout, args.exported_site)
    except (VerificationError, UnicodeError, OSError) as error:
        print(f"Release verification failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
