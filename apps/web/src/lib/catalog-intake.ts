import { createHash } from 'node:crypto';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { asc, eq, inArray, sql } from 'drizzle-orm';
import { collections, inventory, productImages, products, productVariants } from '@jewelry/db';
import { db as connection, type DB } from './db';
import {
  CatalogIntakeError, catalogCsv, MAX_CATALOG_ROWS, parseCatalogIntake, type IntakeIssue, type IntakeRow,
} from './catalog-intake-csv';
import { productPhotoUrl } from './product-media';
import { saveProductImage } from './product-image-write';
import {
  defaultCatalogSku, ensureStudioCollection, insertCatalogProductInTransaction,
  ProductEditError, updateCatalogProductInTransaction, type CatalogTransaction,
} from './product-maintenance';
import { getStudioCollection, getStudioPreview, STUDIO_PREVIEWS } from './studio-listings';

const db: DB = connection;

type ProductEntry = Pick<typeof products.$inferSelect, 'id' | 'slug' | 'name' | 'category' | 'status' | 'updatedAt' | 'collectionId'>;
type VariantEntry = { id: string; productId: string; sku: string; priceCents: number | null; quantity: number | null; reserved: number | null };

type PlannedRow = {
  row: IntakeRow;
  current?: ProductEntry;
  variant?: VariantEntry;
  design?: ReturnType<typeof getStudioPreview>;
  name: string;
  category?: ProductEntry['category'];
  sku?: string;
  collectionSlug?: string;
  collectionId?: string;
};

export type IntakePreview = {
  issues: IntakeIssue[];
  rows: (Pick<IntakeRow, 'row' | 'action' | 'slug' | 'sku' | 'priceCents' | 'stock' | 'photoUrl'> & { name: string })[];
  revision: string | null;
};

async function buildPlan(tx: CatalogTransaction, csv: string, lock: boolean) {
  const { rows, issues } = parseCatalogIntake(csv);
  const query = tx.select({
    id: products.id, slug: products.slug, name: products.name, category: products.category,
    status: products.status, updatedAt: products.updatedAt, collectionId: products.collectionId,
  }).from(products).where(inArray(products.slug, rows.map(({ slug }) => slug))).orderBy(asc(products.slug));
  const found = await (lock ? query.for('update') : query);
  const bySlug = new Map(found.map((product) => [product.slug, product]));
  const ids = found.map(({ id }) => id);

  const [variants, series, images] = await Promise.all([
    tx.select({
      id: productVariants.id, productId: productVariants.productId, sku: productVariants.sku,
      priceCents: productVariants.priceCents, quantity: inventory.quantity, reserved: inventory.reserved,
    }).from(productVariants).leftJoin(inventory, eq(inventory.variantId, productVariants.id))
      .where(inArray(productVariants.productId, ids)).orderBy(asc(productVariants.id)),
    tx.select({ id: collections.id, slug: collections.slug }).from(collections),
    tx.select({
      id: productImages.id, productId: productImages.productId, url: productImages.url,
      primary: productImages.isPrimary, photo: productImages.isProductPhoto,
    }).from(productImages).where(inArray(productImages.productId, ids)).orderBy(asc(productImages.id)),
  ]);

  const seriesBySlug = new Map(series.map(({ slug, id }) => [slug, id]));
  const skuRows = new Map<string, number>();
  const planned: PlannedRow[] = [];
  for (const row of rows) {
    const current = bySlug.get(row.slug);
    const fail = (message: string) => issues.push({ row: row.row, message });
    if (row.action === 'photo') {
      if (!current) fail('找不到可补实拍的商品。');
      planned.push({ row, current, name: current?.name ?? row.name ?? row.slug });
      continue;
    }
    if (current && current.status !== 'draft') fail('已在售或下架的商品可批量补实拍，价格和库存请在编辑页修改。');
    const design = getStudioPreview(row.slug);
    const name = row.name ?? current?.name ?? design?.name ?? '';
    const category = row.category ?? current?.category ?? design?.category;
    if (!name || !category) fail('新商品需要商品名和品类。');

    const existingVariants = current ? variants.filter((variant) => variant.productId === current.id) : [];
    const [variant] = existingVariants;
    const sku = row.sku ?? variant?.sku ?? defaultCatalogSku(row.slug);
    if (existingVariants.length > 1) fail('这款商品有多个 SKU，请在商品详情中按 SKU 编辑。');
    if (variant && variant.sku !== sku) fail('商品已有 SKU，请保留原 SKU。');
    const skuOwner = skuRows.get(sku);
    if (skuOwner !== undefined) fail(`SKU 与第 ${skuOwner} 行重复。`);
    else skuRows.set(sku, row.row);
    if (variant && row.stock !== undefined && row.stock < (variant.reserved ?? 0)) fail('填写的库存低于已有订单预留量。');

    const collectionSlug = row.collectionSlug ?? (current?.collectionId ? undefined : design?.collectionSlug ?? undefined);
    const collectionId = collectionSlug ? seriesBySlug.get(collectionSlug) : undefined;
    if (collectionSlug && !collectionId && !getStudioCollection(collectionSlug)) fail('找不到该系列，先在系列管理创建。');
    planned.push({ row, current, variant, design, name, category, sku, collectionSlug, collectionId });
  }

  const usedSkus = await tx.select({ sku: productVariants.sku, productId: productVariants.productId })
    .from(productVariants).where(inArray(productVariants.sku, [...skuRows.keys()]));
  const skuByName = new Map(usedSkus.map((item) => [item.sku, item.productId]));
  const localPhotos = [...new Set(rows.map(({ photoUrl }) => photoUrl).filter((url): url is string => Boolean(url?.startsWith('/'))))];
  const existingLocalPhotos = new Set((await Promise.all(localPhotos.map(async (url) => {
    try {
      const file = await stat(join(process.cwd(), 'public', url.slice(1)));
      return file.isFile() ? url : null;
    } catch {
      return null;
    }
  }))).filter(Boolean));

  for (const entry of planned) {
    const { row, sku, current } = entry;
    const occupant = sku && skuByName.get(sku);
    if (occupant && occupant !== current?.id) issues.push({ row: row.row, message: '这个 SKU 已被另一款商品使用。' });
    if (row.photoUrl?.startsWith('/') && !existingLocalPhotos.has(row.photoUrl)) {
      issues.push({ row: row.row, message: '找不到本地实拍文件。请使用已部署的图片路径或公开 HTTPS 地址。' });
    }
  }

  const revision = issues.length ? null : createHash('sha256').update(csv).update(JSON.stringify(planned.map((entry) => ({
    row: entry.row.row,
    current: entry.current,
    variant: entry.variant,
    collectionId: entry.collectionId,
    images: entry.current && entry.row.photoUrl ? images.filter((image) => image.productId === entry.current?.id) : undefined,
  })))).digest('hex');

  const preview: IntakePreview = {
    issues: issues.sort((a, b) => a.row - b.row),
    revision,
    rows: planned.map(({ row, name, sku }) => ({
      row: row.row, action: row.action, slug: row.slug, name, sku, priceCents: row.priceCents, stock: row.stock, photoUrl: row.photoUrl,
    })),
  };
  return { planned, preview };
}

export async function previewCatalogIntake(csv: string) {
  return db.transaction(async (tx) => (await buildPlan(tx, csv, false)).preview);
}

async function applyRow(tx: CatalogTransaction, entry: PlannedRow) {
  const { row, current, category, name, sku, variant, design } = entry;
  if (row.action === 'photo' && current && row.photoUrl) {
    await saveProductImage(tx, current.id, row.photoUrl, { photo: true, makePrimary: true, altText: name });
    return;
  }
  if (!category || !sku) throw new CatalogIntakeError('缺少商品品类或 SKU。');

  const studio = entry.collectionSlug ? getStudioCollection(entry.collectionSlug) : undefined;
  const collectionId = entry.collectionId ?? (studio ? (await ensureStudioCollection(tx, studio)).id : undefined);
  const changes = {
    name, category, collectionId, status: row.action === 'publish' ? 'active' as const : 'draft' as const,
    basePriceCents: row.priceCents, description: row.description, materials: row.materials,
    careNotes: row.careNotes, craftStory: row.craftStory,
  };

  let id = current?.id;
  if (id) {
    if (variant?.priceCents != null && row.priceCents !== undefined) {
      await tx.update(productVariants).set({ priceCents: null, updatedAt: new Date() }).where(eq(productVariants.id, variant.id));
    }
    await updateCatalogProductInTransaction(tx, id, {
      fields: changes,
      initialStock: variant ? undefined : row.stock ?? 0,
      stockEdits: variant && row.stock !== undefined ? [{
        variantId: variant.id, quantity: row.stock, expectedQuantity: variant.quantity ?? 0,
      }] : undefined,
    }, sku);
  } else {
    const inserted = await insertCatalogProductInTransaction(tx, {
      fields: {
        ...changes, slug: row.slug, basePriceCents: row.priceCents ?? design?.basePriceCents ?? 0,
        description: row.description ?? design?.description, craftStory: row.craftStory ?? design?.craftStory,
        subtitle: design?.subtitle, heritage: design?.heritage,
      },
      sku, initialStock: row.stock ?? 0,
    });
    id = inserted.id;
  }
  if (row.photoUrl) await saveProductImage(tx, id, row.photoUrl, { photo: true, makePrimary: true, altText: name });
}

export async function applyCatalogIntake(csv: string, revision: string) {
  return db.transaction(async (tx) => {
    // Serialize batch writers. The row locks and unique keys still protect ordinary editor and checkout writes.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${'naracharm:catalog-intake'}, 0))`);
    const { planned, preview } = await buildPlan(tx, csv, true);
    if (preview.issues.length || !preview.revision) {
      throw new CatalogIntakeError('这个批次已经有需要处理的行，请重新预检。');
    }
    if (revision !== preview.revision) throw new CatalogIntakeError('预检后商品记录发生变化，请重新预检。');

    for (const entry of [...planned].sort((a, b) => a.row.slug.localeCompare(b.row.slug))) {
      try {
        await applyRow(tx, entry);
      } catch (error) {
        if (error instanceof CatalogIntakeError || error instanceof ProductEditError) {
          throw new CatalogIntakeError(`第 ${entry.row.row} 行 · ${error.message}`);
        }
        throw error;
      }
    }
    return {
      drafts: planned.filter(({ row }) => row.action === 'draft').length,
      published: planned.filter(({ row }) => row.action === 'publish').length,
      photos: planned.filter(({ row }) => row.photoUrl).length,
    };
  });
}

export async function catalogIntakeTemplate(kind: 'studio' | 'photos' | 'blank') {
  if (kind === 'blank') return catalogCsv([{ action: 'draft' }]);

  const listings = await db.select({
    id: products.id, slug: products.slug, name: products.name, status: products.status, category: products.category,
  }).from(products)
    .orderBy(asc(products.slug));
  if (kind === 'studio') {
    const links = new Map(listings.map((listing) => [listing.slug, listing]));
    return catalogCsv(STUDIO_PREVIEWS.flatMap((item) => {
      const existing = links.get(item.slug);
      if (existing && existing.status !== 'draft') return [];
      return [{ action: 'draft', slug: item.slug, name: existing?.name ?? item.name,
        category: existing?.category ?? item.category, collection_slug: existing ? '' : item.collectionSlug ?? '' }];
    }));
  }

  const confirmed = await db.select({ productId: productImages.productId, url: productImages.url }).from(productImages)
    .where(eq(productImages.isProductPhoto, true));
  const photographed = new Set(confirmed.filter(({ url }) => productPhotoUrl(url)).map(({ productId }) => productId));
  return catalogCsv(listings.filter(({ status, id }) => status === 'active' && !photographed.has(id))
    .slice(0, MAX_CATALOG_ROWS)
    .map(({ slug, name }) => ({ action: 'photo', slug, name })));
}
