import { test } from 'node:test';
import assert from 'node:assert/strict';
import postgres from 'postgres';
import { renderToStaticMarkup } from 'react-dom/server';
import { POST as track } from '../src/app/api/order-status/route';
import { orderIdForTrackingToken, orderTrackingToken, orderTrackingUrl } from '../src/lib/order-tracking-token';
import { listOrderShipments, recordShipment, sendShipmentNotice } from '../src/lib/order-fulfillment';
import type { sendEmail } from '../src/lib/email';
import { OrderConfirmationEmail } from '../src/emails/order-confirmation';

const orderId = '9f11c29d-cdfb-4d7a-83d7-7dad72354462';
const unpaidId = 'da976c1b-e07a-43c1-853c-aba342a92713';

test('tracking links expire and reject tampered order identifiers and signatures', (context) => {
  const previous = process.env.ORDER_TRACKING_SECRET;
  process.env.ORDER_TRACKING_SECRET = 'local-disposable-order-tracking-secret';
  context.after(() => {
    if (previous === undefined) delete process.env.ORDER_TRACKING_SECRET;
    else process.env.ORDER_TRACKING_SECRET = previous;
  });
  const start = new Date('2026-02-01T00:00:00Z');
  const token = orderTrackingToken(orderId, start);
  assert.ok(token);
  const link = new URL(orderTrackingUrl(orderId, start)!);
  assert.equal(link.pathname, '/order-status');
  assert.equal(link.search, '');
  assert.equal(link.hash, '#' + token);
  assert.equal(orderIdForTrackingToken(token, start), orderId);
  assert.equal(orderIdForTrackingToken(token.replace(orderId, unpaidId), start), undefined);
  assert.equal(orderIdForTrackingToken(token.slice(0, -8) + '0'.repeat(8), start), undefined);
  assert.equal(orderIdForTrackingToken(token, new Date('2026-08-01T00:00:00Z')), undefined);

  const receipt = renderToStaticMarkup(OrderConfirmationEmail({
    orderNumber: 'TEST-RECEIPT', orderStatusUrl: link.href,
    items: [{ name: 'Fixture jewelry', quantity: 2, priceCents: 3200 }],
    subtotalCents: 6400, shippingCents: 690, discountCents: 500, taxCents: 0, totalCents: 6590,
  }));
  assert.ok(receipt.includes(link.href));
  assert.match(receipt, /\$64\.00/);
  assert.doesNotMatch(receipt, /\$32\.00/);
  assert.match(receipt, /\$65\.90 USD/);
});

const fixtureUrl = process.env.CHECKOUT_TEST_DATABASE_URL;

test('paid-order shipments are idempotent and the guest link exposes only status and tracking', { skip: !fixtureUrl }, async (context) => {
  assert.equal(new URL(fixtureUrl!).hostname, '127.0.0.1');
  assert.equal(new URL(fixtureUrl!).pathname, '/checkout_fixture');
  assert.equal(process.env.DATABASE_URL, fixtureUrl);
  const sql = postgres(fixtureUrl!);
  const { db } = await import('../src/lib/db');
  context.after(async () => { await Promise.all([sql.end(), db.$client.end()]); });

  await sql`insert into orders (id, number, email, status, payment_status, shipping_address, subtotal_cents, total_cents)
    values (${orderId}, 'TEST-SHIP-42', 'dispatch@example.test', 'paid', 'paid', '{"address":"private fixture address"}', 6400, 6400),
    (${unpaidId}, 'TEST-UNPAID-42', 'unpaid@example.test', 'pending', 'unpaid', '{}', 6400, 6400)`;

  const token = orderTrackingToken(orderId);
  assert.ok(token);
  function lookup(body: unknown, origin = 'http://localhost') {
    return track(new Request('http://localhost/api/order-status', {
      method: 'POST', headers: { Origin: origin }, body: JSON.stringify(body),
    }));
  }

  assert.equal((await lookup({ token }, 'https://unrelated.example')).status, 403);
  assert.equal((await lookup({ orderNumber: 'TEST-SHIP-42', email: 'dispatch@example.test' })).status, 404);
  assert.equal((await lookup({ token: orderTrackingToken(unpaidId) })).status, 404);
  assert.equal((await lookup({ token: token.replace(orderId, unpaidId) })).status, 404);
  const before = await lookup({ token });
  assert.equal(before.headers.get('Cache-Control'), 'private, no-store');
  assert.deepEqual(await before.json(), {
    number: 'TEST-SHIP-42', fulfillmentStatus: 'unfulfilled', paymentStatus: 'paid', status: 'paid', shipments: [],
  });

  const input = { orderId, carrier: 'Test Carrier', trackingNumber: 'TRACE-42', trackingUrl: 'https://carrier.example.test/TRACE-42', complete: false };
  await assert.rejects(recordShipment({ ...input, orderId: unpaidId }), /已支付/);
  await assert.rejects(recordShipment({ ...input, trackingUrl: 'javascript:alert(1)' }), /HTTPS/);
  const [one, two] = await Promise.all([recordShipment(input), recordShipment(input)]);
  assert.equal(one.shipmentId, two.shipmentId);
  assert.equal(Number(one.existed) + Number(two.existed), 1);
  assert.equal((await (await lookup({ token })).json()).fulfillmentStatus, 'partial');
  assert.equal((await listOrderShipments(orderId)).length, 1);
  assert.equal((await listOrderShipments(orderId))[0].noticeSent, false);

  const sender = context.mock.fn(async (mail: Parameters<typeof sendEmail>[0]) => {
    assert.equal(mail.to, 'dispatch@example.test');
    assert.equal(mail.idempotencyKey, 'shipment-notice/' + one.shipmentId);
    const html = renderToStaticMarkup(mail.react);
    assert.match(html, /\/order-status#[a-z0-9.]/i);
    assert.match(html, /carrier\.example\.test\/TRACE-42/);
    return { id: 'fixture-email' };
  });
  await assert.rejects(sendShipmentNotice(one.shipmentId, async () => { throw new Error('local mail failure'); }));
  assert.equal((await listOrderShipments(orderId))[0].noticeSent, false);
  const notices = await Promise.all([sendShipmentNotice(one.shipmentId, sender), sendShipmentNotice(one.shipmentId, sender)]);
  assert.deepEqual(new Set(notices), new Set(['sent', 'already-sent']));
  assert.equal(sender.mock.callCount(), 1);
  assert.equal((await listOrderShipments(orderId))[0].noticeSent, true);

  await recordShipment({ ...input, trackingNumber: 'TRACE-43', complete: true, trackingUrl: undefined });
  await recordShipment(input);
  const response = await lookup({ token });
  assert.equal(response.status, 200);
  const { shipments, ...order } = await response.json();
  assert.deepEqual(order, { number: 'TEST-SHIP-42', fulfillmentStatus: 'fulfilled', paymentStatus: 'paid', status: 'fulfilled' });
  assert.deepEqual(shipments.map(({ carrier, number, url }: Record<string, string>) => ({ carrier, number, url })), [
    { carrier: 'Test Carrier', number: 'TRACE-42', url: 'https://carrier.example.test/TRACE-42' },
    { carrier: 'Test Carrier', number: 'TRACE-43', url: null },
  ]);
});
