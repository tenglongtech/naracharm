'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { clearConfirmedItems, readCheckoutResponse } from '@/lib/checkout-browser';

type Confirmation =
  | { status: 'paid'; number: string; totalCents: number; currency: string }
  | { status: 'pending' | 'cancelled' | 'unknown' | 'unavailable' };

export function CheckoutConfirmation() {
  const sessionId = useSearchParams().get('session_id');
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!sessionId) return;
    const id = sessionId;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const signal = controller.signal;

    async function check(attempt: number) {
      try {
        const { response: result, data } = await readCheckoutResponse(`/api/checkout?session_id=${encodeURIComponent(id)}`, {
          signal, cache: 'no-store', credentials: 'same-origin',
        });
        const record = data as Confirmation | null;
        if (signal.aborted) return;
        if (result.ok && record?.status === 'paid') {
          setConfirmation(record);
          try { clearConfirmedItems(id); } catch { /* Confirmation still works when browser storage is unavailable. */ }
        } else if (result.ok && record?.status === 'cancelled') {
          setConfirmation(record);
        } else if (result.status === 400) {
          setConfirmation({ status: 'unknown' });
        } else if (result.status !== 404 && (!result.ok || !record)) {
          setConfirmation({ status: 'unavailable' });
        } else if (attempt < 8) {
          setConfirmation({ status: 'pending' });
          timer = setTimeout(() => void check(attempt + 1), 2_000);
        } else {
          setConfirmation({ status: result.status === 404 ? 'unknown' : 'pending' });
        }
      } catch {
        if (!signal.aborted) setConfirmation({ status: 'unavailable' });
      }
    }

    void check(1);
    return () => {
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [sessionId, refresh]);

  const status = sessionId ? confirmation?.status ?? 'checking' : 'unknown';
  return (
    <section aria-live="polite">
      {status === 'paid' && confirmation?.status === 'paid' ? (
        <>
          <h1 className="font-display text-5xl">Thank you for your order.</h1>
          <p className="mt-4 text-muted">Payment confirmed. Keep your order number for your records.</p>
          <dl className="mt-7 space-y-4 rounded-sm border border-border bg-surface p-6 text-left text-sm">
            <div className="flex justify-between gap-3"><dt>Order number</dt><dd className="font-semibold">{confirmation.number}</dd></div>
            <div className="flex justify-between gap-3"><dt>Total</dt><dd>{new Intl.NumberFormat('en-US', { style: 'currency', currency: confirmation.currency.toUpperCase() }).format(confirmation.totalCents / 100)}</dd></div>
          </dl>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-5">
            <Link href="/order-status" className="shop-button">Track an order</Link>
            <Link href={`/contact?topic=order&order=${encodeURIComponent(confirmation.number)}`} className="inline-flex min-h-11 items-center text-sm text-brand underline underline-offset-4">Get order help</Link>
          </div>
        </>
      ) : (
        <>
          <h1 className="font-display text-5xl">Payment status.</h1>
          <p className="mt-4 leading-7 text-muted">
            {status === 'cancelled' ? 'This checkout has ended. Your cart is ready if you want to try again.'
              : status === 'unknown' ? 'We could not find a payment for this link.'
              : status === 'unavailable' ? 'Payment confirmation is temporarily unavailable. Check again before creating another payment.'
              : 'We are waiting for Stripe to confirm your payment. This can take a moment.'}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-5">
            {status === 'cancelled' || !sessionId ? <Link href="/cart" className="shop-button">Return to your cart</Link>
              : <button type="button" className="shop-button" onClick={() => setRefresh((value) => value + 1)}>Check payment status</button>}
            <Link href="/contact?topic=order" className="inline-flex min-h-12 items-center text-sm text-brand underline underline-offset-4">Get order help</Link>
          </div>
        </>
      )}
    </section>
  );
}
