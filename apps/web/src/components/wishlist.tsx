'use client';

import Link from 'next/link';
import { ProductTile, type ProductCard } from './product-tile';
import { toggleWishlist, useWishlist } from '@/lib/wishlist-local';

export function Wishlist({ products }: { products: ProductCard[] }) {
  const saved = useWishlist();
  const items = products.filter((product) => saved.includes(product.slug));
  return (
    <>
      <h1 className="font-display text-4xl tracking-tight">Wishlist</h1>
      <p className="mt-2 text-sm text-muted">Pieces saved in this browser.</p>
      {items.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3">
          {items.map((product) => (
            <li key={product.slug}>
              <ProductTile product={product} sizes="(max-width: 767px) 46vw, 280px" />
              <button type="button" onClick={() => toggleWishlist(product.slug)} aria-label={`Remove ${product.name} from wishlist`} className="mt-2 min-h-11 text-sm text-brand underline underline-offset-4">Remove</button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 border-t border-border pt-5">
          <p className="text-muted">Save a piece from its product page to find it here.</p>
          <Link href="/shop" className="shop-button mt-4">Shop jewelry ↗</Link>
        </div>
      )}
    </>
  );
}
