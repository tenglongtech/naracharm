import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import postgres from 'postgres';
import { GET as status, OPTIONS as checkoutOptions, POST as checkout } from '../src/app/api/checkout/route';
import { POST as authRequest } from '../src/app/api/auth/[...all]/route';
import { GET as accountOrders } from '../src/app/api/account/orders/route';
import { POST as webhook } from '../src/app/api/stripe-webhook/route';
import { stripe } from '../src/lib/stripe';

test('checkout rejects invalid quantities before opening a database or Stripe connection', async () => {
  const response = await checkout(new NextRequest('http://localhost/api/checkout', {
    method: 'POST',
    body: JSON.stringify({
      checkoutId: '1e8ee668-c509-4475-888a-197c10aebe12',
      email: 'buyer@example.test',
      lines: [{ sku: 'test-piece', quantity: -1 }],
    }),
  }));
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /cart/i);
});

test('payment callbacks fail closed when verification is unconfigured', async (context) => {
  const previous = process.env.STRIPE_WEBHOOK_SECRET;
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_placeholder';
  context.after(() => {
    if (previous === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET = previous;
  });
  const response = await webhook(new NextRequest('http://localhost/api/stripe-webhook', {
    method: 'POST',
    headers: { 'stripe-signature': 'test' },
    body: JSON.stringify({ type: 'checkout.session.expired' }),
  }));
  assert.equal(response.status, 503);
});

test('checkout preflight accepts the configured storefront and rejects an unrelated origin', async () => {
  const url = 'http://localhost/api/checkout';
  const allowed = await checkoutOptions(new Request(url, { method: 'OPTIONS', headers: { Origin: 'http://localhost' } }));
  const denied = await checkoutOptions(new Request(url, { method: 'OPTIONS', headers: { Origin: 'https://unrelated.example' } }));
  assert.equal(allowed.status, 204);
  assert.equal(allowed.headers.get('Access-Control-Allow-Origin'), 'http://localhost');
  assert.equal(denied.status, 403);
  assert.equal(denied.headers.get('Access-Control-Allow-Origin'), null);
});

test('checkout publishes only the matching public Stripe configuration before reserving stock', async (context) => {
  const names = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_PUBLISHABLE_KEY'] as const;
  const saved = names.map((name) => process.env[name]);
  context.after(() => names.forEach((name, index) => {
    if (saved[index] === undefined) delete process.env[name];
    else process.env[name] = saved[index];
  }));
  process.env.STRIPE_SECRET_KEY = 'sk_test_localfixture';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_localfixture';
  const configuration = new Request('http://localhost/api/checkout?config=1', { headers: { Origin: 'http://localhost' } });
  process.env.STRIPE_PUBLISHABLE_KEY = 'pk_live_fixture';
  assert.equal((await status(configuration)).status, 503);

  process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_fixture';
  const reply = await status(configuration);
  assert.equal(reply.status, 200);
  assert.equal(reply.headers.get('Cache-Control'), 'no-store');
  assert.equal(reply.headers.get('Access-Control-Allow-Origin'), 'http://localhost');
  assert.deepEqual(await reply.json(), { publishableKey: 'pk_test_fixture', quoteReview: true });
  const denied = await status(new Request(configuration.url, { headers: { Origin: 'https://unrelated.example' } }));
  assert.equal(denied.status, 403);
});

const fixtureUrl = process.env.CHECKOUT_TEST_DATABASE_URL;

test('checkout and signed callbacks reserve, settle and release real PostgreSQL inventory', { skip: !fixtureUrl }, async (context) => {
  assert.equal(new URL(fixtureUrl!).hostname, '127.0.0.1');
  assert.equal(new URL(fixtureUrl!).pathname, '/checkout_fixture');
  assert.equal(process.env.DATABASE_URL, fixtureUrl);
  const sql = postgres(fixtureUrl!);
  const previousKey = process.env.STRIPE_PUBLISHABLE_KEY;
  process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_localfixture';
  context.after(() => {
    if (previousKey === undefined) delete process.env.STRIPE_PUBLISHABLE_KEY;
    else process.env.STRIPE_PUBLISHABLE_KEY = previousKey;
  });
  const { db } = await import('../src/lib/db');
  context.after(async () => { await Promise.all([sql.end(), db.$client.end()]); });

  const productId = 'a50abef5-6aa2-4a74-a1c1-aa9e33545c82';
  const variantId = 'd65dc767-3a1c-4a42-8053-e1fef33ce3dd';
  const checkoutId = 'b75e1bb8-f6c5-4173-99b6-23a1d937b3d4';
  const expiryId = 'c4fe0919-e5da-41a7-9076-0eb0b002ca66';
  const competitorId = 'df8386cd-87c0-4c74-b4ed-ef3da3655d0f';

  await sql`insert into products (id, slug, name, category, base_price_cents, status)
    values (${productId}, 'test-piece', 'Test piece', 'bracelet', 5800, 'active')`;
  await sql`insert into product_variants (id, product_id, sku, name, price_cents)
    values (${variantId}, ${productId}, 'TEST-001', 'Standard', 6000)`;
  await sql`insert into inventory (variant_id, quantity) values (${variantId}, 3)`;
  await sql`insert into discounts (code, type, value, status, usage_limit) values ('LOCAL500', 'fixed_amount', 500, 'active', 1)`;

  const pendingSessions = new Map<string, { id: string; status: string; client_secret: string }>();
  let droppedResponse = false;
  let lastSessionInput: Parameters<typeof stripe.checkout.sessions.create>[0] | undefined;
  const coupon = context.mock.method(stripe.coupons, 'create', async () => ({ id: 'coupon_fixture' }));
  const create = context.mock.method(stripe.checkout.sessions, 'create', async (
    payload: Parameters<typeof stripe.checkout.sessions.create>[0],
    options: Parameters<typeof stripe.checkout.sessions.create>[1],
  ) => {
    assert.equal(options?.idempotencyKey, 'checkout-session/' + payload?.client_reference_id);
    lastSessionInput = payload;
    const id = 'cs_test_' + payload!.client_reference_id!.replaceAll('-', '');
    const result = { id, status: 'open', client_secret: id + '_secret_fixture' };
    pendingSessions.set(id, result);
    if (payload?.client_reference_id === expiryId && !droppedResponse) {
      droppedResponse = true;
      throw new Error('Lost response after Stripe created the session');
    }
    return result;
  });
  context.mock.method(stripe.checkout.sessions, 'retrieve', async (id: string) => pendingSessions.get(id));

  function start(
    id: string, quantity: number, discountCode?: string, cookie?: string,
    expectedTotals?: { subtotalCents: number; shippingCents: number; discountCents: number },
  ) {
    return checkout(new Request('http://localhost/api/checkout', {
      method: 'POST',
      ...(cookie ? { headers: { cookie } } : {}),
      body: JSON.stringify({
        checkoutId: id, email: 'buyer@example.test', discountCode, expectedTotals,
        lines: [{ sku: 'test-piece', variantId: productId, quantity, unitPriceCents: 5 }],
      }),
    }));
  }

  function callback(sessionId: string, orderId: string, options: { type?: string; paid: boolean; total: number; subtotal: number; discount?: number; shipping?: number }) {
    const type = options.type ?? 'checkout.session.completed';
    const payload = JSON.stringify({
      id: 'evt_checkout_fixture', type,
      data: { object: {
        object: 'checkout.session', id: sessionId, client_reference_id: orderId,
        metadata: { source: 'naracharm-checkout' }, payment_status: options.paid ? 'paid' : 'unpaid',
        currency: 'usd', amount_total: options.total, amount_subtotal: options.subtotal,
        total_details: { amount_shipping: options.shipping ?? 0, amount_discount: options.discount ?? 0 },
        payment_intent: 'pi_fixture',
        collected_information: { shipping_details: { name: 'Buyer', address: { line1: 'Fixture', city: 'Test', country: 'US' } } },
      }},
    });
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET! });
    return webhook(new Request('http://localhost/api/stripe-webhook', {
      method: 'POST', body: payload, headers: { 'stripe-signature': header },
    }));
  }

  async function stock() {
    const [row] = await sql`select quantity, reserved from inventory where variant_id = ${variantId}`;
    return { ...row };
  }

  const displayedTotals = { subtotalCents: 11_600, shippingCents: 690, discountCents: 500 };
  const liveTotals = { subtotalCents: 12_000, shippingCents: 0, discountCents: 500 };
  const changed = await start(checkoutId, 2, 'LOCAL500', undefined, displayedTotals);
  assert.equal(changed.status, 409, await changed.clone().text());
  const priceReview = await changed.json();
  assert.equal(priceReview.code, 'quote_changed');
  assert.deepEqual(priceReview.quote, {
    ...liveTotals, items: [{ productName: 'Test piece', quantity: 2, unitPriceCents: 6000 }],
  });
  assert.deepEqual(await stock(), { quantity: 3, reserved: 0 });
  assert.equal(create.mock.callCount(), 0);
  assert.equal(coupon.mock.callCount(), 0);
  const [unreserved] = await sql`select used_count from discounts where code = 'LOCAL500'`;
  assert.equal(unreserved.used_count, 0);
  assert.equal((await sql`select id from orders where id = ${checkoutId}`).length, 0);

  const first = await start(checkoutId, 2, 'LOCAL500', undefined, liveTotals);
  assert.equal(first.status, 200, await first.clone().text());
  const { sessionId, publishableKey } = await first.json();
  assert.equal(publishableKey, 'pk_test_localfixture');
  assert.equal(lastSessionInput?.line_items?.[0].price_data?.unit_amount, 6000);
  assert.equal(lastSessionInput?.shipping_options?.[0].shipping_rate_data?.fixed_amount?.amount, 0);
  assert.equal(lastSessionInput?.ui_mode, 'embedded_page');
  assert.deepEqual([...lastSessionInput!.shipping_address_collection!.allowed_countries].sort(), [
    'AT', 'AU', 'BE', 'CA', 'CH', 'DE', 'DK', 'ES', 'FI', 'FR', 'GB', 'IE', 'IT', 'NL', 'NO', 'PL', 'PT', 'SE', 'US',
  ]);
  assert.match(lastSessionInput?.return_url ?? '', /\/checkout\/success\?session_id=\{CHECKOUT_SESSION_ID\}$/);
  assert.equal(lastSessionInput?.success_url, undefined);
  assert.equal(coupon.mock.callCount(), 1);
  assert.deepEqual(await stock(), { quantity: 3, reserved: 2 });
  const mismatchedRetry = await start(checkoutId, 2, 'LOCAL500', undefined, displayedTotals);
  assert.equal(mismatchedRetry.status, 409);
  assert.deepEqual((await mismatchedRetry.json()).quote, priceReview.quote);
  assert.equal((await start(checkoutId, 2, 'LOCAL500')).status, 200);
  assert.equal(create.mock.callCount(), 1);
  assert.equal((await start(checkoutId, 1, 'LOCAL500')).status, 409);
  assert.equal((await start(competitorId, 2)).status, 409);
  const spentCode = await start(competitorId, 1, 'LOCAL500');
  assert.equal(spentCode.status, 409);
  assert.equal((await spentCode.json()).code, 'discount_unavailable');
  assert.deepEqual(await stock(), { quantity: 3, reserved: 2 });

  const statusRequest = new Request(`http://localhost/api/checkout?session_id=${sessionId}`);
  assert.deepEqual(await (await status(statusRequest)).json(), { status: 'pending' });
  assert.equal((await callback(sessionId, checkoutId, { paid: false, total: 11500, subtotal: 12000, discount: 500 })).status, 200);
  assert.deepEqual(await (await status(statusRequest)).json(), { status: 'pending' });

  assert.equal((await callback(sessionId, checkoutId, { paid: true, total: 11900, subtotal: 12000, discount: 500 })).status, 500);
  assert.deepEqual(await stock(), { quantity: 3, reserved: 2 });

  const paid = { paid: true, total: 11500, subtotal: 12000, discount: 500 };
  const callbacks = await Promise.all([callback(sessionId, checkoutId, paid), callback(sessionId, checkoutId, paid)]);
  assert.deepEqual(callbacks.map((result) => result.status), [200, 200]);
  assert.deepEqual(await stock(), { quantity: 1, reserved: 0 });
  const confirmed = await (await status(statusRequest)).json();
  assert.deepEqual(confirmed, { status: 'paid', number: 'NC-10000', totalCents: 11500, currency: 'usd' });
  const [paymentEvents] = await sql`select count(*)::int as count from order_events where type = 'payment_received'`;
  assert.equal(paymentEvents.count, 1);

  await sql`insert into discounts (code, type, value, status, usage_limit) values ('LOCAL250', 'fixed_amount', 250, 'active', 1)`;
  assert.equal((await start(expiryId, 1, 'LOCAL250')).status, 503);
  assert.deepEqual(await stock(), { quantity: 1, reserved: 1 });
  const remaining = await start(expiryId, 1, 'LOCAL250');
  assert.equal(remaining.status, 200);
  const { sessionId: expirySession } = await remaining.json();
  assert.equal(lastSessionInput?.shipping_options?.[0].shipping_rate_data?.fixed_amount?.amount, 690);
  assert.deepEqual(await stock(), { quantity: 1, reserved: 1 });
  const expired = { type: 'checkout.session.expired', paid: false, total: 6440, subtotal: 6000, discount: 250, shipping: 690 };
  assert.equal((await callback(expirySession, expiryId, expired)).status, 200);
  assert.equal((await callback(expirySession, expiryId, expired)).status, 200);
  assert.deepEqual(await stock(), { quantity: 1, reserved: 0 });
  const [released] = await sql`select used_count from discounts where code = 'LOCAL250'`;
  assert.equal(released.used_count, 0);
  assert.equal((await start(expiryId, 1, 'LOCAL250')).status, 410);

  async function accountCookie(email: string) {
    const response = await authRequest(new Request('http://localhost/api/auth/sign-up/email', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: email.split('@')[0], email, password: 'FixturePassword42!' }),
    }));
    assert.equal(response.status, 200, await response.clone().text());
    const cookie = response.headers.getSetCookie().find((value) => value.includes('session_token='));
    assert.ok(cookie, 'account creation set a session cookie');
    return cookie.split(';', 1)[0];
  }

  function history(cookie?: string, search = '') {
    return accountOrders(new Request('http://localhost/api/account/orders' + search, cookie ? { headers: { cookie } } : undefined));
  }

  const owner = await accountCookie('buyer@example.test');
  const other = await accountCookie('other-buyer@example.test');
  assert.equal((await history()).status, 401);
  assert.equal((await history(owner, '?page=0')).status, 400);
  assert.deepEqual((await (await history(owner)).json()).orders, [], 'a guest order is not claimed through its address');

  const accountOrderId = 'ef7600c5-073b-4e7a-8c2f-80e3fcd9e3bf';
  const signedIn = await start(accountOrderId, 1, undefined, owner);
  assert.equal(signedIn.status, 200, await signedIn.clone().text());
  const accountSession = (await signedIn.json()).sessionId;
  const mismatchedSession = await start(accountOrderId, 1);
  assert.equal(mismatchedSession.status, 409);
  assert.equal((await mismatchedSession.json()).code, 'session_changed');
  assert.equal((await start(accountOrderId, 1, undefined, other)).status, 409);
  assert.equal((await start(accountOrderId, 1, undefined, owner)).status, 200);
  assert.equal((await callback(accountSession, accountOrderId, { paid: true, total: 6690, subtotal: 6000, shipping: 690 })).status, 200);
  await sql`insert into order_fulfillments (order_id, carrier, tracking_number, tracking_url)
    values (${accountOrderId}, 'Fixture Carrier', 'TRACE123', 'https://example.test/TRACE123')`;

  const personalHistory = await history(owner);
  assert.equal(personalHistory.headers.get('Cache-Control'), 'private, no-store');
  const { orders: accountHistory, nextPage } = await personalHistory.json();
  assert.equal(nextPage, null);
  assert.equal(accountHistory.length, 1);
  const [accountOrder] = accountHistory;
  assert.notEqual(accountOrder.number, confirmed.number);
  assert.equal(accountOrder.paymentStatus, 'paid');
  assert.equal(accountOrder.totalCents, 6690);
  assert.deepEqual(accountOrder.items, [{ name: 'Test piece', quantity: 1 }]);
  assert.deepEqual(accountOrder.shipments, [{ carrier: 'Fixture Carrier', number: 'TRACE123', url: 'https://example.test/TRACE123' }]);
  assert.equal(accountOrder.email, undefined);
  assert.equal(accountOrder.shippingAddress, undefined);
  assert.deepEqual((await (await history(other)).json()).orders, []);
});
