import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { CheckoutConfirmation } from '@/components/checkout-confirmation';

export const metadata: Metadata = { title: 'Payment status', robots: { index: false, follow: true } };

export default function CheckoutSuccessPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-2xl px-5 py-14 text-center md:py-20">
        <Suspense fallback={<h1 className="font-display text-5xl">Checking payment.</h1>}>
          <CheckoutConfirmation />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
