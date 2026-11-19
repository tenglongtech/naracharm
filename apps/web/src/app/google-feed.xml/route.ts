import { renderGoogleFeed } from '@/lib/merchant-feed';
import { siteConfig } from '@/lib/site-config';
import { getActiveProducts } from '@/lib/storefront';

export const dynamic = 'force-static';

export async function GET() {
  const products = siteConfig.checkoutEnabled ? await getActiveProducts() : [];
  return new Response(renderGoogleFeed(products, siteConfig.url, siteConfig.brand), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
