import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { resolveSiteUrl } from '../apps/web/src/lib/site-url';
import { STATIC_PRODUCTS } from '../apps/web/src/lib/storefront-data';
import { renderGoogleFeed } from '../apps/web/src/lib/merchant-feed';

const output = resolve(__dirname, '../apps/web/.next/merchant-export/google-feed.xml');
const siteUrl = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL, 'production');
const feed = renderGoogleFeed(STATIC_PRODUCTS, siteUrl, process.env.NEXT_PUBLIC_BRAND_NAME || 'Nara Charm');
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, feed);
console.log(`Wrote ${(feed.match(/<item>/g) ?? []).length} products with actual product photos to ${output}`);
