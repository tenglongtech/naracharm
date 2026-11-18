import { eq } from 'drizzle-orm';
import { orderFulfillments, orders } from '@jewelry/db';
import { db as connection, type DB } from './db';
import { trackingLink } from './order-progress';

const db: DB = connection;

export async function getTrackedOrder(id: string) {
  const records = await db.select({
    order: {
      number: orders.number, status: orders.status, paymentStatus: orders.paymentStatus,
      fulfillmentStatus: orders.fulfillmentStatus,
    },
    shipment: {
      carrier: orderFulfillments.carrier, number: orderFulfillments.trackingNumber,
      url: orderFulfillments.trackingUrl, shippedAt: orderFulfillments.shippedAt,
    },
  }).from(orders)
    .leftJoin(orderFulfillments, eq(orderFulfillments.orderId, orders.id))
    .where(eq(orders.id, id))
    .orderBy(orderFulfillments.shippedAt, orderFulfillments.id);
  const order = records[0]?.order;
  if (!order || order.paymentStatus === 'unpaid') return undefined;

  return {
    ...order,
    shipments: records.flatMap(({ shipment }) => shipment ? [{
      carrier: shipment.carrier, number: shipment.number, url: trackingLink(shipment.url),
      shippedAt: shipment.shippedAt.toISOString(),
    }] : []),
  };
}

export type TrackedOrder = NonNullable<Awaited<ReturnType<typeof getTrackedOrder>>>;
