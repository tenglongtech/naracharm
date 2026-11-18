import { NextResponse } from 'next/server';
import { storefrontHeaders, checkoutStorefrontOrigin, storefrontPreflight, unsupportedOrigin } from '@/lib/checkout-origin';
import { checkoutRequest, CheckoutError } from '@/lib/checkout-request';
import { cancelRejectedCheckout, checkoutStatus, reserveCheckout, reservationLifetimeSeconds, saveCheckoutSession, settleCheckout } from '@/lib/checkout-orders';
import { checkoutConfigured, checkoutPublishableKey, createCheckoutSession, isConfirmedCheckoutRejection, stripe } from '@/lib/stripe';
import { auth } from '@/lib/auth';

export const OPTIONS = storefrontPreflight;

export async function POST(request: Request) {
  const headers = storefrontHeaders(request);
  if (unsupportedOrigin(request, headers)) return NextResponse.json({ error: 'Origin is not allowed' }, { headers, status: 403 });
  const parsed = checkoutRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Check your email address and cart before continuing.' }, { headers, status: 400 });
  }
  if (!checkoutConfigured()) {
    return NextResponse.json({ error: 'Checkout is temporarily unavailable.' }, { headers, status: 503 });
  }

  try {
    const sessionInfo = request.headers.has('cookie') ? await auth.api.getSession({ headers: request.headers }) : null;
    const requestedReturnUrl = `${checkoutStorefrontOrigin()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const reservation = await reserveCheckout(parsed.data, requestedReturnUrl, sessionInfo?.user.id);
    const { order, lines, returnUrl } = reservation;
    let session;
    try {
      session = order.stripeCheckoutSessionId
        ? await stripe.checkout.sessions.retrieve(order.stripeCheckoutSessionId)
        : await createCheckoutSession({
          orderId: order.id, items: lines, returnUrl, email: order.email,
          shippingCents: order.shippingCents, discountCents: order.discountCents,
          expiresAt: Math.floor(order.createdAt.getTime() / 1_000) + reservationLifetimeSeconds,
        });
    } catch (error) {
      if (!reservation.existing && isConfirmedCheckoutRejection(error)) await cancelRejectedCheckout(order.id);
      throw error;
    }

    await saveCheckoutSession(order.id, session.id);
    if (session.status === 'complete') {
      return NextResponse.json({ sessionId: session.id, completed: true }, { headers });
    }
    if (session.status === 'expired') await settleCheckout(session, 'cancelled');
    if (session.status !== 'open' || !session.client_secret) {
      throw new CheckoutError('This payment session has ended. Review your order or start a new checkout.', 410);
    }
    const publishableKey = checkoutPublishableKey();
    return NextResponse.json({ clientSecret: session.client_secret, sessionId: session.id, publishableKey }, { headers });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message, code: error.code, quote: error.quote }, { headers, status: error.status });
    }
    console.error('Checkout initialization failed', error instanceof Error ? error.name : 'Unknown error');
    return NextResponse.json({ error: 'Could not open secure checkout. Please retry with the same cart.' }, { headers, status: 503 });
  }
}

export async function GET(request: Request) {
  const headers = storefrontHeaders(request);
  if (unsupportedOrigin(request, headers)) return NextResponse.json({ error: 'Origin is not allowed' }, { headers, status: 403 });
  const params = new URL(request.url).searchParams;
  if (params.get('config') === '1') {
    const publishableKey = checkoutPublishableKey();
    return publishableKey
      ? NextResponse.json({ publishableKey, quoteReview: true }, { headers })
      : NextResponse.json({ error: 'Secure checkout is temporarily unavailable.' }, { headers, status: 503 });
  }
  const sessionId = params.get('session_id');
  if (!sessionId || !/^cs_(?:test|live)_[A-Za-z0-9]+$/.test(sessionId) || sessionId.length > 150) {
    return NextResponse.json({ error: 'Invalid checkout session.' }, { headers, status: 400 });
  }
  try {
    const order = await checkoutStatus(sessionId);
    return NextResponse.json(order ?? { status: 'unknown' }, { headers, status: order ? 200 : 404 });
  } catch (error) {
    console.error('Checkout status unavailable', error instanceof Error ? error.name : 'Unknown error');
    return NextResponse.json({ error: 'Payment confirmation is temporarily unavailable.' }, { headers, status: 503 });
  }
}
