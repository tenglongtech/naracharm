'use server';

/**
 * 后台数据访问层 (Server Actions)
 * 所有后台 CRUD 操作集中在此,供 antd 组件调用。
 *
 * 注意: 当前无权限校验。Phase 4 接 Better Auth 后,每个 action 加登录验证。
 */
import { db } from '@/lib/db';
import { products, collections, orders, customers, discounts, productVariants, inventory, productImages } from '@jewelry/db';
import { eq, desc, count, sql, and } from 'drizzle-orm';

// ─── 仪表盘统计 ──────────────────────────────────────────────────────────
export async function getDashboardStats() {
  const [productCount] = await db.select({ value: count() }).from(products);
  const [orderCount] = await db.select({ value: count() }).from(orders);
  const [customerCount] = await db.select({ value: count() }).from(customers);
  const [activeDiscounts] = await db
    .select({ value: count() })
    .from(discounts)
    .where(eq(discounts.status, 'active'));

  // 低库存商品数
  const [lowStock] = await db
    .select({ value: count() })
    .from(inventory)
    .where(sql`${inventory.quantity} - ${inventory.reserved} <= ${inventory.lowStockThreshold}`);

  // 销售额 (已支付订单)
  const revenueResult = await db
    .select({ total: sql<number>`coalesce(sum(${orders.totalCents}), 0)` })
    .from(orders)
    .where(eq(orders.paymentStatus, 'paid'));

  return {
    productCount: productCount?.value ?? 0,
    orderCount: orderCount?.value ?? 0,
    customerCount: customerCount?.value ?? 0,
    activeDiscounts: activeDiscounts?.value ?? 0,
    lowStock: lowStock?.value ?? 0,
    revenueCents: Number(revenueResult[0]?.total ?? 0),
  };
}

// ─── 商品 ────────────────────────────────────────────────────────────────
export async function getAllProducts() {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      subtitle: products.subtitle,
      category: products.category,
      heritage: products.heritage,
      basePriceCents: products.basePriceCents,
      compareAtPriceCents: products.compareAtPriceCents,
      status: products.status,
      isFeatured: products.isFeatured,
      collectionName: collections.name,
      stock: sql<number>`coalesce(${inventory.quantity}, 0)`,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(collections, eq(products.collectionId, collections.id))
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
    .orderBy(desc(products.createdAt))
    .groupBy(products.id, collections.name, inventory.quantity);

  return rows;
}

export async function getProductById(id: string) {
  const [product] = await db.select().from(products).where(eq(products.id, id));
  return product;
}

export async function createProduct(data: typeof products.$inferInsert) {
  const [created] = await db.insert(products).values(data).returning();
  return created;
}

export async function updateProduct(id: string, data: Partial<typeof products.$inferInsert>) {
  await db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id));
}

export async function deleteProduct(id: string) {
  await db.delete(products).where(eq(products.id, id));
}

// ─── 系列 ────────────────────────────────────────────────────────────────
export async function getAllCollections() {
  return db
    .select({
      id: collections.id,
      slug: collections.slug,
      name: collections.name,
      heritage: collections.heritage,
      description: collections.description,
      isFeatured: collections.isFeatured,
      sortOrder: collections.sortOrder,
      productCount: sql<number>`(select count(*) from ${products} where ${products.collectionId} = ${collections.id})`,
    })
    .from(collections)
    .orderBy(collections.sortOrder);
}

export async function createCollection(data: typeof collections.$inferInsert) {
  const [created] = await db.insert(collections).values(data).returning();
  return created;
}

export async function updateCollection(id: string, data: Partial<typeof collections.$inferInsert>) {
  await db.update(collections).set({ ...data, updatedAt: new Date() }).where(eq(collections.id, id));
}

export async function deleteCollection(id: string) {
  await db.delete(collections).where(eq(collections.id, id));
}

// ─── 订单 ────────────────────────────────────────────────────────────────
export async function getAllOrders() {
  return db
    .select({
      id: orders.id,
      number: orders.number,
      email: orders.email,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      fulfillmentStatus: orders.fulfillmentStatus,
      totalCents: orders.totalCents,
      currency: orders.currency,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt));
}

// ─── 顾客 ────────────────────────────────────────────────────────────────
export async function getAllCustomers() {
  return db
    .select({
      id: customers.id,
      email: customers.email,
      firstName: customers.firstName,
      lastName: customers.lastName,
      createdAt: customers.createdAt,
      orderCount: sql<number>`(select count(*) from ${orders} where ${orders.customerId} = ${customers.id})`,
      totalSpent: sql<number>`coalesce((select sum(${orders.totalCents}) from ${orders} where ${orders.customerId} = ${customers.id} and ${orders.paymentStatus} = 'paid'), 0)`,
    })
    .from(customers)
    .orderBy(desc(customers.createdAt));
}

// ─── 优惠券 ──────────────────────────────────────────────────────────────
export async function getAllDiscounts() {
  return db.select().from(discounts).orderBy(desc(discounts.createdAt));
}

export async function createDiscount(data: typeof discounts.$inferInsert) {
  const [created] = await db.insert(discounts).values(data).returning();
  return created;
}

export async function deleteDiscount(id: string) {
  await db.delete(discounts).where(eq(discounts.id, id));
}

// ─── 产品图片 ────────────────────────────────────────────────────────────

/** 查产品的所有图片 */
export async function getProductImages(productId: string) {
  return db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(productImages.sortOrder);
}

/** 给产品添加图片 */
export async function addProductImage(productId: string, url: string, altText?: string, isPrimary = false) {
  // 计算下一个 sortOrder
  const existing = await db.select().from(productImages).where(eq(productImages.productId, productId));
  const sortOrder = existing.length;
  // 如果设为主图,先取消其他主图
  if (isPrimary) {
    await db.update(productImages).set({ isPrimary: false }).where(eq(productImages.productId, productId));
  }
  const [created] = await db
    .insert(productImages)
    .values({ productId, url, altText: altText || null, isPrimary, sortOrder })
    .returning();
  return created;
}

/** 删除产品图片 */
export async function deleteProductImage(imageId: string) {
  await db.delete(productImages).where(eq(productImages.id, imageId));
}

/** 设置主图 */
export async function setPrimaryImage(imageId: string, productId: string) {
  await db.update(productImages).set({ isPrimary: false }).where(eq(productImages.productId, productId));
  await db.update(productImages).set({ isPrimary: true }).where(eq(productImages.id, imageId));
}
