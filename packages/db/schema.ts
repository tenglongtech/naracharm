/**
 * Drizzle ORM Schema —— 手工民族融合首饰跨境电商
 *
 * 数据库: Neon (Serverless PostgreSQL)
 * 说明文档: ./SCHEMA.md
 *
 * 注意: 金额一律用整数分 (cents)。UUID 主键。
 */

import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// 枚举
// ---------------------------------------------------------------------------

export const productCategory = pgEnum('product_category', [
  'phone-charm', // 手机挂链
  'necklace', // 项链
  'bracelet', // 手链
  'earrings', // 耳钉
]);

export const productStatus = pgEnum('product_status', [
  'draft',
  'active',
  'archived',
]);

export const orderStatus = pgEnum('order_status', [
  'pending',
  'paid',
  'fulfilled',
  'cancelled',
  'refunded',
]);

export const paymentStatus = pgEnum('payment_status', [
  'unpaid',
  'paid',
  'refunded',
  'partially_refunded',
]);

export const fulfillmentStatus = pgEnum('fulfillment_status', [
  'unfulfilled',
  'partial',
  'fulfilled',
]);

export const discountType = pgEnum('discount_type', [
  'percentage',
  'fixed_amount',
  'free_shipping',
]);

export const discountStatus = pgEnum('discount_status', [
  'active',
  'expired',
  'disabled',
]);

// 文化来源（可作为字符串字段的取值参考，不强制枚举以便扩展）
export const HERITAGE = [
  'tibetan', // 藏
  'mongol', // 蒙古
  'tai', // 泰
  'southwest', // 西南少数民族
  'han', // 汉
  'fusion', // 融合
] as const;

// ---------------------------------------------------------------------------
// Collections —— 系列
// ---------------------------------------------------------------------------

export const collections = pgTable('collections', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  heritage: text('heritage'),
  imageUrl: text('image_url'),
  sortOrder: integer('sort_order').default(0).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Products —— 商品 (SPU)
// ---------------------------------------------------------------------------

export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    subtitle: text('subtitle'),
    description: text('description'),
    category: productCategory('category').notNull(),
    collectionId: uuid('collection_id').references(() => collections.id),
    heritage: text('heritage'),
    materials: text('materials').array(),
    basePriceCents: integer('base_price_cents').notNull(),
    compareAtPriceCents: integer('compare_at_price_cents'),
    status: productStatus('status').default('draft').notNull(),
    isFeatured: boolean('is_featured').default(false).notNull(),
    craftStory: text('craft_story'),
    careNotes: text('care_notes'),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    categoryIdx: index('products_category_idx').on(t.category),
    statusIdx: index('products_status_idx').on(t.status),
    collectionIdx: index('products_collection_idx').on(t.collectionId),
    featuredIdx: index('products_featured_idx').on(t.isFeatured),
  }),
);

// ---------------------------------------------------------------------------
// Product Variants —— 商品变体 (SKU)
// ---------------------------------------------------------------------------

export const productVariants = pgTable(
  'product_variants',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id')
      .references(() => products.id, { onDelete: 'cascade' })
      .notNull(),
    sku: text('sku').notNull().unique(),
    name: text('name').notNull(),
    options: jsonb('options').$type<Record<string, string>>(),
    priceCents: integer('price_cents'),
    weightGrams: integer('weight_grams').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    productIdx: index('variants_product_idx').on(t.productId),
  }),
);

// ---------------------------------------------------------------------------
// Inventory —— 库存 (与 variant 1:1)
// ---------------------------------------------------------------------------

export const inventory = pgTable(
  'inventory',
  {
    variantId: uuid('variant_id')
      .references(() => productVariants.id, { onDelete: 'cascade' })
      .primaryKey(),
    quantity: integer('quantity').default(0).notNull(),
    reserved: integer('reserved').default(0).notNull(),
    allowBackorder: boolean('allow_backorder').default(false).notNull(),
    lowStockThreshold: integer('low_stock_threshold').default(5).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
);

// 可售库存 = quantity - reserved
export function availableStock(row: { quantity: number; reserved: number }) {
  return Math.max(0, row.quantity - row.reserved);
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

export const productImages = pgTable(
  'product_images',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id')
      .references(() => products.id, { onDelete: 'cascade' })
      .notNull(),
    url: text('url').notNull(),
    altText: text('alt_text'),
    sortOrder: integer('sort_order').default(0).notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
  },
  (t) => ({
    productIdx: index('product_images_product_idx').on(t.productId),
  }),
);

export const variantImages = pgTable(
  'variant_images',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    variantId: uuid('variant_id')
      .references(() => productVariants.id, { onDelete: 'cascade' })
      .notNull(),
    url: text('url').notNull(),
    altText: text('alt_text'),
    sortOrder: integer('sort_order').default(0).notNull(),
  },
);

// ---------------------------------------------------------------------------
// Discounts —— 优惠券 (需先于 orders 定义,因 orders 引用)
// ---------------------------------------------------------------------------

export const discounts = pgTable('discounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  type: discountType('type').notNull(),
  value: integer('value').notNull(), // 百分比 0-100 或金额(分)
  minSubtotalCents: integer('min_subtotal_cents'),
  usageLimit: integer('usage_limit'),
  usedCount: integer('used_count').default(0).notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  status: discountStatus('status').default('active').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Customers & Addresses
// ---------------------------------------------------------------------------

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  authUserId: text('auth_user_id'), // 关联 Better Auth
  defaultShippingAddressId: uuid('default_shipping_address_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const addresses = pgTable('addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id')
    .references(() => customers.id, { onDelete: 'cascade' })
    .notNull(),
  line1: text('line1').notNull(),
  line2: text('line2'),
  city: text('city').notNull(),
  state: text('state'),
  postalCode: text('postal_code'),
  countryCode: text('country_code').notNull(),
  phone: text('phone'),
  isDefault: boolean('is_default').default(false).notNull(),
});

// ---------------------------------------------------------------------------
// Carts
// ---------------------------------------------------------------------------

export const carts = pgTable('carts', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id),
  guestToken: text('guest_token'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const cartLines = pgTable('cart_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  cartId: uuid('cart_id')
    .references(() => carts.id, { onDelete: 'cascade' })
    .notNull(),
  variantId: uuid('variant_id')
    .references(() => productVariants.id)
    .notNull(),
  quantity: integer('quantity').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    number: text('number').notNull().unique(), // SS-10001
    customerId: uuid('customer_id').references(() => customers.id),
    email: text('email').notNull(),
    status: orderStatus('status').default('pending').notNull(),
    paymentStatus: paymentStatus('payment_status').default('unpaid').notNull(),
    fulfillmentStatus: fulfillmentStatus('fulfillment_status')
      .default('unfulfilled')
      .notNull(),
    currency: text('currency').default('USD').notNull(),
    subtotalCents: integer('subtotal_cents').notNull(),
    shippingCents: integer('shipping_cents').default(0).notNull(),
    taxCents: integer('tax_cents').default(0).notNull(),
    discountCents: integer('discount_cents').default(0).notNull(),
    totalCents: integer('total_cents').notNull(),
    shippingAddress: jsonb('shipping_address').notNull(),
    billingAddress: jsonb('billing_address'),
    stripeCheckoutSessionId: text('stripe_checkout_session_id'),
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    discountId: uuid('discount_id').references(() => discounts.id),
    placedAt: timestamp('placed_at', { withTimezone: true }),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    fulfilledAt: timestamp('fulfilled_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    customerIdx: index('orders_customer_idx').on(t.customerId),
    statusIdx: index('orders_status_idx').on(t.status),
    emailIdx: index('orders_email_idx').on(t.email),
  }),
);

export const orderLines = pgTable('order_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),
  variantId: uuid('variant_id'), // 软引用,商品下架不删
  productName: text('product_name').notNull(),
  variantName: text('variant_name'),
  sku: text('sku'),
  unitPriceCents: integer('unit_price_cents').notNull(),
  quantity: integer('quantity').notNull(),
  imageUrl: text('image_url'),
});

export const orderFulfillments = pgTable('order_fulfillments', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),
  carrier: text('carrier').notNull(),
  trackingNumber: text('tracking_number'),
  trackingUrl: text('tracking_url'),
  shippedAt: timestamp('shipped_at', { withTimezone: true }).defaultNow().notNull(),
});

export const orderEvents = pgTable('order_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),
  type: text('type').notNull(),
  payload: jsonb('payload'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Abandoned Carts —— 弃单挽回
// ---------------------------------------------------------------------------

export const abandonedCarts = pgTable('abandoned_carts', {
  id: uuid('id').defaultRandom().primaryKey(),
  cartId: uuid('cart_id').references(() => carts.id, { onDelete: 'cascade' }),
  email: text('email'),
  recoveryEmailSentAt: timestamp('recovery_email_sent_at', { withTimezone: true }),
  recoveredAt: timestamp('recovered_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const productsRelations = relations(products, ({ one, many }) => ({
  collection: one(collections, {
    fields: [products.collectionId],
    references: [collections.id],
  }),
  variants: many(productVariants),
  images: many(productImages),
}));

export const variantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  inventory: one(inventory, {
    fields: [productVariants.id],
    references: [inventory.variantId],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  lines: many(orderLines),
  fulfillments: many(orderFulfillments),
  events: many(orderEvents),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderLine = typeof orderLines.$inferSelect;
export type Customer = typeof customers.$inferSelect;
