import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { CheckoutForm } from '@/components/checkout-form';

export const metadata: Metadata = {
  title: 'Checkout', alternates: { canonical: '/checkout' }, robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-5 py-9 md:px-8 md:py-14">
        <h1 className="font-display text-5xl leading-none tracking-tight md:text-6xl">Checkout</h1>
        <div className="mt-6 md:mt-9">
          <CheckoutForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
