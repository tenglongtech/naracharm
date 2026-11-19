'use client';

import { useSyncExternalStore } from 'react';
import { variantQueryKey } from '@/lib/storefront-offer';

const skuChanged = 'naracharm:sku-change';

function subscribeToSku(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener(skuChanged, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(skuChanged, onChange);
  };
}

function skuFromLocation() {
  return new URLSearchParams(window.location.search).get(variantQueryKey);
}

export function useProductVariant<T extends { sku: string }>(fallback: T, variants?: readonly T[]) {
  const sku = useSyncExternalStore(subscribeToSku, skuFromLocation, () => null);
  return variants?.find((item) => item.sku === sku) ?? fallback;
}

export function setProductVariant(sku: string, defaultSku: string) {
  const url = new URL(window.location.href);
  if (sku === defaultSku) url.searchParams.delete(variantQueryKey);
  else url.searchParams.set(variantQueryKey, sku);
  if (url.href === window.location.href) return;
  window.history.pushState(null, '', url);
  window.dispatchEvent(new Event(skuChanged));
}
