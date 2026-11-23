'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from '@/components/storefront-image';
import { ButtonLink } from '@/components/ui';
import {
  getLocalCart, updateLocalLineQuantity, removeLocalLine, subscribeToCart,
} from '@/lib/cart-local';
import { cartLineQuantityLimit, type CartView } from '@/lib/cart-types';
import { isExternalProductImage } from '@/lib/product-media';
import { freeShippingFromLabel } from '@/lib/store-policies';

function price(cents: number) {
  return '$' + (cents / 100).toFixed(2);
}

export function CartContents({ checkoutEnabled }: { checkoutEnabled: boolean }) {
  const [cart, setCart] = useState<CartView | null>(null);

  useEffect(() => {
    setCart(getLocalCart());
    return subscribeToCart(setCart);
  }, []);

  if (!cart) {
    return <p role="status" className="py-10 text-sm text-muted">Loading {checkoutEnabled ? 'your cart' : 'saved pieces'}…</p>;
  }

  if (cart.lines.length === 0) {
    return (
      <section aria-labelledby="cart-empty" className="border-y border-border bg-surface px-6 py-12 md:p-12">
        <h2 id="cart-empty" className="font-display text-2xl">{checkoutEnabled ? 'Your cart is empty' : 'No saved pieces'}</h2>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <ButtonLink href="/shop" className="min-h-11">Shop jewelry</ButtonLink>
          <Link href="/gift-guide" className="inline-flex min-h-11 items-center text-sm text-brand underline underline-offset-4">Browse gifts</Link>
        </div>
      </section>
    );
  }

  const inquiry = new URLSearchParams({ topic: 'product', message: [
    "I'd like to ask about these pieces:",
    ...cart.lines.map((item) => `${item.quantity} × ${item.productName} (SKU ${item.sku})`),
  ].join('\n').slice(0, 1400) });

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div>
        <p className="text-sm text-muted" role="status">{cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}</p>
        {checkoutEnabled && <p className="mt-3 border-y border-border bg-surface px-4 py-3 text-sm leading-6 text-ink" role="status">
          {cart.toFreeShippingCents > 0
            ? <>Add <strong>{price(cart.toFreeShippingCents)}</strong> in jewelry to reach free standard shipping at {freeShippingFromLabel}.</>
            : 'Your subtotal qualifies for free standard shipping.'}
          {' '}<Link href="/shipping" className="text-brand underline underline-offset-4">Delivery destinations</Link>
        </p>}

        <ul aria-label="Cart items" className="mt-4 divide-y divide-border border-b border-border">
          {cart.lines.map((item) => (
            <li key={item.lineId} className="grid grid-cols-[clamp(4.2rem,20vw,6rem)_minmax(0,1fr)] gap-3 py-5 sm:gap-5">
              <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                {item.image ? (
                  <Image
                    src={item.image}
                    unoptimized={isExternalProductImage(item.image)}
                    alt=""
                    fill
                    sizes="(max-width: 480px) 20vw, 96px"
                    className="object-cover"
                  />
                ) : (
                  <span className="grid h-full place-content-center px-2 text-center text-xs text-muted">Photo pending</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h2 className="max-w-full font-display text-lg leading-tight sm:text-xl">
                    <Link href={`/products/${item.productSlug}?sku=${encodeURIComponent(item.sku)}`} className="hover:text-brand">{item.productName}</Link>
                  </h2>
                  <p className="text-sm tabular-nums">{price(item.lineTotalCents)}</p>
                </div>
                {item.variantName && !/^(default|standard)$/i.test(item.variantName) && (
                  <p className="mt-1 text-xs text-muted">{item.variantName}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <div className="flex items-center border border-border">
                    <button
                      type="button"
                      onClick={() => updateLocalLineQuantity(item.lineId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label={`Decrease ${item.productName} quantity`}
                      className="h-11 w-11 text-muted hover:bg-surface hover:text-ink disabled:opacity-50"
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-sm tabular-nums">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateLocalLineQuantity(item.lineId, item.quantity + 1)}
                      disabled={item.quantity >= cartLineQuantityLimit(item.stock)}
                      aria-label={`Increase ${item.productName} quantity`}
                      className="h-11 w-11 text-muted hover:bg-surface hover:text-ink disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLocalLine(item.lineId)}
                    aria-label={`Remove ${item.productName}`}
                    className="min-h-11 text-xs text-muted underline underline-offset-4 hover:text-brand"
                  >
                    Remove
                  </button>
                </div>
                {item.quantity >= cartLineQuantityLimit(item.stock) && (
                  <p className="mt-1 text-xs text-muted">Quantity limit reached</p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <Link href="/shop" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-brand underline underline-offset-4">
          <span aria-hidden="true">←</span> Continue shopping
        </Link>
      </div>

      <aside className="h-fit border border-border bg-surface p-5 lg:sticky lg:top-28 lg:p-6" aria-labelledby="cart-summary">
        <h2 id="cart-summary" className="font-display text-2xl">{checkoutEnabled ? 'Order summary' : 'Ask about your selection'}</h2>
        {checkoutEnabled ? <>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tabular-nums">{price(cart.subtotalCents)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Estimated shipping</dt>
            <dd className="tabular-nums">{cart.shippingCents === 0 ? 'Free' : price(cart.shippingCents)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-border pt-3 font-display text-lg">
            <dt>Estimated total</dt>
            <dd className="tabular-nums">{price(cart.totalCents)} <span className="text-xs">USD</span></dd>
          </div>
        </dl>
        <ButtonLink href="/checkout" className="mt-5 min-h-12 w-full">Continue to checkout</ButtonLink>
        <p className="mt-3 text-xs leading-5 text-muted">Review your delivery address and available payment methods in secure Stripe Checkout.</p>
        </> : (
          <>
            <p className="mt-3 text-sm leading-6 text-muted">Send the list to confirm availability, pricing and delivery.</p>
            <ButtonLink href={`/contact?${inquiry}`} className="mt-5 min-h-12 w-full">Ask about these pieces</ButtonLink>
          </>
        )}
      </aside>
    </div>
  );
}
