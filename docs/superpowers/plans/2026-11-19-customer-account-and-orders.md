# Connect customer accounts to live order history

- Share the explicit storefront origin allowlist between Better Auth and account and checkout endpoints. Preserve session cookies on API responses and use credentialed browser requests for authenticated checkout. Keep browser and backend on the same HTTPS site for split-host deployments.
- Record the authenticated buyer identity at checkout reservation. Preserve it across callbacks and require the same identity on retries. Keep guest orders and previously unowned orders accessible through order confirmation and support. Email alone never grants account access.
- Use an authenticated and private API for recent orders and tracking. Gate account pages using the actual session, enable sign-out and profile/password edits, and replace dummy personal information with truthful states.
- Verify preflight handling, isolation between two accounts and a guest purchase, duplicate-safe checkout settlement, and the static export calling a separate backend in a local browser. Apply the schema migration on a disposable PostgreSQL database before verification.

## Verification

- The cross-origin preflight test failed against the original auth route and passed after the route acquired explicit credentialed origin handling.
- All 23 isolated PostgreSQL regressions passed. Tests covered a paid order attached to a signed-in buyer, guest checkout with the same email, a second account, and checkout retries after the login session changed.
- Chromium used the static frontend on port 37260 and the local API on port 37261. Registration, sign-in, sign-out, profile changes, password changes, order tracking and browser wishlist persistence worked with test data.
- Both builds passed. The static export retained 180 sitemap URLs and passed the noindex audit for all private account routes. The ownership query, checkout retry and cookie response paths received a scoped self-review.
