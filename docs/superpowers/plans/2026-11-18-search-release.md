# Prepare the Nara Charm storefront for a search-ready release

- Keep the existing backend deployment topology and make the static build use isolated source files. Resolve completed output into the standard `apps/web/out` directory only after a successful build.
- Use the existing admin gallery to attach a stable, publicly hosted HTTPS product photograph. Require an authenticated administrator for gallery actions. Treat existing source images as unclassified until a merchant attaches the actual photo. A curated photo checked into `public/products/photos` can also be used.
- Generate storefront photo selection and Shopping Feed eligibility from the same snapshot. A product page with an actual photo passes its photo to search results and the sitemap. A preview or design illustration keeps its visibly identified artwork and is excluded from the feed.
- Bring About, Our Craft and machine-readable public guides in line with the studio direction, live shipping rates and documented collection details.
- Prove photo selection and feed output with fixture data, verify schema migration against an isolated database, run both production builds, and inspect the generated search metadata. External publishing and merchant product verification depend on the real store assets and release access.

## Verification

- The isolated release command exported the site without moving API or admin source directories. The production build and 19 regression tests passed. The mobile browser followed About, Our Craft and a related Journal article.
- A disposable PostgreSQL instance accepted the full migration history. The local browser verified a customer account could not open the image manager and an administrator could attach a photo. A fresh data export and static build then included that same test photo on the product page, in product structured data, in the image sitemap, and in the Shopping Feed. The audit matched feed price and availability to the product offer.
- The ordinary export passed canonical, link and noindex checks across 180 sitemap URLs and 107 articles. Its Shopping Feed has zero products because the current catalog has no merchant-confirmed product photography.
- Moving the Ant Design provider to admin layouts reduced the compressed JavaScript referenced by the homepage from 215,376 to 176,772 bytes in local static builds. This is a build measurement; deployed Core Web Vitals have not been measured.
- The live sitemap still lists 112 URLs. The production database migration, production rollout, actual product photos and Stripe sandbox checkout remain outside the verification completed here.

## Static image and metadata verification

- Static export generated 472 width-verified WebP files for 64 local images. The page uses a responsive `srcset` and a matching preload for its main image. The original product photo URL remained identical in the product schema, sitemap and Shopping Feed in a verified-photo fixture.
- Chromium at 390 CSS pixels and 2× device scale downloaded 41,824 bytes for the homepage hero, down from 159,344. The Miao filigree product image went from 234,034 to 89,792 bytes, and the first shop tile went from 140,160 to 20,034 bytes. All comparisons used fresh browser contexts and the same source images. These are lab image-transfer measurements.
- The static audit checked 180 indexable URLs for unique titles and descriptions, canonical URLs, existing image sources and feed consistency. An earlier export without responsive preloads failed the new preload check. The browser also passed shop filtering, add-to-cart and layouts from 320 to 1440 CSS pixels. All 22 regression tests passed in disposable PostgreSQL.
- A fresh comparison with the public sitemap found 101 URLs carried over, 79 additions and 11 archived guide URLs that still resolve locally with `noindex`.
