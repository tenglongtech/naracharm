'use client';

import { useSyncExternalStore } from 'react';

const storageKey = 'naracharm_wishlist_v1';
const changed = 'naracharm-wishlist-updated';
let fallback: string | null = null;

function readStored() {
  if (fallback !== null) return fallback;
  try {
    return window.localStorage.getItem(storageKey) ?? '[]';
  } catch {
    return '[]';
  }
}

function subscribe(onChange: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === storageKey || event.key === null) onChange();
  }
  window.addEventListener('storage', onStorage);
  window.addEventListener(changed, onChange);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(changed, onChange);
  };
}

function readSlugs(stored: string) {
  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((slug): slug is string => typeof slug === 'string') : [];
  } catch {
    return [];
  }
}

export function useWishlist() {
  return readSlugs(useSyncExternalStore(subscribe, readStored, () => '[]'));
}

export function toggleWishlist(slug: string) {
  const slugs = readSlugs(readStored());
  const next = JSON.stringify(slugs.includes(slug) ? slugs.filter((entry) => entry !== slug) : [...slugs, slug]);
  try {
    window.localStorage.setItem(storageKey, next);
    fallback = null;
  } catch {
    fallback = next;
  }
  window.dispatchEvent(new Event(changed));
}
