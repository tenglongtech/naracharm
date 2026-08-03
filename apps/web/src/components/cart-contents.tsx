'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, ButtonLink } from '@/components/ui';
import {
  getLocalCart, updateLocalLineQuantity, removeLocalLine, subscribeToCart,
} from '@/lib/cart-local';
import type { CartView } from '@/lib/cart-types';

/**
 * 购物车 (client, localStorage 驱动)
 * 数据从 localStorage 读取,变更后 emit → 订阅组件自动更新
 */
export function CartContents() {
  const [cart, setCart] = useState<CartView | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setCart(getLocalCart());
    return subscribeToCart(setCart);
  }, []);

  if (!cart) {
    return <div className="py-12 text-center text-muted">Loading…</div>;
  }

  if (cart.lines.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-12 text-center">
        <p className="font-display text-xl">Your cart is empty</p>
        <p className="mt-2 text-sm text-muted">Every piece carries a story — find yours.</p>
        <div className="mt-6">
          <ButtonLink href="/collections">Start Shopping</ButtonLink>
        </div>
      </div>
    );
  }

  const onUpdate = (lineId: string, nextQty: number) => {
    setPending(true);
    try {
      setCart(updateLocalLineQuantity(lineId, nextQty));
    } finally {
      setPending(false);
    }
  };

  const onRemove = (lineId: string) => {
    setPending(true);
    try {
      setCart(removeLocalLine(lineId));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="font-display text-3xl">Your Cart</h1>
        <p className="mt-1 text-sm text-muted">
          {cart.itemCount} item{cart.itemCount > 1 ? 's' : ''}
        </p>

        {/* 免运费进度 */}
        {cart.toFreeShippingCents > 0 ? (
          <div className="mt-4 rounded-md bg-brand/10 px-4 py-3 text-sm text-brand">
            Add <strong>${(cart.toFreeShippingCents / 100).toFixed(2)}</strong> more to qualify for free shipping.
          </div>
        ) : (
          <div className="mt-4 rounded-md bg-gold/15 px-4 py-3 text-sm text-ink">
            🎉 You&apos;ve unlocked free shipping!
          </div>
        )}

        <ul className="mt-6 divide-y divide-border">
          {cart.lines.map((it) => (
            <li key={it.lineId} className="flex gap-4 py-5">
              <Link
                href={`/products/${it.productSlug}`}
                className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-surface"
              >
                {it.image ? (
                  <Image
                    src={it.image}
                    alt={it.productName}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-muted/40">
                    [img]
                  </div>
                )}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gold">{it.heritage || 'Handmade'}</p>
                    <Link
                      href={`/products/${it.productSlug}`}
                      className="font-display text-base hover:text-brand"
                    >
                      {it.productName}
                    </Link>
                    {it.variantName && it.variantName !== 'Standard' && (
                      <p className="text-xs text-muted">{it.variantName}</p>
                    )}
                  </div>
                  <p className="text-sm tabular-nums">${(it.lineTotalCents / 100).toFixed(2)}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-md border border-border">
                    <button
                      type="button"
                      onClick={() => onUpdate(it.lineId, it.quantity - 1)}
                      disabled={pending || it.quantity <= 1}
                      aria-label={`Decrease ${it.productName} quantity`}
                      className="px-3 py-1.5 text-muted hover:text-ink disabled:opacity-50"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm tabular-nums">{it.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onUpdate(it.lineId, it.quantity + 1)}
                      disabled={pending || it.quantity >= it.stock}
                      aria-label={`Increase ${it.productName} quantity`}
                      className="px-3 py-1.5 text-muted hover:text-ink disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(it.lineId)}
                    disabled={pending}
                    className="text-xs text-muted underline hover:text-brand"
                  >
                    Remove
                  </button>
                </div>
                {it.quantity >= it.stock && (
                  <p className="mt-1 text-[11px] text-amber-700">Max stock reached</p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <Link href="/collections" className="mt-4 inline-block text-sm text-brand hover:underline">
          ← Continue shopping
        </Link>
      </div>

      <aside className="h-fit rounded-lg border border-border bg-surface p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-xl">Order Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tabular-nums">${(cart.subtotalCents / 100).toFixed(2)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd className="tabular-nums">
              {cart.shippingCents === 0 ? 'Free' : `$${(cart.shippingCents / 100).toFixed(2)}`}
            </dd>
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-3 font-display text-lg">
            <dt>Total</dt>
            <dd className="tabular-nums">${(cart.totalCents / 100).toFixed(2)}</dd>
          </div>
        </dl>
        <Link href="/checkout" className="mt-5 block">
          <Button className="w-full" disabled={pending}>
            Proceed to Checkout
          </Button>
        </Link>
        <p className="mt-3 text-center text-xs text-muted">🔒 Secure checkout · Taxes calculated at checkout</p>
        <div className="mt-4 flex justify-center gap-2 text-xs text-muted">
          Visa · Mastercard · Amex · PayPal · Apple Pay
        </div>
      </aside>
    </div>
  );
}
