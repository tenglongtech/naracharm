import { desc, eq, inArray } from 'drizzle-orm';
import { orderFulfillments, orderLines, orders } from '@jewelry/db';
import { db as connection, type DB } from './db';
import { trackingLink } from './order-progress';
import { orderItemLabel } from './cart-types';

const db: DB = connection;
const pageSize = 10;

export async function listAccountOrders(userId: string, page: number) {
  const rows = await db.select({
    id: orders.id, number: orders.number, createdAt: orders.createdAt,
    status: orders.status, paymentStatus: orders.paymentStatus, fulfillmentStatus: orders.fulfillmentStatus,
    totalCents: orders.totalCents, currency: orders.currency,
  }).from(orders)
    .where(eq(orders.accountUserId, userId))
    .orderBy(desc(orders.createdAt), desc(orders.id))
    .limit(pageSize + 1)
    .offset((page - 1) * pageSize);

  const visible = rows.slice(0, pageSize);
  const ids = visible.map(({ id }) => id);
  const [items, shipments] = ids.length ? await Promise.all([
    db.select({ orderId: orderLines.orderId, name: orderLines.productName, variant: orderLines.variantName, quantity: orderLines.quantity })
      .from(orderLines).where(inArray(orderLines.orderId, ids)).orderBy(orderLines.id),
    db.select({ orderId: orderFulfillments.orderId, carrier: orderFulfillments.carrier, number: orderFulfillments.trackingNumber, url: orderFulfillments.trackingUrl })
      .from(orderFulfillments).where(inArray(orderFulfillments.orderId, ids)).orderBy(orderFulfillments.shippedAt, orderFulfillments.id),
  ]) : [[], []];

  return {
    nextPage: rows.length > pageSize ? page + 1 : null,
    orders: visible.map(({ id, createdAt, ...order }) => ({
      ...order,
      createdAt: createdAt.toISOString(),
      items: items.filter((item) => item.orderId === id).map(({ name, variant, quantity }) => ({ name: orderItemLabel(name, variant), quantity })),
      shipments: shipments.filter((shipment) => shipment.orderId === id)
        .map(({ carrier, number, url }) => ({ carrier, number, url: trackingLink(url) })),
    })),
  };
}

export type AccountOrders = Awaited<ReturnType<typeof listAccountOrders>>;
