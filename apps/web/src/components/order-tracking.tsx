'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { orderProgress } from '@/lib/order-progress';
import type { TrackedOrder } from '@/lib/tracked-order';

type Result = { order: TrackedOrder } | { error: string; retryable: boolean };
const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });
const support = (
  <Link href="/contact?topic=order" className="inline-flex min-h-11 items-center text-sm text-brand underline underline-offset-4">
    Contact order support <span aria-hidden="true">↗</span>
  </Link>
);

export function OrderTracking() {
  const [token, setToken] = useState('');
  const [response, setResponse] = useState<Result | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    function readLink() {
      setToken(window.location.hash.slice(1));
      setResponse(null);
    }
    readLink();
    window.addEventListener('hashchange', readLink);
    return () => window.removeEventListener('hashchange', readLink);
  }, []);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    apiFetch('/api/order-status', {
      method: 'POST', body: JSON.stringify({ token }), signal: controller.signal,
    }).then(async (result) => {
      if (controller.signal.aborted) return;
      if (!result.ok) {
        setResponse(result.status === 404
          ? { error: 'This order link is invalid or has expired.', retryable: false }
          : { error: 'Order status is temporarily unavailable.', retryable: true });
        return;
      }
      const order = await result.json() as TrackedOrder;
      if (!controller.signal.aborted) setResponse({ order });
    }).catch(() => {
      if (!controller.signal.aborted) setResponse({ error: 'Order status is temporarily unavailable.', retryable: true });
    });
    return () => controller.abort();
  }, [token, revision]);

  if (!token) {
    return (
      <div className="mt-6">
        <p className="mb-2 max-w-prose text-sm leading-7 text-muted">Open the tracking link in your order confirmation or shipping email. If you ordered while signed in, you can also use <Link href="/account/orders" className="text-brand underline underline-offset-4">My orders</Link>.</p>
        {support}
      </div>
    );
  }

  if (!response) return <p role="status" className="mt-6 text-sm text-muted">Checking the status of your order…</p>;

  if ('error' in response) {
    return (
      <div className="mt-6 border-y border-border bg-surface p-5">
        <p role="alert" className="text-sm text-ink">{response.error}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-5">
          {response.retryable && <button type="button" className="inline-flex min-h-11 items-center text-sm text-brand underline underline-offset-4"
            onClick={() => { setResponse(null); setRevision((value) => value + 1); }}>Check again</button>}
          {support}
        </div>
      </div>
    );
  }

  const { order } = response;
  return (
    <section className="mt-7 border border-border bg-surface px-5 py-6 sm:px-7" aria-labelledby="tracking-title">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <h2 id="tracking-title" className="font-display text-2xl tracking-tight">Order {order.number}</h2>
        <p role="status" className="text-sm font-semibold text-brand">{orderProgress(order)}</p>
      </div>
      {order.shipments.length > 0 ? (
        <ul className="divide-y divide-border">
          {order.shipments.map(({ carrier, number, url, shippedAt }, index) => (
            <li key={index} className="py-4">
              <h3 className="font-display text-xl">{carrier}</h3>
              <p className="mt-1 text-sm text-muted">Shipped {date.format(new Date(shippedAt))}</p>
              {number && <p className="mt-1 break-words text-sm">Tracking number {number}</p>}
              {url && <a href={url} rel="noopener noreferrer" target="_blank" className="inline-flex min-h-11 items-center text-sm text-brand underline underline-offset-4">Track with {carrier} <span aria-hidden="true">↗</span></a>}
            </li>
          ))}
        </ul>
      ) : <p className="mt-4 text-sm leading-7 text-muted">Shipment details will appear here when available.</p>}
      <Link href={`/contact?topic=order&order=${encodeURIComponent(order.number)}`} className="mt-3 inline-flex min-h-11 items-center text-sm text-brand underline underline-offset-4">Get help with this order <span aria-hidden="true">↗</span></Link>
    </section>
  );
}
