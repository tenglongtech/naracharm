import argparse
import hashlib
import json
import re
import sys
from collections import deque
from html.parser import HTMLParser
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import parse_qsl, unquote, urlsplit
from xml.etree import ElementTree
from zipfile import ZIP_DEFLATED, ZipFile

MERCHANT_NS = "{http://base.google.com/ns/1.0}"


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.h1_count = 0
        self.canonical = []
        self.robots = []
        self.titles = []
        self.descriptions = []
        self.social = {}
        self.links = []
        self.ids = set()
        self.schema = []
        self.images = []
        self.image_preloads = []
        self.assets = []
        self.checkout_mode = None
        self.inquiry_mode = None
        self._json_ld = None
        self._title = None
        self.feed(path.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("id"):
            self.ids.add(attrs["id"])
        if tag == "main" and attrs.get("id") == "main":
            self.checkout_mode = attrs.get("data-checkout-mode")
            self.inquiry_mode = attrs.get("data-inquiry-mode")
        property_name = attrs.get("property") or attrs.get("name") or ""
        if tag == "meta" and property_name.startswith(("og:", "twitter:")):
            self.social.setdefault(property_name, []).append(attrs.get("content") or "")
        href = attrs.get("href") or ""
        if tag == "h1":
            self.h1_count += 1
        elif tag == "title":
            self._title = []
        elif tag == "meta" and attrs.get("name") == "description":
            self.descriptions.append(attrs.get("content") or "")
        elif tag == "link" and attrs.get("rel") == "canonical":
            self.canonical.append(href)
        elif tag == "meta" and attrs.get("name") in ("robots", "googlebot"):
            self.robots.append(attrs.get("content") or "")
        elif tag == "a" and href.startswith("/") and not href.startswith("//"):
            self.links.append(href)
        elif tag == "script":
            if attrs.get("type") == "application/ld+json":
                self._json_ld = []
            if attrs.get("src"):
                self.assets.append(attrs["src"])
        elif tag == "img":
            self.images.append(attrs)
        elif tag == "link" and attrs.get("rel") == "preload" and attrs.get("as") == "image":
            self.image_preloads.append(attrs)
        elif tag == "link" and attrs.get("rel") in ("stylesheet", "modulepreload", "preload", "icon"):
            self.assets.append(href)

    def handle_data(self, data):
        if self._json_ld is not None:
            self._json_ld.append(data)
        if self._title is not None:
            self._title.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self._json_ld is not None:
            self.schema.append(json.loads("".join(self._json_ld)))
            self._json_ld = None
        if tag == "title" and self._title is not None:
            self.titles.append("".join(self._title))
            self._title = None


def exported_path(root, url):
    path = unquote(urlsplit(url).path).strip("/")
    if not path:
        return root / "index.html"
    if ".." in Path(path).parts:
        return None
    filename = root / path
    for candidate in (filename, filename.parent / (filename.name + ".html"), filename / "index.html"):
        if candidate.is_file():
            return candidate
    return None


def check_image_assets(page, url, root, problems):
    srcsets = [item["srcset"] for item in page.images if item.get("srcset")]
    srcsets += [item["imagesrcset"] for item in page.image_preloads if item.get("imagesrcset")]
    sources = [item.get("src", "") for item in page.images]
    for srcset in srcsets:
        for candidate in srcset.split(","):
            parts = candidate.strip().split()
            if parts and parts[0].startswith("/image/"):
                sources.append(parts[0])
    for source in sources:
        if source.startswith(("/products/", "/editorial/", "/image/")) and not exported_path(root, source):
            problems.add(f"Missing storefront image {source} on {url}")
    for asset in page.assets:
        if asset.startswith("/") and not asset.startswith("//") and not exported_path(root, asset):
            problems.add(f"Missing browser asset {asset} on {url}")

    if urlsplit(url).path in ("", "/"):
        hero = next((image for image in page.images if image.get("fetchpriority") == "high"), {})
        if not hero.get("srcset") or not any(
            preload.get("imagesrcset") == hero["srcset"] and preload.get("imagesizes") == hero.get("sizes")
            for preload in page.image_preloads
        ):
            problems.add("Home image needs matching responsive preload and image candidates")


def check_search_metadata(values, label, url, seen, problems):
    if len(values) != 1 or not values[0].strip():
        problems.add(f"Expected one nonempty {label} on {url}")
        return
    normalized = " ".join(values[0].split()).casefold()
    earlier = seen.setdefault(normalized, url)
    if earlier != url:
        problems.add(f"Duplicate {label} on {earlier} and {url}")


def is_noindex(page):
    return any("noindex" in value.lower() for value in page.robots)


def check_share_card(page, url, site_url, root, problems):
    social = page.social
    required = (
        "og:url", "og:type", "og:site_name", "og:title", "og:description", "og:image", "og:image:alt",
        "twitter:card", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt",
    )
    for tag in required:
        values = social.get(tag, [])
        if len(values) != 1 or not values[0].strip():
            problems.add(f"Share card missing one nonempty {tag} on {url}")
    if [value.rstrip("/") for value in social.get("og:url", [])] != [url.rstrip("/")]:
        problems.add(f"Open Graph URL differs from the canonical URL on {url}")
    suffix = " | " + next(iter(social.get("og:site_name", [])), "")
    def normalized_title(title):
        return title.removesuffix(suffix).removesuffix(" | Nara Charm")

    for title_tag, description_tag in (("og:title", "og:description"), ("twitter:title", "twitter:description")):
        if [normalized_title(title) for title in social.get(title_tag, [])] != [normalized_title(title) for title in page.titles]:
            problems.add(f"{title_tag} differs from the document title on {url}")
        if social.get(description_tag, []) != page.descriptions:
            problems.add(f"{description_tag} differs from the meta description on {url}")
    if social.get("twitter:card") != ["summary_large_image"] or social.get("og:image") != social.get("twitter:image"):
        problems.add(f"Open Graph and X must share one large image on {url}")
    for source in social.get("og:image", []):
        parsed = urlsplit(source)
        if parsed.scheme not in ("http", "https") or not parsed.hostname or parsed.username or parsed.password:
            problems.add(f"Invalid share image URL on {url}")
        elif f"{parsed.scheme}://{parsed.netloc}" == site_url and not exported_path(root, source):
            problems.add(f"Missing local share image {source} on {url}")


def check_home_discovery(pages, site_url, problems):
    if site_url not in pages:
        return 0

    depth = {site_url: 0}
    queue = deque([site_url])
    while queue:
        url = queue.popleft()
        for href in pages[url].links:
            target = site_url + urlsplit(href).path.rstrip("/")
            if target in pages and target not in depth:
                depth[target] = depth[url] + 1
                queue.append(target)

    for url in pages.keys() - depth.keys():
        problems.add(f"Sitemap page is unreachable from the home page through static links: {url}")
    return max(depth.values())


def check_previous_sitemap(root, previous_sitemap, site_url, pages, problems):
    baseline = ElementTree.parse(previous_sitemap).getroot()
    locations = {row.findtext("{*}loc") or "" for row in baseline.findall("{*}url")}
    if not locations or baseline.tag.split("}")[-1] != "urlset":
        raise ValueError("The previous sitemap must be a nonempty sitemap URL set")

    retained = retired = 0
    for url in sorted(locations):
        parsed = urlsplit(url)
        if f"{parsed.scheme}://{parsed.netloc}" != site_url or parsed.query or parsed.fragment:
            problems.add(f"Invalid URL in the previous sitemap: {url}")
        elif url.rstrip("/") in pages:
            retained += 1
        elif not (file := exported_path(root, url)):
            problems.add(f"Previous sitemap URL no longer has a page: {parsed.path}")
        elif not is_noindex(Page(file)):
            problems.add(f"Previous sitemap page is indexable but missing from the new sitemap: {parsed.path}")
        else:
            retired += 1
    return retained, retired


def html_routes(root, section):
    for file in sorted((root / section).rglob("*.html")):
        path = file.relative_to(root).with_suffix("")
        if path.name == "index":
            path = path.parent
        yield "/" + path.as_posix(), file


def check_page_coverage(root, site_url, pages, section, problems):
    rendered = {}
    excluded = 0
    for route, file in html_routes(root, section):
        url = site_url + route
        page = pages.get(url) or Page(file)
        if is_noindex(page):
            excluded += 1
        elif url not in pages:
            problems.add(f"Indexable {section} page is missing from the sitemap: {url}")
        rendered[url] = page
    return rendered, excluded


def check_offer_policy_definitions(site_url, pages, problems):
    seller_id = site_url + "/#organization"
    fields = (
        ("/shipping", "hasShippingService", "ShippingService"),
        ("/returns", "hasMerchantReturnPolicy", "MerchantReturnPolicy"),
    )
    refs = {}
    for route, field, node_type in fields:
        url = site_url + route
        page = pages.get(url)
        nodes = [
            schema[field] for schema in page.schema
            if schema.get("@id") == seller_id and isinstance(schema.get(field), dict)
        ] if page else []
        if len(nodes) != 1:
            problems.add(f"Expected one {node_type} definition on {url}")
            continue
        node = nodes[0]
        identifier = node.get("@id")
        fragment = urlsplit(identifier).fragment if isinstance(identifier, str) else ""
        if (
            node.get("@type") != node_type or not fragment or identifier != url + "#" + fragment
            or fragment not in page.ids
            or (field == "hasMerchantReturnPolicy" and node.get("merchantReturnLink") != url)
        ):
            problems.add(f"Invalid {node_type} definition or page anchor on {url}")
            continue
        refs[field] = {"@id": identifier}
    policies = {"seller": {"@id": seller_id}}
    if "hasShippingService" in refs:
        policies["shippingDetails"] = {"@type": "OfferShippingDetails", "hasShippingService": refs["hasShippingService"]}
    if "hasMerchantReturnPolicy" in refs:
        policies["hasMerchantReturnPolicy"] = refs["hasMerchantReturnPolicy"]
    return policies


def check_commerce(rows, all_product_pages, items, offer_policies, problems, checkout_enabled=True):
    sitemap_images = {
        (row.findtext("{*}loc") or "").rstrip("/"): [image.findtext("{*}loc") for image in row.findall("{*}image")]
        for row in rows
    }
    offers = {}
    available = 0
    for url, page in all_product_pages.items():
        products = [entry for entry in page.schema if entry.get("@type") in ("Product", "ProductGroup")]
        artwork = [entry for entry in page.schema if entry.get("@type") == "VisualArtwork"]
        if artwork:
            if (len(artwork) != 1 or products or is_noindex(page) or url not in sitemap_images
                or artwork[0].get("url") != url or "offers" in artwork[0]
                or not artwork[0].get("image") or artwork[0]["image"] != sitemap_images[url]):
                problems.add(f"Invalid studio design markup or sitemap images: {url}")
            continue
        if is_noindex(page):
            if products:
                problems.add(f"Design preview has product offer markup: {url}")
            continue
        if len(products) != 1:
            problems.add(f"Expected one product or product group: {url}")
            continue
        product = products[0]
        if not checkout_enabled and "offers" in product:
            problems.add(f"Inquiry-only page advertises an online offer: {url}")
        images = product.get("image", [])
        if images != sitemap_images.get(url, []):
            problems.add(f"Product page and sitemap list different photos: {url}")

        grouped = product.get("@type") == "ProductGroup"
        group = product.get("productGroupID") if grouped else None
        variants = product.get("hasVariant") if grouped else [product]
        if grouped and (not group or product.get("url") != url or not isinstance(variants, list) or len(variants) < 2):
            problems.add(f"Invalid product group: {url}")
            continue

        any_in_stock = False
        skus = set()
        combined_photos = set()
        for variant in variants:
            if not isinstance(variant, dict):
                problems.add(f"Invalid variant entry: {url}")
                continue
            sku = variant.get("sku")
            offer = variant.get("offers")
            if variant.get("@type") != "Product" or not sku or sku in skus:
                problems.add(f"Missing or duplicate product SKU: {url}")
                continue
            skus.add(sku)
            variant_images = variant.get("image", [])
            combined_photos.update(variant_images)
            if not checkout_enabled:
                if "offers" in variant:
                    problems.add(f"Inquiry-only page advertises an online offer: {url}")
                continue
            if not isinstance(offer, dict):
                problems.add(f"Missing product offer: {url}")
                continue
            availability = check_offer(offer, url, sku if grouped else None, offer_policies, problems)
            if not availability:
                continue
            in_stock, price = availability
            has_price = price != "0.00"
            any_in_stock |= in_stock and has_price
            if variant_images and has_price:
                offers[offer["url"]] = (variant_images, price + " USD", in_stock, product, variant)
        if combined_photos != set(images):
            problems.add(f"Product variants and sitemap list different photos: {url}")
        available += int(any_in_stock)

    feed_urls, feed_ids = set(), set()
    for item in items:
        url = (item.findtext(MERCHANT_NS + "link") or "").rstrip("/")
        identifier = item.findtext(MERCHANT_NS + "id")
        if not identifier or identifier in feed_ids or url in feed_urls:
            problems.add(f"Missing or duplicate Shopping Feed identifier: {url}")
        feed_ids.add(identifier)
        feed_urls.add(url)

        offer = offers.get(url)
        if not offer:
            problems.add(f"Feed item has no eligible photographed product offer: {url}")
            continue
        images, price, in_stock, product, variant = offer
        photo = item.findtext(MERCHANT_NS + "image_link")
        extra_photos = [node.text for node in item.findall(MERCHANT_NS + "additional_image_link")]
        if photo != images[0] or extra_photos != images[1:11]:
            problems.add(f"Feed photos differ from the product page or sitemap: {url}")
        if price != item.findtext(MERCHANT_NS + "price"):
            problems.add(f"Feed price differs from the product page: {url}")
        if ("in_stock" if in_stock else "out_of_stock") != item.findtext(MERCHANT_NS + "availability"):
            problems.add(f"Feed availability differs from the product page: {url}")
        if variant.get("name") != item.findtext(MERCHANT_NS + "title"):
            problems.add(f"Feed title differs from the product page: {url}")
        group = item.findtext(MERCHANT_NS + "item_group_id")
        option = item.find(MERCHANT_NS + "variant_option")
        if product.get("@type") == "ProductGroup":
            expected_option = variant.get("additionalProperty", {})
            if (
                group != product["productGroupID"]
                or item.findtext(MERCHANT_NS + "item_group_title") != product.get("name")
                or option is None
                or option.findtext(MERCHANT_NS + "name") != expected_option.get("name")
                or option.findtext(MERCHANT_NS + "value") != expected_option.get("value")
            ):
                problems.add(f"Feed variant grouping differs from the product page: {url}")
        elif group or option is not None:
            problems.add(f"Feed groups a single product without variants: {url}")

    for url in offers.keys() - feed_urls:
        problems.add(f"Photographed product is missing from the Shopping Feed: {url}")
    return available


def check_offer(offer, canonical, sku, offer_policies, problems):
    url = offer.get("url")
    if sku and isinstance(url, str):
        variant_url = urlsplit(url)
        valid_url = (
            variant_url._replace(query="", fragment="").geturl() == canonical
            and not variant_url.fragment
            and parse_qsl(variant_url.query, keep_blank_values=True) == [("sku", sku)]
        )
    else:
        valid_url = url == canonical
    for field, expected in offer_policies.items():
        if offer.get(field) != expected:
            problems.add(f"Product offer has an incorrect {field} reference: {url}")
    price = offer.get("price")
    availability = offer.get("availability")
    if not isinstance(price, str) or not re.fullmatch(r"(?:0|[1-9][0-9]*)\.[0-9]{2}", price):
        problems.add(f"Invalid product price: {url}")
        return None
    if not valid_url or offer.get("priceCurrency") != "USD" or availability not in (
        "https://schema.org/InStock", "https://schema.org/OutOfStock",
    ):
        problems.add(f"Invalid product offer details: {url}")
        return None
    return availability == "https://schema.org/InStock", price


def check_release_files(root, checkout, api_origin, problems):
    # Wrangler Direct Upload limits for Pages.
    files = sorted(file for file in root.rglob("*") if file.is_file() or file.is_symlink())
    if len(files) > 20_000:
        problems.add("Release exceeds the 20,000-file Wrangler upload limit")
    versions = {}
    for file in files:
        parts = file.relative_to(root).parts
        name = parts[-1]
        if file.is_symlink() or parts[0] in {"api", "admin", "admin-test", "functions"} or name.startswith(".env") or file.suffix == ".pem":
            problems.add(f"Unexpected file in the static release: {file.relative_to(root)}")
            continue
        elif file.stat().st_size > 25 * 1024 * 1024:
            problems.add(f"Asset exceeds the 25 MiB Pages limit: {file.relative_to(root)}")
            continue

        if parts[0] == "image":
            variant = re.fullmatch(r"([0-9a-f]{20})-([1-9][0-9]*)\.webp", name)
            share = re.fullmatch(r"share-([0-9a-f]{20})\.jpg", name)
            if len(parts) != 2 or not (variant or share):
                problems.add(f"Unexpected file in the immutable image directory: {file.relative_to(root)}")
            elif share:
                data = file.read_bytes()
                if not data.startswith(b"\xff\xd8\xff") or not hashlib.sha256(data).hexdigest().startswith(share[1]):
                    problems.add(f"Share JPEG fingerprint differs from its contents: {name}")
            else:
                key, width = variant.groups()
                versions.setdefault(key, []).append((int(width), file))

    for key, variants in versions.items():
        fingerprint = hashlib.sha256()
        for _, file in sorted(variants):
            fingerprint.update(file.read_bytes())
        if not fingerprint.hexdigest().startswith(key):
            problems.add(f"Responsive WebP fingerprint differs from its contents: {key}")

    for name in ("404.html", "_headers", "robots.txt", "sitemap.xml", "google-feed.xml"):
        if not (root / name).is_file():
            problems.add(f"Required Pages asset is missing: {name}")
    for filename in ("icon", "opengraph-image"):
        asset = root / filename
        if not asset.is_file() or not asset.read_bytes().startswith(bytes.fromhex("89504e470d0a1a0a")):
            problems.add(f"Expected a PNG serving at /{filename}")

    # The public API origin should be compiled into the checkout browser bundle.
    if checkout and not any(
        api_origin.encode() in script.read_bytes()
        for asset in checkout.assets
        if asset.startswith("/_next/static/") and urlsplit(asset).path.endswith(".js")
        if (script := exported_path(root, asset))
    ):
        problems.add("The checkout browser bundle does not contain the configured public API origin")
    return files


def write_release(root, files, archive, report):
    archive = archive.resolve()
    if archive.suffix != ".zip" or archive.is_relative_to(root):
        raise ValueError("The archive must be a .zip path outside the exported site")
    archive.parent.mkdir(parents=True, exist_ok=True)
    report_path = archive.with_suffix(".report.json")
    with TemporaryDirectory(dir=archive.parent, prefix=".storefront-") as directory:
        staged = Path(directory) / archive.name
        with ZipFile(staged, "w", compression=ZIP_DEFLATED, compresslevel=6) as package:
            for asset in files:
                package.write(asset, asset.relative_to(root).as_posix())
        with staged.open("rb") as handle:
            report["sha256"] = hashlib.file_digest(handle, "sha256").hexdigest()
        report["archive"] = archive.name
        report["archiveBytes"] = staged.stat().st_size
        staged_report = Path(directory) / report_path.name
        staged_report.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
        staged.replace(archive)
        staged_report.replace(report_path)
    print(f"Packaged {len(files)} files for Cloudflare Pages: {archive}")
    print(f"Release audit and SHA-256: {report_path}")


def audit(root, site_url=None, api_origin=None, archive=None, previous_sitemap=None):
    rows = ElementTree.parse(root / "sitemap.xml").findall("{*}url")
    urls = [row.findtext("{*}loc") or "" for row in rows]
    if not site_url and urls:
        first = urlsplit(urls[0])
        site_url = f"{first.scheme}://{first.netloc}"
    if not site_url:
        print("Empty sitemap", file=sys.stderr)
        return 1
    site_url = site_url.rstrip("/")
    problems = set()
    pages = {}
    titles, descriptions = {}, {}
    if len(set(urls)) != len(urls):
        problems.add("The sitemap contains duplicate URLs")
    for route in ("/", "/shop", "/collections", "/blog", "/studio"):
        if site_url + route not in urls:
            problems.add(f"Sitemap is missing a public entry page: {route}")
    for url in urls:
        parsed = urlsplit(url)
        if f"{parsed.scheme}://{parsed.netloc}" != site_url or parsed.query or parsed.fragment:
            problems.add(f"Invalid sitemap URL: {url}")
            continue
        file = exported_path(root, url)
        if not file or not file.is_file():
            problems.add(f"Sitemap URL has no static page: {url}")
            continue
        page = Page(file)
        pages[url.rstrip("/")] = page
        if [value.rstrip("/") for value in page.canonical] != [url.rstrip("/")]:
            problems.add(f"Canonical tag differs from sitemap URL: {url}")
        if page.h1_count != 1:
            problems.add(f"Expected one H1 at {url}, found {page.h1_count}")
        if is_noindex(page):
            problems.add(f"A noindex page appears in the sitemap: {url}")
        check_search_metadata(page.titles, "title", url, titles, problems)
        check_search_metadata(page.descriptions, "meta description", url, descriptions, problems)
        for href in page.links:
            if not exported_path(root, href):
                problems.add(f"Broken internal link {href} on {url}")
        check_image_assets(page, url, root, problems)
        check_share_card(page, url, site_url, root, problems)
    crawl_depth = check_home_discovery(pages, site_url, problems)
    migration = {}
    if previous_sitemap:
        retained, retired = check_previous_sitemap(root, previous_sitemap, site_url, pages, problems)
        migration = {"previousSitemap": {"retained": retained, "retiredNoindex": retired}}

    utility = {}
    for path in ("/cart", "/checkout", "/checkout/success", "/order-status", "/order/demo", "/search", "/login", "/register", "/forgot-password",
                 "/account", "/account/orders", "/account/profile", "/account/addresses", "/account/wishlist"):
        file = exported_path(root, path)
        page = Page(file) if file else None
        if not page or not is_noindex(page):
            problems.add(f"Utility page missing or indexable: {path}")
        else:
            utility[path] = page
            check_image_assets(page, site_url + path, root, problems)

    all_products, previews = check_page_coverage(root, site_url, pages, "products", problems)
    for url, product_page in all_products.items():
        if is_noindex(product_page):
            check_share_card(product_page, url, site_url, root, problems)
    check_page_coverage(root, site_url, pages, "blog", problems)
    items = ElementTree.parse(root / "google-feed.xml").findall("channel/item")
    checkout = utility.get("/checkout")
    checkout_enabled = not checkout or checkout.checkout_mode != "inquiry"
    if not checkout_enabled:
        if items:
            problems.add("Inquiry-only release advertises products in its Shopping Feed")
        if "/contact?topic=product" not in checkout.links:
            problems.add("Inquiry-only checkout is missing its contact link")
    offer_policies = check_offer_policy_definitions(site_url, pages, problems)
    available = check_commerce(rows, all_products, items, offer_policies, problems, checkout_enabled)
    robots = root / "robots.txt"
    if not robots.is_file() or f"Sitemap: {site_url}/sitemap.xml" not in robots.read_text().splitlines():
        problems.add("robots.txt does not point to the canonical sitemap")

    guide_count = sum(urlsplit(url).path.startswith("/blog/") and "/topic/" not in url for url in urls)
    print(f"{len(urls)} sitemap URLs, {guide_count} editorial articles, {len(items)} Shopping Feed items")
    files = check_release_files(root, checkout if checkout_enabled else None, api_origin, problems) if archive else []
    contact = pages.get(site_url + "/contact")
    if contact and contact.inquiry_mode == "online":
        routes = root / "_routes.json"
        worker = root / "_worker.js"
        if not worker.is_file() or not routes.is_file() or json.loads(routes.read_text()) != {
            "version": 1, "include": ["/api/inquiries"], "exclude": [],
        }:
            problems.add("Online inquiry form is missing its scoped Cloudflare worker")
        for route, topic in (("/shipping", "order"), ("/returns", "returns")):
            page = pages.get(site_url + route)
            if not page or f"/contact?topic={topic}" not in page.links:
                problems.add(f"Missing contact form link for {route}")
    if problems:
        for issue in sorted(problems):
            print(issue, file=sys.stderr)
        return 1
    print(f"Static titles, descriptions, canonicals, crawlability, indexing directives, browser assets and feed consistency passed. Maximum home-to-page link depth: {crawl_depth}.")
    if previous_sitemap:
        print(f"Previous sitemap: {retained} canonical pages retained and {retired} retired URLs still resolve with noindex.")
    if archive:
        write_release(root, files, archive, {
            "siteUrl": site_url,
            "apiOrigin": api_origin,
            "sitemapUrls": len(urls),
            "maxInternalLinkDepth": crawl_depth,
            "indexableArticles": guide_count,
            "onlineInquiry": bool(contact and contact.inquiry_mode == "online"),
            "checkoutMode": "online" if checkout_enabled else "inquiry",
            "catalogProducts": sum(any(node.get("@type") in ("Product", "ProductGroup") for node in page.schema) for page in all_products.values()),
            "indexableDesigns": sum(any(node.get("@type") == "VisualArtwork" for node in page.schema) for page in all_products.values()),
            "productsInStock": available,
            "designPreviews": previews + sum(any(node.get("@type") == "VisualArtwork" for node in page.schema) for page in all_products.values()),
            "shoppingFeedItems": len(items),
            "fileCount": len(files),
            **migration,
        })
    return 0


def main():
    parser = argparse.ArgumentParser(description="Audit a static Nara Charm storefront and optionally package it for Cloudflare Pages.")
    parser.add_argument("root", nargs="?", type=Path, default=Path("apps/web/out"))
    parser.add_argument("--site-url", help="Expected canonical site origin")
    parser.add_argument("--api-origin", help="Expected public API origin compiled into the checkout bundle")
    parser.add_argument("--archive", type=Path, help="Path to write a verified Pages ZIP")
    parser.add_argument("--previous-sitemap", type=Path, help="Local copy of the previous sitemap on the same domain")
    args = parser.parse_args()
    if args.archive and not (args.site_url and args.api_origin):
        parser.error("--archive requires --site-url and --api-origin")
    try:
        return audit(args.root.resolve(), args.site_url, args.api_origin, args.archive, args.previous_sitemap)
    except (OSError, ValueError, ElementTree.ParseError) as error:
        print(f"Static storefront audit failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
