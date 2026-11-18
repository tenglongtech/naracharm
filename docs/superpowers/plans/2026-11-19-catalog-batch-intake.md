# Prepare a real catalog for bulk publication

- Reuse the studio design catalog and the existing merchant product, inventory and photo records. Provide downloadable CSV sheets for studio designs and active products awaiting a confirmed photo.
- Preview row-level validation before writing. Import new products and existing drafts at their stable URLs. Require explicitly supplied actual materials, price, stock, description and a confirmed photo for a batch publication row. A photo-only batch leaves active merchandise, prices and stock intact.
- Apply a checked batch in one transaction. Reject duplicate identities, changed records and writes to inventory when an active product should receive a photo-only update. Preserve SKU identity and inventory reservations.
- Use a disposable database to verify a complete batch at the target catalog size and check what appears in the static catalog, sitemap and Shopping Feed. Live quantities and photography come from merchant records.

## Verification

- All 27 database-backed regressions passed. A changed draft produced a stale-preview rejection, an injected failure rolled back preceding rows and SKUs, and a photo-only update preserved the item’s price and inventory.
- Chromium verified template downloads, disabled application of an invalid CSV, and applied 86 publication and 22 photo-only rows on a disposable merchant database. The existing product editor loaded its saved values and the create form opened with empty values. The editor no longer force-renders its hidden modal during hydration.
- The fixture exported 108 active product pages and 108 Shopping Feed items from 17 collections. The 274 sitemap URLs passed canonical, image, price and availability checks. The Paper Moon listing retained its design URL and displayed the exported SKU and price. Temporary fixture data remained separate from the working catalog.
