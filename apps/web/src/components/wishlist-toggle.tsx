'use client';

import Link from 'next/link';
import { toggleWishlist, useWishlist } from '@/lib/wishlist-local';

export function WishlistToggle({ slug }: { slug: string }) {
  const saved = useWishlist().includes(slug);
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-5 text-sm text-brand">
      <button type="button" aria-pressed={saved} onClick={() => toggleWishlist(slug)} className="inline-flex min-h-11 items-center gap-2 underline underline-offset-4">
        <span aria-hidden="true">{saved ? '♥' : '♡'}</span> Save to wishlist
      </button>
      {saved && <Link className="inline-flex min-h-11 items-center underline underline-offset-4" href="/account/wishlist">View wishlist ↗</Link>}
    </div>
  );
}
