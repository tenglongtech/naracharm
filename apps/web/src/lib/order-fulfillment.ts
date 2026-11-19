import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { orderEvents, orderFulfillments, orderLines, orders } from '@jewelry/db';
import { ShippingUpdateEmail } from '@/emails/shipping-update';
import { db as connection, type DB } from './db';
import { sendEmail } from './email';
import { trackingLink } from './order-progress';
import { orderTrackingUrl } from './order-tracking-token';

const db: DB = connection;

export const shipmentInput = z.object({
  orderId: z.uuid(),
  carrier: z.string().trim().min(1).max(80),
  trackingNumber: z.string().trim().min(1).max(120),
  trackingUrl: z.string().trim().max(1200).optional()
    .refine(value => !value || trackingLink(value) !== null)
    .transform(value => trackingLink(value || null)),
  complete: z.boolean(),
});

export class ShipmentError extends Error {}

function packingAddress(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const fields = value as Record<string, unknown>;
  const textField = (key: string) => {
    const field = fields[key];
    return typeof field === 'string' ? field.trim() || null : null;
  };
  const address = {
    name: textField('name'),
    line1: textField('line1'),
    line2: textField('line2'),
    city: textField('city'),
    state: textField('state'),
    postalCode: textField('postal_code') ?? textField('postalCode'),
    country: textField('country') ?? textField('countryCode'),
  };
  return Object.values(address).some(Boolean) ? address : null;
}

export async function getOrderPackingDetails(orderId: string) {
  const [order] = await db.select({ shippingAddress: orders.shippingAddress })
    .from(orders).where(eq(orders.id, orderId));
  if (!order) return null;

  const items = await db.select({
    id: orderLines.id, productName: orderLines.productName, variantName: orderLines.variantName,
    sku: orderLines.sku, quantity: orderLines.quantity,
  }).from(orderLines).where(eq(orderLines.orderId, orderId))
    .orderBy(orderLines.productName, orderLines.sku, orderLines.id);

  return { shippingAddress: packingAddress(order.shippingAddress), items };
}

export async function listOrderShipments(orderId: string) {
  return db.select({
    id: orderFulfillments.id, carrier: orderFulfillments.carrier,
    trackingNumber: orderFulfillments.trackingNumber, trackingUrl: orderFulfillments.trackingUrl,
    shippedAt: orderFulfillments.shippedAt,
    noticeSent: sql<boolean>`${orderEvents.id} is not null`,
  }).from(orderFulfillments)
    .leftJoin(orderEvents, and(
      eq(orderEvents.orderId, orderFulfillments.orderId), eq(orderEvents.type, 'shipment_notice_sent'),
      sql`${orderEvents.payload}->>'shipmentId' = ${orderFulfillments.id}::text`,
    ))
    .where(eq(orderFulfillments.orderId, orderId))
    .orderBy(orderFulfillments.shippedAt, orderFulfillments.id);
}

export type AdminShipment = Awaited<ReturnType<typeof listOrderShipments>>[number];

export async function recordShipment(raw: z.input<typeof shipmentInput>) {
  const validated = shipmentInput.safeParse(raw);
  if (!validated.success) throw new ShipmentError('请填写承运商、运单号和有效的 HTTPS 物流网址。');
  const { orderId, carrier, trackingNumber, trackingUrl, complete } = validated.data;

  return db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for('update');
    if (!order || !['paid', 'fulfilled'].includes(order.status)
      || !['paid', 'partially_refunded'].includes(order.paymentStatus)) {
      throw new ShipmentError('只有已支付且可发货的订单可以录入物流。');
    }

    const [existing] = await tx.select().from(orderFulfillments).where(and(
      eq(orderFulfillments.orderId, orderId), sql`lower(${orderFulfillments.carrier}) = lower(${carrier})`,
      eq(orderFulfillments.trackingNumber, trackingNumber),
    )).limit(1);
    const [shipment] = existing ? [existing] : await tx.insert(orderFulfillments)
      .values({ orderId, carrier, trackingNumber, trackingUrl }).returning();
    if (!existing) await tx.insert(orderEvents).values({
      orderId, type: 'shipment_recorded', payload: { shipmentId: shipment.id },
    });

    const fulfilled = complete || order.fulfillmentStatus === 'fulfilled';
    await tx.update(orders).set({
      fulfillmentStatus: fulfilled ? 'fulfilled' : 'partial',
      ...(fulfilled ? { status: 'fulfilled', fulfilledAt: order.fulfilledAt ?? shipment.shippedAt } : {}),
      updatedAt: new Date(),
    }).where(eq(orders.id, orderId));

    return { shipmentId: shipment.id, existed: Boolean(existing) };
  });
}

export async function sendShipmentNotice(shipmentId: string, deliver = sendEmail) {
  if (!z.uuid().safeParse(shipmentId).success) throw new ShipmentError('找不到该包裹。');

  return db.transaction(async (tx) => {
    const [shipment] = await tx.select().from(orderFulfillments)
      .where(eq(orderFulfillments.id, shipmentId)).for('update');
    if (!shipment || !shipment.trackingNumber) throw new ShipmentError('发送通知前请先记录运单号。');

    const [sent] = await tx.select({ id: orderEvents.id }).from(orderEvents).where(and(
      eq(orderEvents.orderId, shipment.orderId), eq(orderEvents.type, 'shipment_notice_sent'),
      sql`${orderEvents.payload}->>'shipmentId' = ${shipment.id}`,
    )).limit(1);
    if (sent) return 'already-sent' as const;

    const [order] = await tx.select({
      email: orders.email, number: orders.number, paymentStatus: orders.paymentStatus, status: orders.status,
    }).from(orders).where(eq(orders.id, shipment.orderId));
    if (!order || !['paid', 'fulfilled'].includes(order.status)
      || !['paid', 'partially_refunded'].includes(order.paymentStatus)) {
      throw new ShipmentError('这笔订单目前无法发送发货通知。');
    }

    const receipt = await deliver({
      to: order.email,
      subject: `Shipping update for order ${order.number}`,
      idempotencyKey: 'shipment-notice/' + shipment.id,
      react: ShippingUpdateEmail({
        orderNumber: order.number, carrier: shipment.carrier, trackingNumber: shipment.trackingNumber,
        trackingUrl: trackingLink(shipment.trackingUrl) ?? undefined,
        orderStatusUrl: orderTrackingUrl(shipment.orderId, shipment.shippedAt),
      }),
    });
    if (receipt && 'dev' in receipt) return 'unconfigured' as const;
    if (!receipt?.id) throw new ShipmentError('邮件服务未确认接收，请稍后重试。');

    await tx.insert(orderEvents).values({
      orderId: shipment.orderId, type: 'shipment_notice_sent', payload: { shipmentId: shipment.id, emailId: receipt.id },
    });
    return 'sent' as const;
  });
}
