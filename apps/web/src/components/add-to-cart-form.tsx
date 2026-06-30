'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/lib/cart-actions';

/**
 * PDP 加购按钮 (client)
 * 数量调整 + 提交 → server action → router.refresh() → 顶部 cart badge 更新
 */
export function AddToCartForm({ productId, maxStock }: { productId: string; maxStock: number }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const outOfStock = maxStock <= 0;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await addToCart({ productId, quantity: qty });
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 2500);
      } catch (e: any) {
        setError(e.message || 'Could not add to cart');
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="contents">
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-md border border-border">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={outOfStock || qty <= 1}
            aria-label="Decrease quantity"
            className="px-3 py-3 text-muted hover:text-ink disabled:opacity-50"
          >
            −
          </button>
          <span className="w-10 text-center text-sm tabular-nums">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(maxStock, q + 1))}
            disabled={outOfStock || qty >= maxStock}
            aria-label="Increase quantity"
            className="px-3 py-3 text-muted hover:text-ink disabled:opacity-50"
          >
            +
          </button>
        </div>
        <button
          type="submit"
          disabled={pending || outOfStock}
          className="flex-1 rounded-md bg-brand px-8 py-3.5 text-sm font-medium tracking-wide text-bg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {outOfStock
            ? 'OUT OF STOCK'
            : pending
            ? 'ADDING…'
            : success
            ? '✓ ADDED TO CART'
            : 'ADD TO CART'}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
      {!outOfStock && maxStock < 10 && (
        <p className="mt-1 text-[11px] text-amber-700">Only {maxStock} left in stock</p>
      )}
    </form>
  );
}
