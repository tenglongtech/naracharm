'use client';

import { useState } from 'react';
import Link from 'next/link';
import { addToLocalCart } from '@/lib/cart-local';
import { cartLineQuantityLimit } from '@/lib/cart-types';

/**
 * PDP 加购按钮 (client)
 * 数量调整 + 写入 localStorage 购物车 → header 徽标自动更新
 */
export function AddToCartForm({
  productId,
  productSlug,
  productName,
  variantId,
  variantName,
  sku,
  unitPriceCents,
  image,
  heritage,
  maxStock,
}: {
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantName: string | null;
  sku: string;
  unitPriceCents: number;
  image: string | null;
  heritage: string | null;
  maxStock: number;
}) {
  const [qty, setQty] = useState(1);
  const [result, setResult] = useState<{ quantity: number } | { error: string } | null>(null);

  const limit = cartLineQuantityLimit(maxStock);
  const outOfStock = limit <= 0;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    try {
      const cart = addToLocalCart({
        productId,
        productSlug,
        productName,
        variantId,
        variantName,
        sku,
        unitPriceCents,
        image,
        heritage,
        stock: maxStock,
        quantity: qty,
      });
      const quantity = cart.lines.find((line) => line.variantId === variantId)?.quantity ?? 0;
      setResult({ quantity });
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Could not add to cart.' });
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-stretch gap-2.5">
        <div role="group" aria-label="Quantity" className="flex items-center border border-border bg-bg">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={outOfStock || qty <= 1}
            aria-label="Decrease quantity"
            className="min-h-12 min-w-11 text-muted hover:text-ink disabled:opacity-50"
          >
            −
          </button>
          <output aria-label="Selected quantity" className="min-w-5 text-center text-sm tabular-nums">{qty}</output>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(limit, q + 1))}
            disabled={outOfStock || qty >= limit}
            aria-label="Increase quantity"
            className="min-h-12 min-w-11 text-muted hover:text-ink disabled:opacity-50"
          >
            +
          </button>
        </div>
        <button
          type="submit"
          disabled={outOfStock}
          className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#873e34] px-2.5 py-2 text-sm font-semibold text-bg transition-colors hover:bg-[#682d25] disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
        >
          {outOfStock ? 'Sold out' : 'Add to cart'} <span aria-hidden="true">→</span>
        </button>
      </div>
      <div role="status" className="text-sm text-muted">
        {result && 'quantity' in result && (
          <p className="mt-2 flex flex-wrap items-baseline gap-x-3">
            <span>{result.quantity} in your cart.</span>
            <Link href="/cart" className="inline-flex min-h-11 items-center text-brand underline underline-offset-4">View cart <span aria-hidden="true">↗</span></Link>
          </p>
        )}
      </div>
      {result && 'error' in result && <p role="alert" className="mt-2 text-sm text-brand">{result.error}</p>}
    </form>
  );
}
