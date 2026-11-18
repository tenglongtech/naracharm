'use server';

/**
 * 后台数据访问层 (Server Actions)
 * 所有后台 CRUD 操作集中在此,供 antd 组件调用。
 *
 * Actions verify the administrator role before reading or writing store data.
 */
import { db as connection, type DB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { products, collections, orders, customers, discounts, productVariants, inventory } from '@jewelry/db';
import { eq, desc, count, sql } from 'drizzle-orm';
import { ZodError } from 'zod';
import {
  availableStudioDrafts, editableProduct, insertCatalogProduct, insertStudioDraft, updateCatalogProduct, ProductEditError,
  type AddCatalogProduct, type UpdateCatalogProduct,
} from './product-maintenance';

const db: DB = connection;

// ─── 仪表盘统计 ──────────────────────────────────────────────────────────
export async function getDashboardStats() {
  await requireAdmin();
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
  await requireAdmin();
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
      stock: sql<number>`coalesce((
        select sum(greatest(0, ${inventory.quantity} - ${inventory.reserved}))::double precision
        from ${productVariants} join ${inventory} on ${inventory.variantId} = ${productVariants.id}
        where ${productVariants.productId} = ${products.id}
      ), 0)`,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(collections, eq(products.collectionId, collections.id))
    .orderBy(desc(products.createdAt));

  return rows;
}

export async function getProductById(id: string) {
  await requireAdmin();
  return editableProduct(id);
}

export async function getStudioDraftOptions() {
  await requireAdmin();
  return availableStudioDrafts();
}

async function productChange(operation: () => Promise<{ id: string }>) {
  try {
    const { id } = await operation();
    return { ok: true as const, id };
  } catch (error) {
    if (error instanceof ProductEditError) return { ok: false as const, error: error.message };
    if (error instanceof ZodError) return { ok: false as const, error: '请检查商品名称、网址、售价及库存数量。' };
    console.error('Could not save catalog product', error instanceof Error ? error.name : 'Unknown error');
    return { ok: false as const, error: '保存失败。请刷新商品后重试。' };
  }
}

export async function createProduct(input: AddCatalogProduct) {
  await requireAdmin();
  return productChange(() => insertCatalogProduct(input));
}

export async function createStudioProductDraft(slug: string) {
  await requireAdmin();
  return productChange(() => insertStudioDraft(slug));
}

export async function updateProduct(id: string, input: UpdateCatalogProduct) {
  await requireAdmin();
  return productChange(() => updateCatalogProduct(id, input));
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await db.delete(products).where(eq(products.id, id));
}

// ─── 系列 ────────────────────────────────────────────────────────────────
export async function getAllCollections() {
  await requireAdmin();
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
  await requireAdmin();
  const [created] = await db.insert(collections).values(data).returning();
  return created;
}

export async function updateCollection(id: string, data: Partial<typeof collections.$inferInsert>) {
  await requireAdmin();
  await db.update(collections).set({ ...data, updatedAt: new Date() }).where(eq(collections.id, id));
}

export async function deleteCollection(id: string) {
  await requireAdmin();
  await db.delete(collections).where(eq(collections.id, id));
}

// ─── 订单 ────────────────────────────────────────────────────────────────
export async function getAllOrders() {
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
  return db.select().from(discounts).orderBy(desc(discounts.createdAt));
}

export async function createDiscount(data: typeof discounts.$inferInsert) {
  await requireAdmin();
  const [created] = await db.insert(discounts).values(data).returning();
  return created;
}

export async function deleteDiscount(id: string) {
  await requireAdmin();
  await db.delete(discounts).where(eq(discounts.id, id));
}
