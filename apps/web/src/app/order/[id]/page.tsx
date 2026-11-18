import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';

export const metadata: Metadata = { title: 'Order support', robots: { index: false, follow: false } };

export function generateStaticParams() {
  return [{ id: 'demo' }];
}

export default function OrderPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="section-wrap">
        <h1 className="font-display text-5xl tracking-tight md:text-7xl">Order support.</h1>
        <p className="mt-4 max-w-xl leading-7 text-muted">Use the tracking link in your shipping email for delivery updates. For questions about an order, contact us with the order number from your confirmation.</p>
        <div className="mt-6 flex flex-wrap items-center gap-5">
          <Link className="shop-button" href="/order-status">Track an order</Link>
          <Link className="text-sm text-brand underline underline-offset-4" href="/contact?topic=order">Get order help</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
