import { removePurchasedCartLines } from './cart-local';
import type { CartLineView } from './cart-types';
import { apiFetch } from './api';

const attemptKey = 'naracharm_checkout_attempt';
let attempt: { fingerprint: string; id: string } | undefined;

export async function readCheckoutResponse(path: string, init: RequestInit = {}, timeoutMs = 8_000) {
  const upstream = init.signal;
  const controller = new AbortController();
  const cancel = () => controller.abort(upstream?.reason);
  if (upstream?.aborted) cancel();
  else upstream?.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await apiFetch(path, { ...init, signal: controller.signal });
    const data = await response.json().catch((error: unknown) => {
      if (error instanceof SyntaxError) return null;
      throw error;
    });
    return { response, data };
  } catch (cause) {
    throw new Error('We couldn’t reach secure checkout. Your cart is saved. Try again.', { cause });
  } finally {
    clearTimeout(timer);
    upstream?.removeEventListener('abort', cancel);
  }
}

function readStorage(key: string) {
  try { return window.sessionStorage.getItem(key); } catch { return null; }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, value);
  } catch {
    // An in-memory attempt still covers retries with the page open.
  }
}

export async function checkoutAttempt(email: string, lines: CartLineView[], discountCode?: string) {
  const items = lines.map(({ productSlug, sku, variantId, quantity }) => ({ productSlug, sku, variantId, quantity }));
  const bytes = new TextEncoder().encode(JSON.stringify([email.trim().toLowerCase(), items, discountCode]));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const fingerprint = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  const saved = readStorage(attemptKey);
  if (!attempt && saved) {
    try { attempt = JSON.parse(saved); } catch { attempt = undefined; }
  }
  if (!attempt || attempt.fingerprint !== fingerprint) {
    attempt = { id: crypto.randomUUID(), fingerprint };
    writeStorage(attemptKey, JSON.stringify(attempt));
  }
  return { checkoutId: attempt.id, lines: items };
}

export function forgetCheckoutAttempt() {
  attempt = undefined;
  writeStorage(attemptKey, null);
}

export function rememberCheckoutCart(sessionId: string, checkoutId: string, lines: CartLineView[]) {
  writeStorage(`naracharm_checkout_cart/${sessionId}`, JSON.stringify({
    checkoutId, items: lines.map(({ lineId, quantity }) => ({ lineId, quantity })),
  }));
}

export function clearConfirmedItems(sessionId: string) {
  const key = `naracharm_checkout_cart/${sessionId}`;
  const snapshot = readStorage(key);
  if (!snapshot) return;
  writeStorage(key, null);
  const { checkoutId, items } = JSON.parse(snapshot) as {
    checkoutId: string;
    items: Pick<CartLineView, 'lineId' | 'quantity'>[];
  };
  removePurchasedCartLines(items);
  const current = attempt?.id ?? JSON.parse(readStorage(attemptKey) ?? 'null')?.id;
  if (current === checkoutId) forgetCheckoutAttempt();
}
