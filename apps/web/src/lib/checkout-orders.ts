import { createHash } from 'node:crypto';
import { and, asc, eq, inArray, or, sql } from 'drizzle-orm';
import { customers, discounts, inventory, orderEvents, orderLines, orders, products, productVariants } from '@jewelry/db';
import type Stripe from 'stripe';
import { db as connection, type DB } from './db';
import { MAX_CART_LINE_QUANTITY, standardShippingCents } from './cart-types';
import { calculateDiscount } from './discount-actions';
import { CheckoutError, type CheckoutRequest, type CheckoutTotals } from './checkout-request';

const db: DB = connection;
type Transaction = Parameters<Parameters<DB['transaction']>[0]>[0];
type Order = typeof orders.$inferSelect;
type OrderLine = typeof orderLines.$inferSelect;
export const reservationLifetimeSeconds = 60 * 60;

function fingerprint(input: CheckoutRequest) {
  const lines = input.lines.map(({ sku, variantId, productSlug, quantity }) => (
    JSON.stringify([sku ?? '', variantId ?? '', productSlug ?? '', quantity])
  )).sort();
  return createHash('sha256').update(JSON.stringify([input.email, input.discountCode ?? '', lines])).digest('hex');
}

async function nextOrderNumber(tx: Transaction): Promise<string> {
  while (true) {
    const [row] = await tx.execute<{ number: string }>(sql`select nextval('order_number_seq')::text as number`);
    const number = `NC-${row.number.padStart(5, '0')}`;
    const [existing] = await tx.select({ id: orders.id }).from(orders).where(eq(orders.number, number));
    if (!existing) return number;
  }
}

async function checkoutLines(tx: Transaction, input: CheckoutRequest) {
  const refs = [...new Set(input.lines.flatMap((line) => [line.productSlug, line.sku].filter((value): value is string => Boolean(value))))];
  const ids = [...new Set(input.lines.flatMap((line) => line.variantId ? [line.variantId] : []))];
  const candidates = await tx.select({
    variantId: productVariants.id,
    productId: products.id,
    slug: products.slug,
    sku: productVariants.sku,
    productName: products.name,
    variantName: productVariants.name,
    unitPriceCents: sql<number>`coalesce(${productVariants.priceCents}, ${products.basePriceCents})`,
    stock: inventory.quantity,
    reserved: inventory.reserved,
  })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .innerJoin(inventory, eq(inventory.variantId, productVariants.id))
    .where(and(eq(products.status, 'active'), or(
      inArray(products.slug, refs), inArray(productVariants.sku, refs),
      inArray(productVariants.id, ids), inArray(products.id, ids),
    )))
    .orderBy(asc(inventory.variantId))
    .for('update', { of: inventory });

  const quantities = new Map<string, number>();
  for (const line of input.lines) {
    const options = candidates.filter((candidate) => {
      if (line.productSlug) return candidate.slug === line.productSlug;
      if (line.sku) return candidate.sku === line.sku || candidate.slug === line.sku;
      return candidate.variantId === line.variantId || candidate.productId === line.variantId;
    });
    const byId = options.find((candidate) => candidate.variantId === line.variantId);
    const bySku = options.find((candidate) => candidate.sku === line.sku);
    if (byId && bySku && byId !== bySku) {
      throw new CheckoutError('A piece in your cart is no longer available. Review your cart and try again.', 409);
    }
    const exact = byId ?? bySku;
    const only = options.length === 1 ? options[0] : undefined;
    const match = exact ?? (only && (!line.variantId || only.productId === line.variantId) ? only : undefined);
    if (!match) throw new CheckoutError('A piece in your cart is no longer available. Review your cart and try again.', 409);
    quantities.set(match.variantId, (quantities.get(match.variantId) ?? 0) + line.quantity);
  }

  return candidates.filter((candidate) => quantities.has(candidate.variantId)).map((candidate) => {
    const quantity = quantities.get(candidate.variantId)!;
    if (quantity > MAX_CART_LINE_QUANTITY || quantity > candidate.stock - candidate.reserved || candidate.unitPriceCents <= 0) {
      throw new CheckoutError(`${candidate.productName} is unavailable in the requested quantity.`, 409);
    }
    return {
      variantId: candidate.variantId, productName: candidate.productName, variantName: candidate.variantName,
      sku: candidate.sku, quantity, unitPriceCents: candidate.unitPriceCents,
    };
  });
}

function verifyExpectedTotals(
  expected: CheckoutRequest['expectedTotals'], totals: CheckoutTotals,
  lines: Pick<OrderLine, 'productName' | 'unitPriceCents' | 'quantity'>[],
) {
  const { subtotalCents, discountCents, shippingCents } = totals;
  if (!expected || (
    expected.subtotalCents === subtotalCents
    && expected.discountCents === discountCents
    && expected.shippingCents === shippingCents
  )) return;

  throw new CheckoutError('Your order total has changed. Review the updated amounts before continuing.', 409, 'quote_changed', {
    subtotalCents, discountCents, shippingCents,
    items: lines.map(({ productName, unitPriceCents, quantity }) => ({ productName, unitPriceCents, quantity })),
  });
}

export async function reserveCheckout(input: CheckoutRequest, returnUrl: string, accountUserId: string | null = null) {
  const requestHash = fingerprint(input);
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${'checkout:' + input.checkoutId}, 0))`);
    const [existing] = await tx.select().from(orders).where(eq(orders.id, input.checkoutId));
    if (existing) {
      const [event] = await tx.select({ payload: orderEvents.payload }).from(orderEvents)
        .where(and(eq(orderEvents.orderId, existing.id), eq(orderEvents.type, 'checkout_reserved'))).limit(1);
      const reservation = event?.payload as { requestHash: string; returnUrl: string } | undefined;
      if (reservation?.requestHash !== requestHash) {
        throw new CheckoutError('The cart changed. Start a new checkout.', 409);
      }
      if (existing.accountUserId !== accountUserId) {
        throw new CheckoutError('Your sign-in changed. Sign in with the original account or start a new checkout.', 409, 'session_changed');
      }
      if (existing.status !== 'pending' && existing.paymentStatus !== 'paid') {
        throw new CheckoutError('This checkout has ended. Review your order or start a new checkout.', 410);
      }
      const lines = await tx.select().from(orderLines).where(eq(orderLines.orderId, existing.id)).orderBy(asc(orderLines.variantId));
      if (existing.paymentStatus !== 'paid') verifyExpectedTotals(input.expectedTotals, existing, lines);
      return { order: existing, lines, returnUrl: reservation.returnUrl, existing: true };
    }

    const lines = await checkoutLines(tx, input);
    const subtotalCents = lines.reduce((subtotal, line) => subtotal + line.unitPriceCents * line.quantity, 0);
    const [discount] = input.discountCode ? await tx.select().from(discounts).where(eq(discounts.code, input.discountCode)).for('update') : [];
    const discountResult = input.discountCode ? calculateDiscount(discount, subtotalCents) : undefined;
    if (discountResult && !discountResult.valid) {
      throw new CheckoutError(discountResult.error ?? 'Discount code is unavailable.', 409, 'discount_unavailable');
    }

    const discountCents = discountResult?.discountAmountCents ?? 0;
    const shippingCents = standardShippingCents(subtotalCents, discountResult?.freeShipping);
    verifyExpectedTotals(input.expectedTotals, { subtotalCents, discountCents, shippingCents }, lines);
    for (const line of lines) {
      await tx.update(inventory).set({
        reserved: sql`${inventory.reserved} + ${line.quantity}`, updatedAt: new Date(),
      }).where(eq(inventory.variantId, line.variantId));
    }
    if (discount) {
      await tx.update(discounts).set({ usedCount: sql`${discounts.usedCount} + 1` }).where(eq(discounts.id, discount.id));
    }

    const [order] = await tx.insert(orders).values({
      id: input.checkoutId, number: await nextOrderNumber(tx), email: input.email, currency: 'usd',
      accountUserId,
      subtotalCents, shippingCents, discountCents, totalCents: subtotalCents - discountCents + shippingCents,
      discountId: discount?.id, shippingAddress: {},
    }).returning();
    await tx.insert(orderLines).values(lines.map((line) => ({ ...line, orderId: order.id })));
    await tx.insert(orderEvents).values({
      orderId: order.id, type: 'checkout_reserved', payload: { requestHash, returnUrl },
    });
    return { order, lines, returnUrl, existing: false };
  });
}

export async function saveCheckoutSession(orderId: string, sessionId: string) {
  const rows = await db.update(orders).set({ stripeCheckoutSessionId: sessionId, updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), or(eq(orders.stripeCheckoutSessionId, sessionId), sql`${orders.stripeCheckoutSessionId} is null`)))
    .returning({ id: orders.id });
  if (!rows.length) throw new Error('Stripe Checkout Session could not be linked to the order');
}

async function lockedOrder(tx: Transaction, orderId: string) {
  const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for('update');
  return order;
}

async function applyInventory(tx: Transaction, lines: Pick<OrderLine, 'variantId' | 'quantity'>[], paid: boolean) {
  for (const line of lines) {
    if (!line.variantId) throw new Error('A checkout line is missing its inventory reference');
    const [updated] = await tx.update(inventory).set({
      ...(paid ? { quantity: sql`${inventory.quantity} - ${line.quantity}` } : {}),
      reserved: sql`${inventory.reserved} - ${line.quantity}`, updatedAt: new Date(),
    }).where(and(eq(inventory.variantId, line.variantId), sql`${inventory.reserved} >= ${line.quantity}`,
      paid ? sql`${inventory.quantity} >= ${line.quantity}` : undefined,
    )).returning({ variantId: inventory.variantId });
    if (!updated) throw new Error('The checkout inventory reservation could not be settled');
  }
}

async function orderItems(tx: Transaction, orderId: string) {
  return tx.select().from(orderLines).where(eq(orderLines.orderId, orderId)).orderBy(asc(orderLines.variantId));
}

async function cancelOrder(tx: Transaction, order: Order, reason: string, sessionId?: string) {
  if (order.status !== 'pending') return;
  await applyInventory(tx, await orderItems(tx, order.id), false);
  if (order.discountId) {
    await tx.update(discounts).set({ usedCount: sql`greatest(0, ${discounts.usedCount} - 1)` }).where(eq(discounts.id, order.discountId));
  }
  await tx.update(orders).set({
    status: 'cancelled', stripeCheckoutSessionId: sessionId ?? order.stripeCheckoutSessionId, updatedAt: new Date(),
  }).where(eq(orders.id, order.id));
  await tx.insert(orderEvents).values({ orderId: order.id, type: 'checkout_cancelled', payload: { reason } });
}

export async function cancelRejectedCheckout(orderId: string) {
  await db.transaction(async (tx) => {
    const order = await lockedOrder(tx, orderId);
    if (order && !order.stripeCheckoutSessionId) await cancelOrder(tx, order, 'stripe_rejected');
  });
}

function shippingAddress(session: Stripe.Checkout.Session) {
  const details = session.collected_information?.shipping_details
    ?? (session as Stripe.Checkout.Session & { shipping_details?: NonNullable<Stripe.Checkout.Session['collected_information']>['shipping_details'] }).shipping_details;
  return details?.address ? { ...details.address, name: details.name } : undefined;
}

async function customerFor(tx: Transaction, email: string) {
  const [created] = await tx.insert(customers).values({ email }).onConflictDoNothing({ target: customers.email }).returning({ id: customers.id });
  const [customer] = created ? [created] : await tx.select({ id: customers.id }).from(customers).where(eq(customers.email, email));
  return customer.id;
}

export async function settleCheckout(session: Stripe.Checkout.Session, event: 'paid' | 'cancelled') {
  const orderId = session.client_reference_id;
  if (!orderId) throw new Error('Stripe Checkout Session is missing the order reference');
  return db.transaction(async (tx) => {
    const order = await lockedOrder(tx, orderId);
    if (!order) throw new Error('Stripe Checkout Session has no matching order');
    if (order.stripeCheckoutSessionId && order.stripeCheckoutSessionId !== session.id) {
      throw new Error('Stripe Checkout Session does not match the order');
    }
    if (order.status !== 'pending') return;
    if (event === 'cancelled') {
      await cancelOrder(tx, order, 'stripe_terminal', session.id);
      return;
    }
    if (session.currency !== order.currency || session.amount_total !== order.totalCents
      || session.amount_subtotal !== order.subtotalCents || session.total_details?.amount_shipping !== order.shippingCents
      || session.total_details?.amount_discount !== order.discountCents) {
      throw new Error('Stripe payment totals do not match the reserved order');
    }
    const address = shippingAddress(session);
    if (!address) throw new Error('Stripe payment is missing its shipping address');

    const lines = await orderItems(tx, order.id);
    await applyInventory(tx, lines, true);
    const email = (session.customer_details?.email ?? order.email).trim().toLowerCase();
    const now = new Date();
    await tx.update(orders).set({
      email, customerId: await customerFor(tx, email), status: 'paid', paymentStatus: 'paid',
      shippingAddress: address, stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
      placedAt: now, paidAt: now, updatedAt: now,
    }).where(eq(orders.id, order.id));
    await tx.insert(orderEvents).values({
      orderId: order.id, type: 'payment_received', payload: { sessionId: session.id, amount: order.totalCents },
    });
    return { ...order, email, lines };
  });
}

export async function checkoutStatus(sessionId: string) {
  const [order] = await db.select({
    number: orders.number, status: orders.status, paymentStatus: orders.paymentStatus,
    totalCents: orders.totalCents, currency: orders.currency,
  }).from(orders).where(eq(orders.stripeCheckoutSessionId, sessionId)).limit(1);
  if (!order) return undefined;
  if (order.status === 'cancelled') return { status: 'cancelled' as const };
  if (order.paymentStatus !== 'paid') return { status: 'pending' as const };
  return { status: 'paid' as const, number: order.number, totalCents: order.totalCents, currency: order.currency };
}

export async function settleLegacyCheckout(
  session: Stripe.Checkout.Session,
  lines: Pick<OrderLine, 'variantId' | 'sku' | 'quantity' | 'unitPriceCents'>[],
) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${'stripe:' + session.id}, 0))`);
    const [existing] = await tx.select({ id: orders.id }).from(orders).where(eq(orders.stripeCheckoutSessionId, session.id));
    if (existing) return;

    const email = (session.customer_details?.email ?? session.customer_email)?.trim().toLowerCase();
    const address = shippingAddress(session);
    if (!email || !address || session.amount_total === null || session.amount_subtotal === null || !session.currency) {
      throw new Error('Legacy Stripe payment has incomplete order details');
    }
    const sorted = [...lines].sort((left, right) => (left.variantId ?? '').localeCompare(right.variantId ?? ''));
    await applyInventory(tx, sorted, true);
    const now = new Date();
    const [order] = await tx.insert(orders).values({
      number: await nextOrderNumber(tx), customerId: await customerFor(tx, email), email, status: 'paid', paymentStatus: 'paid',
      currency: session.currency, subtotalCents: session.amount_subtotal, totalCents: session.amount_total,
      shippingCents: session.total_details?.amount_shipping ?? 0, discountCents: session.total_details?.amount_discount ?? 0,
      taxCents: session.total_details?.amount_tax ?? 0, shippingAddress: address, stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
      placedAt: now, paidAt: now,
    }).returning();
    const items = await tx.insert(orderLines).values(sorted.map((line) => ({
      ...line, orderId: order.id, productName: line.sku ?? 'Jewelry',
    }))).returning();
    await tx.insert(orderEvents).values({
      orderId: order.id, type: 'payment_received', payload: { sessionId: session.id, amount: order.totalCents },
    });
    return { ...order, lines: items };
  });
}
