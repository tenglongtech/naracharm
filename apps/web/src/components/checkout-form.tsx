'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js/pure';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { FormField, Input, Button } from '@/components/ui';
import { getLocalCart, subscribeToCart } from '@/lib/cart-local';
import { checkoutAttempt, forgetCheckoutAttempt, readCheckoutResponse, rememberCheckoutCart } from '@/lib/checkout-browser';
import { checkoutQuote, type CheckoutQuote, type CheckoutTotals } from '@/lib/checkout-request';
import { stripePublishableKey } from '@/lib/stripe-publishable-key';
import type { CartView } from '@/lib/cart-types';

const bundledStripeKey = stripePublishableKey(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
const sessionRequestTimeoutMs = 25_000;
type Payment = { clientSecret: string; stripe: ReturnType<typeof loadStripe> };
type PromoOutcome =
  | { valid: true; discountCents: number; freeShipping: boolean }
  | { valid: false; message: string };
type PromoResult = { code: string; subtotalCents: number } & PromoOutcome;
type Review = { cartKey: string; discountCode?: string; quote: CheckoutQuote };

function price(cents: number) {
  return '$' + (cents / 100).toFixed(2);
}

export function CheckoutForm() {
  const router = useRouter();
  const [cart, setCart] = useState<CartView | null>(null);
  const [loading, setLoading] = useState(false);
  const openingPayment = useRef(false);
  const [error, setError] = useState('');
  const [sessionChanged, setSessionChanged] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [promoChecking, setPromoChecking] = useState(false);
  const [promoResult, setPromoResult] = useState<PromoResult | null>(null);
  const [review, setReview] = useState<Review | null>(null);

  useEffect(() => {
    setCart(getLocalCart());
    return subscribeToCart(setCart);
  }, []);

  useEffect(() => {
    if (cart && cart.lines.length === 0) router.replace('/cart');
  }, [cart, router]);

  const code = promoInput.trim().toUpperCase();
  const currentPromo = promoResult?.code === code && promoResult.subtotalCents === cart?.subtotalCents ? promoResult : null;
  const discountCode = currentPromo?.valid ? code : undefined;
  const cartKey = JSON.stringify(cart?.lines.map(({ lineId, quantity, unitPriceCents }) => [lineId, quantity, unitPriceCents]) ?? []);
  const updatedQuote = review && review.cartKey === cartKey && review.discountCode === discountCode ? review.quote : null;
  const totals: CheckoutTotals = updatedQuote ?? {
    subtotalCents: cart?.subtotalCents ?? 0,
    shippingCents: currentPromo?.valid && currentPromo.freeShipping ? 0 : (cart?.shippingCents ?? 0),
    discountCents: currentPromo?.valid ? currentPromo.discountCents : 0,
  };
  const totalCents = totals.subtotalCents - totals.discountCents + totals.shippingCents;

  const changePromo = (value: string) => {
    setPromoInput(value.toUpperCase());
    setPromoResult(null);
    setReview(null);
    setError('');
  };

  const handleApplyPromo = async () => {
    if (!code || !cart || promoChecking || openingPayment.current) return;
    const { subtotalCents } = cart;
    setPromoChecking(true);
    setPromoResult(null);
    setReview(null);
    setError('');
    try {
      const { response, data } = await readCheckoutResponse('/api/discount/validate', {
        method: 'POST',
        body: JSON.stringify({ code, subtotalCents }),
      });
      if (
        response.ok && data?.valid === true && data.code === code
        && Number.isSafeInteger(data.discountCents) && data.discountCents >= 0 && data.discountCents <= subtotalCents
      ) {
        setPromoResult({ code, subtotalCents, valid: true, discountCents: data.discountCents, freeShipping: data.freeShipping === true });
      } else {
        const message = typeof data?.error === 'string' ? data.error : 'Could not verify this code. Try again or remove it.';
        setPromoResult({ code, subtotalCents, valid: false, message });
      }
    } catch {
      setPromoResult({ code, subtotalCents, valid: false, message: 'Could not verify this code. Try again or remove it.' });
    } finally {
      setPromoChecking(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cart || cart.lines.length === 0 || openingPayment.current || promoChecking || sessionChanged) return;
    if (code && !currentPromo?.valid) {
      setError('Apply your discount code or remove it before continuing.');
      return;
    }

    openingPayment.current = true;
    setError('');
    setLoading(true);
    const email = String(new FormData(event.currentTarget).get('email') ?? '');
    try {
      const { response: config, data: configuration } = await readCheckoutResponse('/api/checkout?config=1', { cache: 'no-store' });
      const configuredKey = stripePublishableKey(configuration?.publishableKey) ?? bundledStripeKey;
      if (!config.ok || configuration?.quoteReview !== true || !configuredKey) {
        throw new Error('Secure checkout is temporarily unavailable.');
      }

      const attempt = await checkoutAttempt(email, cart.lines, discountCode);
      const { subtotalCents, shippingCents, discountCents } = totals;
      const { response, data } = await readCheckoutResponse('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({ email, ...attempt, discountCode, expectedTotals: { subtotalCents, shippingCents, discountCents } }),
      }, sessionRequestTimeoutMs);
      if (response.status === 410) forgetCheckoutAttempt();
      if (response.status === 409 && data?.code === 'quote_changed') {
        const parsed = checkoutQuote.safeParse(data.quote);
        if (parsed.success) {
          setReview({ cartKey, discountCode, quote: parsed.data });
          return;
        }
      }
      if (response.status === 409 && data?.code === 'discount_unavailable' && discountCode) {
        const message = typeof data.error === 'string' ? data.error : 'This discount code is no longer available.';
        setPromoResult({ code, subtotalCents: cart.subtotalCents, valid: false, message });
        setReview(null);
        return;
      }
      if (!response.ok || typeof data?.sessionId !== 'string') {
        if (data?.code === 'session_changed') setSessionChanged(true);
        throw new Error(typeof data?.error === 'string' ? data.error : 'Could not open secure checkout.');
      }
      if (data.completed) {
        rememberCheckoutCart(data.sessionId, attempt.checkoutId, cart.lines);
        router.replace(`/checkout/success?session_id=${encodeURIComponent(data.sessionId)}`);
      } else if (typeof data.clientSecret === 'string') {
        const key = stripePublishableKey(data.publishableKey) ?? configuredKey;
        if (!data.sessionId.startsWith('cs_' + key.split('_')[1] + '_')) {
          throw new Error('Secure checkout is temporarily unavailable.');
        }
        rememberCheckoutCart(data.sessionId, attempt.checkoutId, cart.lines);
        setPayment({ clientSecret: data.clientSecret, stripe: loadStripe(key) });
      } else {
        throw new Error('Could not open secure checkout.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open secure checkout.');
    } finally {
      openingPayment.current = false;
      setLoading(false);
    }
  };

  if (!cart || cart.lines.length === 0) {
    return <p role="status" className="py-10 text-sm text-muted">Loading your checkout…</p>;
  }

  if (payment) {
    return (
      <section className="border border-border bg-surface p-3 sm:p-6" aria-labelledby="secure-payment-title">
        <h2 id="secure-payment-title" className="mb-4 font-display text-2xl">Secure payment</h2>
        <EmbeddedCheckoutProvider stripe={payment.stripe} options={{ clientSecret: payment.clientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
      <div className="space-y-7">
        <section className="border-t border-border pt-5" aria-labelledby="checkout-contact">
          <h2 id="checkout-contact" className="font-display text-2xl">Contact</h2>
          <p className="mb-4 mt-2 max-w-lg text-sm leading-6 text-muted">Use an address you can access for your order confirmation and shipping updates.</p>
          <div className="max-w-lg">
            <FormField label="Email address" htmlFor="email" required>
              <Input id="email" name="email" type="email" autoComplete="email" maxLength={254} required disabled={loading} placeholder="your@email.com" />
            </FormField>
          </div>
        </section>
        <section className="border-t border-border pt-5" aria-labelledby="checkout-delivery">
          <h2 id="checkout-delivery" className="font-display text-2xl">Delivery & payment</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted">
            Enter your delivery address in Stripe Checkout, then review your total and choose an available payment method.
          </p>
          <Link href="/shipping#destinations" className="inline-flex min-h-11 items-center gap-2 text-sm text-brand underline underline-offset-4">
            Check supported destinations <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </div>

      <aside className="h-fit border border-border bg-surface p-5 lg:sticky lg:top-28 lg:p-6" aria-labelledby="checkout-summary">
        <div className="flex flex-wrap items-center justify-between gap-x-3">
          <h2 id="checkout-summary" className="font-display text-2xl">Order summary</h2>
          <Link href="/cart" className="inline-flex min-h-11 items-center text-sm text-brand underline underline-offset-4">Edit cart</Link>
        </div>
        {updatedQuote && <p role="alert" className="mt-1 border-y border-border bg-bg px-3 py-2.5 text-sm leading-6 text-ink">
          Your order amounts changed. Review the updated prices and total below before continuing.
        </p>}
        <ul className="mt-3 space-y-3">
          {(updatedQuote?.items ?? cart.lines).map((item, index) => (
            <li key={index} className="flex justify-between gap-3 text-sm">
              <span>{item.productName} <span className="whitespace-nowrap text-xs text-muted">×{item.quantity}</span></span>
              <span className="tabular-nums">{price(item.unitPriceCents * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 border-y border-border py-3">
          <label htmlFor="checkout-promo" className="block text-xs font-semibold">Discount code</label>
          <div className="mt-2 flex flex-wrap items-stretch gap-2">
            <input
              id="checkout-promo"
              type="text"
              value={promoInput}
              autoComplete="off"
              maxLength={80}
              disabled={loading}
              onChange={(event) => changePromo(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  void handleApplyPromo();
                }
              }}
              placeholder="Promo code"
              className="min-h-11 min-w-24 flex-1 border border-border bg-bg px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              disabled={loading || promoChecking || !code}
              className="min-h-11 border border-ink px-3 text-xs font-medium hover:bg-ink hover:text-bg disabled:opacity-50"
            >
              {promoChecking ? 'Checking…' : 'Apply'}
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-3">
            {currentPromo && (
              <p role="status" className="pt-2 text-xs leading-5 text-brand">
                {currentPromo.valid ? `${code} applied` : currentPromo.message}
              </p>
            )}
            {code && <button type="button" onClick={() => changePromo('')} disabled={loading} className="min-h-11 text-xs text-brand underline underline-offset-4">Remove code</button>}
          </div>
        </div>

        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tabular-nums">{price(totals.subtotalCents)}</dd>
          </div>
          {totals.discountCents > 0 && (
            <div className="flex justify-between gap-3 text-brand">
              <dt>Discount</dt>
              <dd className="tabular-nums">−{price(totals.discountCents)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Standard shipping</dt>
            <dd className="tabular-nums">{totals.shippingCents === 0 ? 'Free' : price(totals.shippingCents)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-border pt-3 font-display text-lg">
            <dt>{updatedQuote ? 'Updated total' : 'Order total'}</dt>
            <dd className="tabular-nums">{price(totalCents)} <span className="text-xs">USD</span></dd>
          </div>
        </dl>
        <Button type="submit" className="mt-5 min-h-12 w-full" disabled={loading || promoChecking || sessionChanged}>
          {loading ? 'Opening…' : updatedQuote ? 'Accept updated total and continue' : 'Continue to payment'}
        </Button>
        {error && <p role="alert" className="mt-3 text-sm leading-6 text-brand">{error}</p>}
        {sessionChanged && <button type="button" className="mt-2 min-h-11 text-sm text-brand underline underline-offset-4" onClick={() => {
          forgetCheckoutAttempt();
          setSessionChanged(false);
          setReview(null);
          setError('');
        }}>Start a new checkout</button>}
        <p className="mt-3 text-xs leading-5 text-muted">
          When you complete payment you agree to our <Link href="/terms" className="underline underline-offset-4">Terms</Link>.
        </p>
      </aside>
    </form>
  );
}
