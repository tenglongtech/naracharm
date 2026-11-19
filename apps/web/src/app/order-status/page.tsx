import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { OrderTracking } from '@/components/order-tracking';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Track an order', alternates: { canonical: '/order-status' },
  robots: { index: false, follow: true }, referrer: 'no-referrer',
};

export default function OrderStatusPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-16">
        <h1 className="font-display text-5xl leading-none tracking-tight md:text-6xl">Track an order</h1>
        {siteConfig.customerServicesEnabled ? <OrderTracking /> : (
          <p className="mt-5 max-w-xl leading-7 text-muted">
            Online order lookup is temporarily paused. If your shipping email gives a carrier and tracking number, use the carrier’s tracking page for delivery updates.
          </p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
