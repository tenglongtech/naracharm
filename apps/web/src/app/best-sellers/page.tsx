import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { ProductTile } from '@/components/product-tile';
import { BEST_SELLERS, SAMPLE_PRODUCTS, type ProductCard } from '@/lib/sample-data';

/**
 * /best-sellers - 畅销页
 * 展示畅销 + 全部商品
 */
export const metadata: Metadata = {
  title: 'Best Sellers',
  description: 'The most-loved Nara Charm pieces — handmade jewelry our customers keep coming back for.',
};

export default function BestSellersPage() {
  // 全部商品 (除畅销外)
  const bestSlugs = new Set(BEST_SELLERS.map((p) => p.slug));
  const allProducts: ProductCard[] = SAMPLE_PRODUCTS.filter((p) => !bestSlugs.has(p.slug));

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
            {BEST_SELLERS.map((p) => (
              <ProductTile key={p.slug} product={p} />
            ))}
          </div>
        </section>

        {/* 全部商品 */}
        {allProducts.length > 0 && (
          <section className="border-t border-border">
            <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
              <h2 className="font-display text-2xl mb-8">All Pieces</h2>
              <div className="grid grid-cols-2 gap-5 md:grid-cols-4 lg:gap-6">
                {allProducts.map((p) => (
                  <ProductTile key={p.slug} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
