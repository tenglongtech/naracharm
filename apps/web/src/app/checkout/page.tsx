import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { CheckoutForm } from '@/components/checkout-form';
import { ButtonLink } from '@/components/ui';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Checkout', alternates: { canonical: '/checkout' }, robots: { index: false },
};

export default function CheckoutPage() {
  const { checkoutEnabled } = siteConfig;
  return (
    <>
      <SiteHeader />
      <main id="main" data-checkout-mode={checkoutEnabled ? 'online' : 'inquiry'} className="mx-auto max-w-6xl px-5 py-9 md:px-8 md:py-14">
        <h1 className="font-display text-5xl leading-none tracking-tight md:text-6xl">Checkout</h1>
        <div className="mt-6 md:mt-9">
          {checkoutEnabled ? <CheckoutForm /> : (
            <section className="max-w-xl space-y-5 border-y border-border bg-surface p-6">
              <p>Online checkout is paused. Contact us to confirm availability, pricing and delivery for a piece.</p>
              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink href="/contact?topic=product">Contact us</ButtonLink>
                <ButtonLink href="/cart" variant="outline">View saved pieces</ButtonLink>
              </div>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
