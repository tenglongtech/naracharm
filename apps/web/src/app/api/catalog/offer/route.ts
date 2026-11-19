import { NextResponse } from 'next/server';
import { and, eq, sql } from 'drizzle-orm';
import { availableStock, inventory, products, productVariants } from '@jewelry/db';
import { db as connection, type DB } from '@/lib/db';
import { storefrontHeaders, unsupportedOrigin } from '@/lib/checkout-origin';
import { MAX_CART_LINE_QUANTITY } from '@/lib/cart-types';
import type { LiveOffer } from '@/lib/storefront-offer';

export const dynamic = 'force-dynamic';

const db: DB = connection;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(request: Request) {
  const headers = storefrontHeaders(request);
  if (unsupportedOrigin(request, headers)) return NextResponse.json({ error: 'Origin is not allowed' }, { headers, status: 403 });
  const params = new URL(request.url).searchParams;
  const slug = params.get('slug');
  const fullCatalog = params.get('catalog') === '1' && !params.has('slug');
  if (!fullCatalog && (params.has('catalog') || !slug || slug.length > 140 || !slugPattern.test(slug))) {
    return NextResponse.json({ error: 'Invalid product.' }, { headers, status: 400 });
  }

  try {
    const price = sql<number>`coalesce(${productVariants.priceCents}, ${products.basePriceCents})`;
    const rows = await db.select({
      slug: products.slug, id: productVariants.id, sku: productVariants.sku, unitPriceCents: price,
      quantity: inventory.quantity, reserved: inventory.reserved,
    }).from(products)
      .leftJoin(productVariants, eq(productVariants.productId, products.id))
      .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
      .where(and(eq(products.status, 'active'), slug ? eq(products.slug, slug) : undefined))
      .orderBy(products.slug, productVariants.id);

    const catalog = new Map<string, LiveOffer[]>();
    for (const row of rows) {
      const offers = catalog.get(row.slug) ?? [];
      catalog.set(row.slug, offers);
      const { id, sku, unitPriceCents, quantity, reserved } = row;
      if (!id || !sku || unitPriceCents <= 0 || quantity === null || reserved === null) continue;
      offers.push({ id, sku, unitPriceCents, stock: Math.min(MAX_CART_LINE_QUANTITY, availableStock({ quantity, reserved })) });
    }

    return NextResponse.json(slug
      ? { slug, offers: catalog.get(slug) ?? [] }
      : { catalog: Array.from(catalog, ([productSlug, offers]) => ({ slug: productSlug, offers })) }, { headers });
  } catch (error) {
    console.error('Product offer unavailable', error instanceof Error ? error.name : 'Unknown error');
    return NextResponse.json({ error: 'Product availability is temporarily unavailable.' }, { headers, status: 503 });
  }
}
