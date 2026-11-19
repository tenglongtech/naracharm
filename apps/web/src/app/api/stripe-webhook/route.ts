import { NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe, stripeWebhookSecret } from '@/lib/stripe';
import { settleCheckout, settleLegacyCheckout } from '@/lib/checkout-orders';
import { sendEmail } from '@/lib/email';
import { OrderConfirmationEmail } from '@/emails/order-confirmation';
import { orderTrackingUrl } from '@/lib/order-tracking-token';
import { clearCartByToken } from '@/lib/cart-actions';
import { orderItemLabel } from '@/lib/cart-types';

const legacyLines = z.array(z.object({
  variantId: z.uuid(),
  sku: z.string().min(1),
  quantity: z.number().int().positive(),
  amountCents: z.number().int().nonnegative(),
})).nonempty();

export async function POST(request: Request) {
  const secret = stripeWebhookSecret();
  if (!secret) return NextResponse.json({ error: 'Payment verification is unavailable.' }, { status: 503 });
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: 'Invalid Stripe signature.' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded'
      || event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object;
      const source = session.metadata?.source;
      const isPaid = session.payment_status === 'paid'
        || (session.payment_status === 'no_payment_required' && session.amount_total === 0);
      const isCancellation = event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed';
      if (source === 'naracharm-checkout' && isCancellation && !isPaid) {
        await settleCheckout(session, 'cancelled');
      } else if (!isCancellation && isPaid) {
        if (source === 'naracharm-checkout') {
          await sendConfirmation(await settleCheckout(session, 'paid'));
        } else if (source === 'naracharm-web') {
          const lines = legacyLines.parse(JSON.parse(session.metadata?.lineItems ?? 'null'));
          const order = await settleLegacyCheckout(session, lines.map(({ amountCents, ...line }) => ({
            ...line, unitPriceCents: amountCents,
          })));
          if (order && session.metadata?.cartToken) {
            await clearCartByToken(session.metadata.cartToken).catch(() => console.error('Legacy cart cleanup failed', order.id));
          }
          await sendConfirmation(order);
        }
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe event could not be processed', event.id, error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Stripe event could not be processed.' }, { status: 500 });
  }
}

async function sendConfirmation(order: Awaited<ReturnType<typeof settleCheckout>>) {
  if (!order) return;
  try {
    await sendEmail({
      to: order.email,
      subject: `Your Nara Charm Order ${order.number}`,
      react: OrderConfirmationEmail({
        orderNumber: order.number, totalCents: order.totalCents, currency: order.currency,
        subtotalCents: order.subtotalCents, shippingCents: order.shippingCents,
        discountCents: order.discountCents, taxCents: order.taxCents,
        orderStatusUrl: orderTrackingUrl(order.id),
        items: order.lines.map((line) => ({
          name: orderItemLabel(line.productName, line.variantName), quantity: line.quantity, priceCents: line.unitPriceCents,
        })),
      }),
    });
  } catch {
    console.error('Order confirmation email failed', order.id);
  }
}
