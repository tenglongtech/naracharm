import Link from 'next/link';
import { ProductTile } from '@/components/product-tile';
import { SAMPLE_PRODUCTS } from '@/lib/sample-data';

/** /account/wishlist - 收藏夹 */
export default function WishlistPage() {
  const items = SAMPLE_PRODUCTS.slice(0, 3); // 演示
  return (
    <div>
      <h1 className="font-display text-3xl">Wishlist</h1>
      <p className="mt-2 text-muted">Pieces you&apos;ve saved for later.</p>
      {items.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:gap-6">
          {items.map((p) => (
            <div key={p.slug}>
              <ProductTile product={p} />
              <button className="mt-2 w-full rounded-md border border-border py-2 text-xs hover:border-brand hover:text-brand transition-colors">
                Move to Cart
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-border bg-surface p-12 text-center">
          <p className="text-muted">Your wishlist is empty.</p>
          <Link href="/collections" className="mt-3 inline-block text-sm text-brand hover:underline">Discover pieces →</Link>
        </div>
      )}
    </div>
  );
}
