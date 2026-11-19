import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { CheckoutConfirmation } from '@/components/checkout-confirmation';
import { ButtonLink } from '@/components/ui';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = { title: 'Payment status', robots: { index: false, follow: true } };

export default function CheckoutSuccessPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-2xl px-5 py-14 text-center md:py-20">
        {siteConfig.checkoutEnabled ? <Suspense fallback={<h1 className="font-display text-5xl">Checking payment.</h1>}>
          <CheckoutConfirmation />
        </Suspense> : (
          <>
            <h1 className="font-display text-5xl">Help with an existing order</h1>
            <p className="my-5">Contact support with the order number from your confirmation email.</p>
            <ButtonLink href="/contact?topic=order">Contact support</ButtonLink>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
