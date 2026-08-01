/**
 * 种子脚本: 生产库导入示例订单 + 客户
 * 用法: cd apps/web && set -a && source /tmp/.env.prod && set +a && npx tsx ../../scripts/seed-orders.ts
 */
import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { customers, orders, orderLines, productVariants, products, productReviews } from '../packages/db/schema';
import { eq, sql } from 'drizzle-orm';

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle({ client, schema: { customers, orders, orderLines, productVariants, products, productReviews } });

const ORDERS_DATA: {
  email: string; firstName: string; lastName: string;
  productSlug: string; qty: number; daysAgo: number; status: 'pending'|'paid'|'fulfilled';
}[] = [
  { email: 'emily.c@example.com', firstName: 'Emily', lastName: 'Carter', productSlug: 'amethyst-peace-bracelet', qty: 1, daysAgo: 28, status: 'fulfilled' },
  { email: 'sarah.k@example.com', firstName: 'Sarah', lastName: 'Kim', productSlug: 'turquoise-sky-bracelet', qty: 2, daysAgo: 24, status: 'fulfilled' },
  { email: 'david.k@example.com', firstName: 'David', lastName: 'Kim', productSlug: 'tibetan-amulet-925-bracelet', qty: 1, daysAgo: 21, status: 'fulfilled' },
  { email: 'priya.s@example.com', firstName: 'Priya', lastName: 'Sharma', productSlug: 'lotus-jade-bracelet', qty: 1, daysAgo: 18, status: 'fulfilled' },
  { email: 'jessica.l@example.com', firstName: 'Jessica', lastName: 'Liu', productSlug: 'strawberry-quartz-bracelet', qty: 1, daysAgo: 15, status: 'fulfilled' },
  { email: 'zoe.l@example.com', firstName: 'Zoe', lastName: 'Lee', productSlug: 'miao-filigree-drop-earrings', qty: 1, daysAgo: 12, status: 'fulfilled' },
  { email: 'mike.r@example.com', firstName: 'Mike', lastName: 'Rivera', productSlug: 'obsidian-guardian-charm', qty: 2, daysAgo: 9, status: 'fulfilled' },
  { email: 'elena.s@example.com', firstName: 'Elena', lastName: 'Silva', productSlug: 'caravan-fusion-necklace', qty: 1, daysAgo: 7, status: 'paid' },
  { email: 'alex.p@example.com', firstName: 'Alex', lastName: 'Park', productSlug: 'obsidian-guard-charm', qty: 1, daysAgo: 4, status: 'paid' },
  { email: 'nina.h@example.com', firstName: 'Nina', lastName: 'Haddad', productSlug: 'mixed-crystal-bracelet', qty: 1, daysAgo: 2, status: 'pending' },
  { email: 'yuna.h@example.com', firstName: 'Yuna', lastName: 'Hwang', productSlug: 'tai-silk-cord-phone-charm', qty: 1, daysAgo: 1, status: 'pending' },
  { email: 'tenzin.d@example.com', firstName: 'Tenzin', lastName: 'Dolma', productSlug: 'hadas-knot-red-cord', qty: 1, daysAgo: 1, status: 'pending' },
];

async function seed() {
  console.log('📦 导入示例订单...\n');

  let n = 0;
  for (const o of ORDERS_DATA) {
    const number = `NC-${String(1000 + n)}`;
    const existingOrder = await db.query.orders.findFirst({ where: (od, { eq }) => eq(od.number, number) });
    if (existingOrder) { n++; console.log(`  [跳过] ${number} (已存在)`); continue; }
    // 客户
    let cust = await db.query.customers.findFirst({ where: (c, { eq }) => eq(c.email, o.email) });
    if (!cust) {
      const [created] = await db.insert(customers).values({
        email: o.email, firstName: o.firstName, lastName: o.lastName,
      }).returning();
      cust = created;
    }

    // 产品变体
    const prod = await db.query.products.findFirst({ where: (p, { eq }) => eq(p.slug, o.productSlug) });
    if (!prod) { console.log(`  [跳过] 无产品 ${o.productSlug}`); continue; }
    const variant = await db.query.productVariants.findFirst({ where: (v, { eq }) => eq(v.productId, prod.id) });
    if (!variant) continue;

    const unitPrice = variant.priceCents ?? prod.basePriceCents;
    const subtotal = unitPrice * o.qty;
    const shipping = subtotal >= 12000 ? 0 : 690;
    const total = subtotal + shipping;
    const placed = new Date(Date.now() - o.daysAgo * 86400000);

    const [order] = await db.insert(orders).values({
      number,
      customerId: cust.id,
      email: o.email,
      status: o.status,
      paymentStatus: o.status === 'fulfilled' || o.status === 'paid' ? 'paid' : 'unpaid',
      fulfillmentStatus: o.status === 'fulfilled' ? 'fulfilled' : o.status === 'paid' ? 'unfulfilled' : 'unfulfilled',
      currency: 'USD',
      subtotalCents: subtotal,
      shippingCents: shipping,
      taxCents: 0,
      discountCents: 0,
      totalCents: total,
      shippingAddress: { line1: '123 Market St', city: 'San Francisco', postalCode: '94103', countryCode: 'US' },
      billingAddress: { line1: '123 Market St', city: 'San Francisco', postalCode: '94103', countryCode: 'US' },
      placedAt: placed,
    }).returning();

    await db.insert(orderLines).values({
      orderId: order.id,
      variantId: variant.id,
      productName: prod.name,
      variantName: variant.name,
      sku: variant.sku,
      unitPriceCents: unitPrice,
      quantity: o.qty,
    });

    // 订单客户 → 标记其评价为 verified
    await db.update(productReviews).set({ isVerifiedPurchase: true })
      .where(sql`${productReviews.productId} = ${prod.id} AND ${productReviews.authorName} = ${o.firstName}`);

    n++;
    console.log(`  [新增] ${number} — ${o.email} — ${prod.name} x${o.qty} — $${(total/100).toFixed(2)}`);
  }

  console.log(`\n✅ 导入 ${n} 个示例订单完成!`);
  process.exit(0);
}
seed().catch((err) => { console.error(err); process.exit(1); });
