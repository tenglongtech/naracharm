'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { addToLocalCart } from '@/lib/cart-local';
import { cartLineQuantityLimit } from '@/lib/cart-types';
import { priceLabel } from '@/lib/catalog';
import { inquiryPath } from '@/lib/product-inquiry';
import { applyLiveOffer, type StorefrontVariant } from '@/lib/storefront-offer';
import { useProductOffers } from './product-offer-provider';
import { setProductVariant, useProductVariant } from './use-product-variant';
import styles from '@/app/products/[slug]/product-detail.module.css';

export function ProductPurchase({ product, variant, variants, checkoutEnabled }: {
  product: { id: string; name: string; slug: string; image: string | null; heritage: string | null };
  variant: StorefrontVariant;
  variants?: readonly StorefrontVariant[];
  checkoutEnabled: boolean;
}) {
  const offers = useProductOffers();
  const selected = applyLiveOffer(useProductVariant(variant, variants), offers);
  const fieldId = useId();

  return (
    <div className={styles.order}>
      {variants && variants.length > 1 && (
        <div className={styles.variantChoice}>
          <label htmlFor={fieldId}>Choose a variant</label>
          <select id={fieldId} value={selected.sku} onChange={(event) => setProductVariant(event.target.value, variant.sku)}>
            {variants.map((item) => {
              const { id, sku, name, stock } = applyLiveOffer(item, offers);
              return <option key={id} value={sku}>{name} · {sku}{checkoutEnabled && stock <= 0 ? ' · Sold out' : ''}</option>;
            })}
          </select>
          <p className={styles.variantPrice} aria-live="polite">{!checkoutEnabled && 'Guide price '}{priceLabel(selected.unitPriceCents)}</p>
        </div>
      )}
      <div className={styles.orderDetails}>
        {checkoutEnabled && <p className={styles.availability} data-in-stock={selected.stock > 0} aria-live="polite">
          {selected.stock > 0 ? 'Available to order' : 'Currently sold out'}
        </p>}
        <a href="#piece-fit">Size &amp; fit <span aria-hidden="true">↓</span></a>
      </div>
      {checkoutEnabled ? <AddToCartForm
        key={selected.id}
        productId={product.id}
        productSlug={product.slug}
        productName={product.name}
        variantId={selected.id}
        variantName={selected.name}
        sku={selected.sku}
        unitPriceCents={selected.unitPriceCents}
        image={selected.photoUrls?.[0] ?? product.image}
        heritage={product.heritage}
        maxStock={selected.stock}
      /> : (
        <Link prefetch={false} href={inquiryPath(product.name, selected.sku, selected.name)} className="shop-button">
          Inquire about this piece <span aria-hidden="true">↗</span>
        </Link>
      )}
    </div>
  );
}

export function ProductMeasurementsLink({ piece, variant, variants, measurements }: {
  piece: string;
  variant: StorefrontVariant;
  variants?: readonly StorefrontVariant[];
  measurements: string;
}) {
  const selected = useProductVariant(variant, variants);

  return (
    <Link prefetch={false} href={inquiryPath(piece, selected.sku, selected.name, { type: 'measurements', measurements })}>
      Ask for measurements <span aria-hidden="true">↗</span>
    </Link>
  );
}

/**
 * PDP 加购按钮 (client)
 * 数量调整 + 写入 localStorage 购物车 → header 徽标自动更新
 */
function AddToCartForm({
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
  const selectedQuantity = Math.min(qty, Math.max(1, limit));

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
        quantity: selectedQuantity,
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
            onClick={() => setQty(selectedQuantity - 1)}
            disabled={outOfStock || selectedQuantity <= 1}
            aria-label="Decrease quantity"
            className="min-h-12 min-w-11 text-muted hover:text-ink disabled:opacity-50"
          >
            −
          </button>
          <output aria-label="Selected quantity" className="min-w-5 text-center text-sm tabular-nums">{selectedQuantity}</output>
          <button
            type="button"
            onClick={() => setQty(selectedQuantity + 1)}
            disabled={outOfStock || selectedQuantity >= limit}
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
