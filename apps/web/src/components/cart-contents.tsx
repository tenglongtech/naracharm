'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, ButtonLink } from '@/components/ui';

/**
 * 购物车 (客户端,本地状态演示)
 * Phase 3: 替换为 Server Action + carts/cart_lines 表,状态持久化到数据库 + cookie。
 * 当前用示例数据演示交互 (改数量/删除/小计/运费/总计)。
 */

const FREE_SHIPPING_THRESHOLD = 120;

// 演示购物车初始数据 (Phase 3 替换为真实 cart)
const INITIAL_ITEMS = [
  { id: '1', slug: 'amethyst-peace-bracelet', name: 'Amethyst Peace Bracelet', heritage: 'Handmade', variant: 'Medium (17cm)', priceCents: 3800, image: '/products/p01.jpg', qty: 1 },
  { id: '2', slug: 'obsidian-guard-charm', name: 'Obsidian Guard Phone Charm', heritage: 'Handmade', variant: 'Black', priceCents: 2800, image: '/products/p04.jpg', qty: 2 },
];

export function CartContents() {
  const [items, setItems] = useState(INITIAL_ITEMS);

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it))
    );
  };
  const removeItem = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id));

  const subtotalCents = items.reduce((sum, it) => sum + it.priceCents * it.qty, 0);
  const qualifiesFreeShipping = subtotalCents >= FREE_SHIPPING_THRESHOLD * 100;
  const shippingCents = qualifiesFreeShipping || subtotalCents === 0 ? 0 : 690;
  const totalCents = subtotalCents + shippingCents;
  const toFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD * 100 - subtotalCents);

  if (items.length === 0) {
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

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* 商品列表 */}
      <div>
        <h1 className="font-display text-3xl">Your Cart</h1>
        <p className="mt-1 text-sm text-muted">{items.length} item{items.length > 1 ? 's' : ''}</p>

        {/* 免运费进度 */}
        {toFreeShipping > 0 ? (
          <div className="mt-4 rounded-md bg-brand/10 px-4 py-3 text-sm text-brand">
            Add <strong>${(toFreeShipping / 100).toFixed(2)}</strong> more to qualify for free shipping.
          </div>
        ) : (
          <div className="mt-4 rounded-md bg-gold/15 px-4 py-3 text-sm text-ink">
            🎉 You&apos;ve unlocked free shipping!
          </div>
        )}

        <ul className="mt-6 divide-y divide-border">
          {items.map((it) => (
            <li key={it.id} className="flex gap-4 py-5">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-surface">
                <div className="flex h-full items-center justify-center text-[10px] text-muted/40">{it.image}</div>
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gold">{it.heritage}</p>
                    <Link href={`/products/${it.slug}`} className="font-display text-base hover:text-brand">{it.name}</Link>
                    <p className="text-xs text-muted">{it.variant}</p>
                  </div>
                  <p className="text-sm tabular-nums">${((it.priceCents * it.qty) / 100).toFixed(2)}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-md border border-border">
                    <button type="button" onClick={() => updateQty(it.id, -1)} aria-label={`Decrease ${it.name} quantity`} className="px-3 py-1.5 text-muted hover:text-ink">−</button>
                    <span className="w-8 text-center text-sm tabular-nums">{it.qty}</span>
                    <button type="button" onClick={() => updateQty(it.id, 1)} aria-label={`Increase ${it.name} quantity`} className="px-3 py-1.5 text-muted hover:text-ink">+</button>
                  </div>
                  <button type="button" onClick={() => removeItem(it.id)} className="text-xs text-muted underline hover:text-brand">Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <Link href="/collections" className="mt-4 inline-block text-sm text-brand hover:underline">← Continue shopping</Link>
      </div>

      {/* 订单摘要 */}
      <aside className="h-fit rounded-lg border border-border bg-surface p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-xl">Order Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tabular-nums">${(subtotalCents / 100).toFixed(2)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd className="tabular-nums">{shippingCents === 0 ? 'Free' : `$${(shippingCents / 100).toFixed(2)}`}</dd>
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-3 font-display text-lg">
            <dt>Total</dt>
            <dd className="tabular-nums">${(totalCents / 100).toFixed(2)}</dd>
          </div>
        </dl>
        <Link href="/checkout" className="mt-5 block">
          <Button className="w-full">Proceed to Checkout</Button>
        </Link>
        <p className="mt-3 text-center text-xs text-muted">🔒 Secure checkout · Taxes calculated at checkout</p>
        <div className="mt-4 flex justify-center gap-2 text-xs text-muted">Visa · Mastercard · Amex · PayPal · Apple Pay</div>
      </aside>
    </div>
  );
}
