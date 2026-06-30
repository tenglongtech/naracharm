export const dynamic = "force-dynamic";
import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { ProductTile, type ProductCard } from '@/components/product-tile';
import { getActiveProducts } from '@/lib/storefront';

export const metadata: Metadata = {
  title: 'Best Sellers',
  description: 'The most-loved Nara Charm pieces — handmade jewelry our customers keep coming back for.',
};

function toCard(p: Awaited<ReturnType<typeof getActiveProducts>>[number]): ProductCard {
  return {
    slug: p.slug,
    name: p.name,
    heritage: p.heritage ?? 'Handmade',
    price: `$${(p.basePriceCents / 100).toFixed(0)}`,
    compareAt: p.compareAtPriceCents ? `$${(p.compareAtPriceCents / 100).toFixed(0)}` : null,
    tag: p.compareAtPriceCents ? 'Sale' : p.isFeatured ? 'Featured' : null,
    image: p.primaryImage ?? undefined,
  };
}

export default async function BestSellersPage() {
  const all = (await getActiveProducts()).map(toCard);
  const featured = all.filter((p) => p.tag === 'Featured' || p.tag === 'Sale');
  const best = featured.length > 0 ? featured : all.slice(0, 8);

  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* 头部 */}
        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-14 text-center md:py-16">
            <p className="text-xs uppercase tracking-[0.3em] text-brand">Loved by many</p>
            <h1 className="mt-3 font-display text-4xl md:text-5xl">Best Sellers</h1>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              The pieces our customers wear every day — and come back to gift.
            </p>
          </div>
        </section>

        {/* 畅销网格 */}
        <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <h2 className="font-display text-2xl mb-8">Most Loved</h2>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4 lg:gap-6">
            {best.map((p) => (
              <ProductTile key={p.slug} product={p} />
            ))}
          </div>
        </section>

        {/* 全部商品 */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
            <h2 className="font-display text-2xl mb-8">All Pieces</h2>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4 lg:gap-6">
              {all.map((p) => (
                <ProductTile key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
