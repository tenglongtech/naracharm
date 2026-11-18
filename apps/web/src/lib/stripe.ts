import Stripe from 'stripe';
import { stripePublishableKey } from './stripe-publishable-key';
import { shippingCountryCodes } from './store-policies';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  maxNetworkRetries: 2,
  timeout: 15_000,
});

export function stripeWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  return secret?.startsWith('whsec_') && secret !== 'whsec_placeholder' ? secret : undefined;
}

export function checkoutConfigured() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  return Boolean(key && !/placeholder|_xxx/i.test(key) && stripeWebhookSecret());
}

export function checkoutPublishableKey() {
  const mode = process.env.STRIPE_SECRET_KEY?.trim().match(/^(?:sk|rk)_(test|live)_/)?.[1];
  const key = stripePublishableKey(process.env.STRIPE_PUBLISHABLE_KEY);
  return mode && checkoutConfigured() && key?.startsWith('pk_' + mode + '_') ? key : undefined;
}

export async function createCheckoutSession(params: {
  orderId: string;
  items: { productName: string; unitPriceCents: number; quantity: number }[];
  returnUrl: string;
  email: string;
  shippingCents: number;
  discountCents: number;
  expiresAt: number;
}) {
  const { orderId, items, returnUrl, email, shippingCents, discountCents, expiresAt } = params;
  const coupon = discountCents > 0 ? await stripe.coupons.create({
    amount_off: discountCents,
    currency: 'usd',
    duration: 'once',
    max_redemptions: 1,
  }, { idempotencyKey: `checkout-coupon/${orderId}` }) : undefined;

  return stripe.checkout.sessions.create({
    mode: 'payment',
    ui_mode: 'embedded_page',
    client_reference_id: orderId,
    return_url: returnUrl,
    redirect_on_completion: 'always',
    customer_email: email,
    adaptive_pricing: { enabled: false },
    expires_at: expiresAt,
    line_items: items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: 'usd',
        unit_amount: item.unitPriceCents,
        product_data: { name: item.productName },
      },
    })),
    shipping_address_collection: { allowed_countries: shippingCountryCodes },
    shipping_options: [{
      shipping_rate_data: {
        display_name: 'Standard shipping',
        type: 'fixed_amount',
        fixed_amount: { currency: 'usd', amount: shippingCents },
      },
    }],
    ...(coupon ? { discounts: [{ coupon: coupon.id }] } : {}),
    metadata: { source: 'naracharm-checkout' },
  }, { idempotencyKey: `checkout-session/${orderId}` });
}

export function isConfirmedCheckoutRejection(error: unknown) {
  return error instanceof Stripe.errors.StripeAuthenticationError
    || error instanceof Stripe.errors.StripePermissionError
    || error instanceof Stripe.errors.StripeInvalidRequestError;
}
