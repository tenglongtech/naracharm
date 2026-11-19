'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiFetch } from '@/lib/api';
import { priceLabel } from '@/lib/catalog';
import { applyLiveOffer, type LiveOffer, type StorefrontVariant } from '@/lib/storefront-offer';
import styles from '@/app/products/[slug]/product-detail.module.css';

const ProductOffers = createContext<ReadonlyMap<string, LiveOffer> | null>(null);

function isOffer(value: unknown): value is LiveOffer {
  if (!value || typeof value !== 'object') return false;
  const offer = value as Partial<LiveOffer>;
  return typeof offer.id === 'string' && typeof offer.sku === 'string'
    && typeof offer.unitPriceCents === 'number' && Number.isSafeInteger(offer.unitPriceCents) && offer.unitPriceCents > 0
    && typeof offer.stock === 'number' && Number.isSafeInteger(offer.stock) && offer.stock >= 0;
}

export function ProductOfferSection({ slug, className, headingId, children }: {
  slug: string | null;
  className: string;
  headingId: string;
  children: ReactNode;
}) {
  const [offers, setOffers] = useState<ReadonlyMap<string, LiveOffer> | null>(null);

  useEffect(() => {
    if (!slug) return;
    const query = new URLSearchParams({ slug });
    let lastAttempt = 0;
    let request: AbortController | undefined;

    async function refresh() {
      if (Date.now() - lastAttempt < 30_000) return;
      lastAttempt = Date.now();
      const controller = new AbortController();
      request = controller;
      const { signal } = controller;
      const timer = window.setTimeout(() => controller.abort(), 4_000);
      try {
        const response = await apiFetch(`/api/catalog/offer?${query}`, { credentials: 'omit', signal });
        if (!response.ok) return;
        const body: unknown = await response.json();
        if (signal.aborted || !body || typeof body !== 'object' || !('slug' in body) || body.slug !== slug
          || !('offers' in body) || !Array.isArray(body.offers) || !body.offers.every(isOffer)) return;
        setOffers(new Map(body.offers.map((offer) => [offer.id, offer])));
      } catch {
        // A transient outage leaves the last usable offer on the page. Checkout still checks the database.
      } finally {
        window.clearTimeout(timer);
      }
    }

    function refreshVisible() {
      if (document.visibilityState === 'visible') void refresh();
    }

    void refresh();
    window.addEventListener('focus', refreshVisible);
    document.addEventListener('visibilitychange', refreshVisible);
    return () => {
      request?.abort();
      window.removeEventListener('focus', refreshVisible);
      document.removeEventListener('visibilitychange', refreshVisible);
    };
  }, [slug]);

  return (
    <ProductOffers.Provider value={offers}>
      <section className={className} aria-labelledby={headingId}>{children}</section>
    </ProductOffers.Provider>
  );
}

export function useProductOffers() {
  return useContext(ProductOffers);
}

export function ProductOfferPrice({ variant, compareAt }: { variant: StorefrontVariant; compareAt: number | null }) {
  const offers = useProductOffers();
  const { unitPriceCents } = applyLiveOffer(variant, offers);

  return (
    <p className={styles.price} aria-live="polite">
      <span>{priceLabel(unitPriceCents)}</span>
      {unitPriceCents === variant.unitPriceCents && compareAt && compareAt > unitPriceCents ? (
        <del><span className="sr-only">Previous price </span>{priceLabel(compareAt)}</del>
      ) : null}
    </p>
  );
}
