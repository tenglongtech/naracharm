'use client';

import Link from 'next/link';

/**
 * 顶栏购物车图标 (client, 只负责渲染, count 由父级 server 传入)
 */
export function CartIcon({ count }: { count: number }) {
  return (
    <Link
      href="/cart"
      aria-label={`Shopping cart with ${count} item${count === 1 ? '' : 's'}`}
      className="hover:text-brand relative"
    >
      🛍️
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] text-bg tabular-nums">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
