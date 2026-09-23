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
      className="relative flex min-h-11 min-w-11 items-center justify-center hover:text-brand"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M4.5 8h15l-1 12h-13l-1-12Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] text-bg tabular-nums">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
