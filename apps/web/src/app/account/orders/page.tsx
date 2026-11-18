'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { AccountOrders } from '@/lib/account-orders';
import { apiFetch } from '@/lib/api';
import { orderProgress } from '@/lib/order-progress';

type Result = { data: AccountOrders } | { error: string };
const formatDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Result | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    apiFetch(`/api/account/orders?page=${page}`, { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error(response.status === 401 ? 'Your session ended. Sign in again to see your orders.' : 'We could not load your orders.');
      const data: AccountOrders = await response.json();
      if (!controller.signal.aborted) setResult({ data });
    }).catch((error) => {
      if (!controller.signal.aborted) setResult({ error: error instanceof Error ? error.message : 'We could not load your orders.' });
    });
    return () => controller.abort();
  }, [page, revision]);

  function changePage(value: number) {
    setResult(null);
    setPage(value);
  }

  return (
    <>
      <h1 className="font-display text-4xl tracking-tight">My orders</h1>
      {!result ? <p role="status" className="mt-5 text-muted">Loading orders…</p>
        : 'error' in result ? (
          <div className="mt-5">
            <p role="alert" className="text-muted">{result.error}</p>
            <button type="button" className="shop-button mt-4" onClick={() => { setResult(null); setRevision(revision + 1); }}>Try again</button>
          </div>
        ) : (
          <div className="mt-6">
            {result.data.orders.length ? (
              <ol className="divide-y divide-border border-y border-border">
                {result.data.orders.map((order) => (
                  <li key={order.number} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto] sm:gap-5">
                    <div>
                      <h2 className="font-display text-2xl">Order {order.number}</h2>
                      <p className="mt-1 text-sm text-muted">{formatDate.format(new Date(order.createdAt))}</p>
                      {order.items.length > 0 && <ul className="mt-3 space-y-1 text-sm">{order.items.map(({ name, quantity }, index) => <li key={index}>{quantity} × {name}</li>)}</ul>}
                      {order.shipments.length > 0 && <ul className="mt-3 space-y-1 text-sm">
                        {order.shipments.map(({ carrier, number, url }, index) => (
                          <li key={index}>
                            {url ? <a href={url} className="text-brand underline underline-offset-4" target="_blank" rel="noopener noreferrer">{carrier} tracking {number} ↗</a> : <span>{carrier}{number && ` · ${number}`}</span>}
                          </li>
                        ))}
                      </ul>}
                    </div>
                    <div className="text-sm sm:text-right">
                      <p className="font-semibold">{orderProgress(order)}</p>
                      <p className="mt-1 tabular-nums text-muted">{new Intl.NumberFormat('en-US', {
                        style: 'currency', currency: order.currency.toUpperCase(),
                      }).format(order.totalCents / 100)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : <p className="max-w-prose leading-7 text-muted">Orders you place while signed in will appear here. For a guest order, use the confirmation email or contact us with your order number.</p>}
            {(page > 1 || result.data.nextPage) && <nav aria-label="Orders pages" className="mt-5 flex items-center gap-5 text-sm text-brand">
              {page > 1 && <button type="button" className="min-h-11 underline underline-offset-4" onClick={() => changePage(page - 1)}>Newer orders</button>}
              {result.data.nextPage != null && <button type="button" className="min-h-11 underline underline-offset-4" onClick={() => changePage(page + 1)}>Older orders</button>}
            </nav>}
          </div>
        )}
      <Link className="mt-5 inline-flex min-h-11 items-center text-sm text-brand underline underline-offset-4" href="/contact?topic=order">Get order help ↗</Link>
    </>
  );
}
