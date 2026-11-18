# Move studio designs into the saleable catalog

- Let an authenticated merchant create a draft from any studio design. Reuse the design slug, name, collection and notes. Create a real SKU and zero stock in the same database transaction. Keep the planned price when one exists and allow a merchant to enter the final price, materials, care notes and inventory.
- Give the product editor access to the complete saved record. Apply stock edits atomically and preserve quantities already reserved for checkout. Provide the same starting SKU and inventory for a product created from scratch.
- Resolve each public product and collection slug once. When an active database record matches a preview, use the real offer on the existing URL and keep the compatible studio links. An inactive draft leaves the preview available.
- Export a deterministic saleable variant so catalog price, stock, add-to-cart identifiers, structured data and the Shopping Feed refer to the same displayed offer. Existing snapshots and browser carts still work for their existing single-SKU products.
- Verify the lifecycle in an isolated database, exercise the normal administrator UI and confirm canonical paths and offer data in a static export. Actual product approval, prices, inventory, photography and deployment are merchant inputs.

## Verification

- The 22-regression suite passed with disposable PostgreSQL. Concurrent draft imports reused one record, and stock edits respected checkout reservations and rejected stale quantities.
- In the administrator browser, a test merchant promoted Paper Moon Pendant with a $69 price and four units. The isolated static export published one entry at the existing canonical URL, exposed the matching SKU and price, and kept the illustration out of the Shopping Feed.
- The browser added the promoted physical variant to the cart at the exported price. The working catalog still uses its original snapshot.
