# Nara Charm catalog and journal expansion

The local storefront will exceed 100 distinct product designs and 100 English guides. The work follows the existing cream and espresso storefront and Nara Charm’s heritage-inspired craft direction.

1. Preserve existing purchase data and URLs. Add eight themed studio collections with 10 distinct concepts each, grounded in materials, silhouettes and everyday use. Studio concepts have zero stock. They become saleable after the physical piece, production specifications, photography, price and backend variant are confirmed.
2. Add compact search, category, collection, price and availability controls. Keep studio previews discoverable through a dedicated index and linked collection pages. Improve the product detail experience and make unfinished support pages useful through the existing contact route.
3. Write practical guides and organize them into crawlable topic landing pages. Link guides to related articles and commerce pages by relevance. Keep existing article URLs. Route legacy articles with unresolved health claims to individual editorial review.
4. Recreate the two flagged product illustrations and add a studio editorial image. Visually validate the output before assigning any product photo path.
5. Generate a sitemap for indexable pages with known modification dates. Mark preview product pages and editorial review pages noindex. Keep product markup and feeds grounded in available checkout and image data, and replace blanket endorsements with verifiable details.
6. Verify data, links, indexing rules, build output and representative desktop and mobile journeys. The existing host and shop backend remain the deployment targets.

## Verification and launch dependencies

- The catalog contains 22 existing inventory-backed entries and 86 studio previews across 17 collections. Each of the eight new collections has an original lead illustration. The other 72 new designs have individual notes and palettes. The original six studio listings retain their planned prices.
- The journal contains 118 records. The 107 guides available to index and the seven topic hubs appear in the sitemap. Eleven legacy URLs show a review notice. Six studio stories were revised in place.
- The default production build generated 313 pages. The isolated Cloudflare-style static export also completed. The 180 sitemap URLs passed rendered checks for a single H1, self-canonical, indexing eligibility and working internal page links.

## November 19 editorial revision

- Rewrote 18 guides at their existing paths. Nine previously held guides returned to the public sitemap after their focus moved to material identification, fit, styling or care. Three wellness articles remain as non-indexable retirement pages with links to relevant reading.
- Added source links to material and care guides and used the same references in Article metadata. Three illustrated guides have responsive covers, and the topic landing pages link to featured guides with a correct category match. Product pages for selected amethyst and dyed howlite pieces link back to buying advice.
- The current local release contains 115 indexable guides across 188 sitemap URLs. A fresh public sitemap snapshot contained 112 URLs. The local sitemap retains 109 of those URLs, and the other three still resolve to retirement pages.
- The database-backed regression suite passed all 24 tests. Browser checks followed the topic, amethyst guide, catalog detail and return links at 320, 390 and 1440 pixels. The browser also checked article references, responsive artwork, legacy canonicals and the three retirement pages.
- Thirteen regression tests passed. Browser checks covered desktop, 390-pixel mobile, filters, search, a prefilled studio inquiry, journal navigation and a local cart addition.
- Production deployment and Stripe payment were outside these checks. The current checkout handler still reads the old server-side cart while the public storefront sends local cart lines. The Google Shopping feed currently contains no items because product imagery in use consists of labeled design illustrations.
