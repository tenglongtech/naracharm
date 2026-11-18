import { asc, eq, inArray } from 'drizzle-orm';
import { collections, inventory, products, productVariants } from '@jewelry/db';
import { z } from 'zod';
import { db as connection, type DB } from './db';
import { getProductCopy } from './product-copy';
import { getStudioCollection, getStudioPreview, STUDIO_PREVIEWS } from './studio-listings';

const db: DB = connection;
export type CatalogTransaction = Parameters<Parameters<DB['transaction']>[0]>[0];
const cents = z.number().int().min(0).max(99_999_999);
const quantity = z.number().int().min(0).max(2_147_483_647);
const nullableText = z.string().trim().nullable().optional();
const productFields = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(140),
  name: z.string().trim().min(1),
  category: z.enum(['bracelet', 'necklace', 'earrings', 'phone-charm']),
  status: z.enum(['draft', 'active', 'archived']),
  basePriceCents: cents,
  compareAtPriceCents: cents.nullable().optional(),
  collectionId: z.uuid().nullable().optional(),
  subtitle: nullableText,
  description: nullableText,
  heritage: nullableText,
  craftStory: nullableText,
  careNotes: nullableText,
  materials: z.array(z.string().trim().min(1)).nullable().optional(),
  isFeatured: z.boolean().optional(),
});

const addInput = z.object({
  fields: productFields,
  initialStock: quantity,
  sku: z.string().trim().min(1).max(160).optional(),
});

const variantDetails = z.object({
  name: z.string().trim().min(1).max(160),
  priceCents: cents.min(1).nullable(),
});

const updateInput = z.object({
  fields: productFields.partial(),
  stockEdits: z.array(z.object({ variantId: z.uuid(), quantity, expectedQuantity: quantity.optional() })).default([]),
  variantEdits: z.array(variantDetails.extend({
    variantId: z.uuid(), expectedName: z.string(), expectedPriceCents: cents.nullable(),
  })).default([]),
  newVariants: z.array(variantDetails.extend({
    sku: z.string().trim().min(1).max(160), quantity,
  })).default([]),
  initialStock: quantity.optional(),
});

export type AddCatalogProduct = z.input<typeof addInput>;
export type UpdateCatalogProduct = z.input<typeof updateInput>;

export class ProductEditError extends Error {}

type ReadDatabase = Pick<DB, 'select'>;

function productInventory(reader: ReadDatabase, productId: string) {
  return reader.select({
    id: productVariants.id, sku: productVariants.sku, name: productVariants.name, priceCents: productVariants.priceCents,
    quantity: inventory.quantity, reserved: inventory.reserved,
  }).from(productVariants).leftJoin(inventory, eq(inventory.variantId, productVariants.id))
    .where(eq(productVariants.productId, productId))
    .orderBy(asc(productVariants.createdAt), asc(productVariants.id));
}

export async function editableProduct(id: string) {
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product) throw new ProductEditError('找不到商品。请刷新列表。');
  const variants = (await productInventory(db, id))
    .map((item) => ({ ...item, quantity: item.quantity ?? 0, reserved: item.reserved ?? 0 }));
  return { product: { ...product, ...currentCopy(product) }, variants, studioDesign: Boolean(getStudioPreview(product.slug)) };
}

function currentCopy(product: typeof products.$inferSelect) {
  const revised = getProductCopy({ slug: product.slug, updatedAt: product.updatedAt.toISOString() });
  if (!revised) return undefined;
  const { description, craftStory, seoTitle, seoDescription } = revised;
  return { description, craftStory, seoTitle, seoDescription };
}

export async function availableStudioDrafts() {
  const existing = await db.select({ slug: products.slug }).from(products)
    .where(inArray(products.slug, STUDIO_PREVIEWS.map((preview) => preview.slug)));
  const created = new Set(existing.map((item) => item.slug));
  return STUDIO_PREVIEWS.filter((preview) => !created.has(preview.slug))
    .map(({ slug, name, collectionName }) => ({ slug, name, collectionName }));
}

export function defaultCatalogSku(slug: string) {
  return `NC-${slug.toUpperCase()}`;
}

async function addVariant(tx: CatalogTransaction, productId: string, {
  sku, name, priceCents, quantity: stock,
}: { sku: string; name: string; priceCents: number | null; quantity: number }) {
  const [variant] = await tx.insert(productVariants).values({ productId, sku, name, priceCents })
    .onConflictDoNothing({ target: productVariants.sku }).returning({ id: productVariants.id });
  if (!variant) throw new ProductEditError('该 SKU 已被使用。');
  await tx.insert(inventory).values({ variantId: variant.id, quantity: stock });
}

function addDefaultVariant(tx: CatalogTransaction, productId: string, slug: string, initialStock: number, sku?: string) {
  return addVariant(tx, productId, { sku: sku ?? defaultCatalogSku(slug), name: 'Default', priceCents: null, quantity: initialStock });
}

export async function insertCatalogProduct(input: AddCatalogProduct) {
  return db.transaction((tx) => insertCatalogProductInTransaction(tx, input));
}

export async function insertCatalogProductInTransaction(tx: CatalogTransaction, input: AddCatalogProduct) {
  const { fields, initialStock, sku } = addInput.parse(input);
  if (fields.status === 'active' && fields.basePriceCents === 0) throw new ProductEditError('上架前请设置售价。');
  const [product] = await tx.insert(products).values(fields).onConflictDoNothing({ target: products.slug })
    .returning({ id: products.id });
  if (!product) throw new ProductEditError('这个商品网址已在使用。');
  await addDefaultVariant(tx, product.id, fields.slug, initialStock, sku);
  return product;
}

export async function ensureStudioCollection(tx: CatalogTransaction, studio: NonNullable<ReturnType<typeof getStudioCollection>>) {
  const [created] = await tx.insert(collections).values({
    slug: studio.slug, name: studio.name, description: studio.description, heritage: studio.heritage,
  }).onConflictDoNothing({ target: collections.slug }).returning({ id: collections.id });
  if (created) return created;
  const [existing] = await tx.select({ id: collections.id }).from(collections).where(eq(collections.slug, studio.slug));
  return existing;
}

export async function insertStudioDraft(slug: string) {
  const design = getStudioPreview(slug);
  const studio = design?.collectionSlug ? getStudioCollection(design.collectionSlug) : undefined;
  if (!design || !studio) throw new ProductEditError('找不到该设计预览。');

  return db.transaction(async (tx) => {
    const [existing] = await tx.select({ id: products.id }).from(products).where(eq(products.slug, slug));
    if (existing) return existing;

    const collection = await ensureStudioCollection(tx, studio);

    const [product] = await tx.insert(products).values({
      slug: design.slug, name: design.name, subtitle: design.subtitle, category: design.category, status: 'draft',
      collectionId: collection.id, description: design.description, heritage: design.heritage,
      craftStory: design.craftStory, basePriceCents: design.basePriceCents,
    }).onConflictDoNothing({ target: products.slug }).returning({ id: products.id });
    if (product) {
      await addDefaultVariant(tx, product.id, slug, 0);
      return product;
    }
    const [concurrent] = await tx.select({ id: products.id }).from(products).where(eq(products.slug, slug));
    return concurrent;
  });
}

export async function updateCatalogProduct(id: string, input: UpdateCatalogProduct) {
  return db.transaction((tx) => updateCatalogProductInTransaction(tx, id, input));
}

export async function updateCatalogProductInTransaction(tx: CatalogTransaction, id: string, input: UpdateCatalogProduct, initialSku?: string) {
  const { fields, stockEdits, variantEdits, newVariants, initialStock } = updateInput.parse(input);
  const [current] = await tx.select().from(products).where(eq(products.id, id)).for('update');
  if (!current) throw new ProductEditError('找不到商品。请刷新列表。');
  if (fields.slug && fields.slug !== current.slug && getStudioPreview(current.slug)) {
    throw new ProductEditError('此款沿用设计预览的网址。');
  }
  if (fields.slug && fields.slug !== current.slug && getStudioPreview(fields.slug)) {
    throw new ProductEditError('此网址已用于设计预览。请从该设计建立商品草稿。');
  }

  const variants = await productInventory(tx, id);
  const currentVariants = new Map(variants.map((variant) => [variant.id, variant]));
  const editedVariants = new Map(variantEdits.map((edit) => [edit.variantId, edit]));
  if (editedVariants.size !== variantEdits.length || variantEdits.some((edit) => {
    const variant = currentVariants.get(edit.variantId);
    return variant?.name !== edit.expectedName || variant.priceCents !== edit.expectedPriceCents;
  })) {
    throw new ProductEditError('规格信息已变化。请刷新商品后重试。');
  }
  if (variants.length === 0) {
    if (initialStock !== undefined || (fields.status === 'active' && !newVariants.length)) {
      await addDefaultVariant(tx, id, fields.slug ?? current.slug, initialStock ?? 0, initialSku);
    }
  } else if (initialStock !== undefined) {
    throw new ProductEditError('此商品已有 SKU。请刷新后修改库存。');
  }
  const basePrice = fields.basePriceCents ?? current.basePriceCents;
  const hasPricedVariant = variants.some((variant) => ((editedVariants.get(variant.id) ?? variant).priceCents ?? basePrice) > 0)
    || newVariants.some((variant) => (variant.priceCents ?? basePrice) > 0)
    || (!variants.length && basePrice > 0);
  if ((fields.status ?? current.status) === 'active' && !hasPricedVariant) {
    throw new ProductEditError('上架前请设置售价。');
  }
  const ids = [...new Set(stockEdits.map((edit) => edit.variantId))];
  if (ids.length !== stockEdits.length || ids.some((variantId) => !currentVariants.has(variantId))) {
    throw new ProductEditError('库存记录已变化。请刷新商品。');
  }
  for (const { variantId, name, priceCents } of variantEdits) {
    await tx.update(productVariants).set({ name, priceCents, updatedAt: new Date() }).where(eq(productVariants.id, variantId));
  }
  for (const variant of newVariants.sort((a, b) => a.sku.localeCompare(b.sku))) {
    await addVariant(tx, id, variant);
  }
  if (ids.length) {
    const locked = await tx.select().from(inventory).where(inArray(inventory.variantId, ids))
      .orderBy(asc(inventory.variantId)).for('update');
    const lockedById = new Map(locked.map((row) => [row.variantId, row]));
    for (const { variantId, quantity: desired, expectedQuantity } of stockEdits) {
      const stock = lockedById.get(variantId);
      if (expectedQuantity !== undefined && expectedQuantity !== (stock?.quantity ?? 0)) {
        throw new ProductEditError('库存数量已变化。请刷新商品后重试。');
      }
      if (!stock) {
        await tx.insert(inventory).values({ variantId, quantity: desired });
      } else {
        if (desired < stock.reserved) {
          throw new ProductEditError(`库存不能低于待付款订单预留的 ${stock.reserved} 件。`);
        }
        await tx.update(inventory).set({ quantity: desired, updatedAt: new Date() }).where(eq(inventory.variantId, variantId));
      }
    }
  }
  const reviewed = currentCopy(current);
  const nextDescription = fields.description !== undefined && fields.description !== (reviewed?.description ?? current.description)
    ? fields.description : reviewed?.seoDescription;
  const [updated] = await tx.update(products).set({ ...reviewed, ...fields, seoDescription: nextDescription, updatedAt: new Date() })
    .where(eq(products.id, current.id)).returning({ id: products.id });
  return updated;
}
