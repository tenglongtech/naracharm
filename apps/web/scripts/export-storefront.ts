/**
 * 导出前端静态数据: 从 DB (Neon/Contabo) 导出 products/collections/reviews/comments JSON
 *
 * 用法: pnpm export:data，使用环境中的 DATABASE_URL 读取一致的只读快照。
 *
 * 输出:
 *   apps/web/src/data/products.json     — StorefrontProduct[]
 *   apps/web/src/data/collections.json  — StorefrontCollection[]
 *   apps/web/src/data/reviews.json      — 已审核评价 (按 productId 分组)
 *   apps/web/src/data/comments.json     — 已审核文章评论
 *
 * 缺少数据库连接或目录为空时，不写入快照。
 */
import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  products, collections, productVariants, inventory, productImages, variantImages,
  productReviews, blogComments,
} from '../../../packages/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { productIndexPhotos, selectProductPhotos } from '../src/lib/product-media';
import type { StorefrontProduct } from '../src/lib/storefront';
import { storefrontOffer, type StorefrontVariant } from '../src/lib/storefront-offer';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL 未设置 — 无法导出静态数据');
  process.exit(1);
}

const client = postgres(process.env.DATABASE_URL, { max: 1, connect_timeout: 10 });
const db = drizzle({ client, schema: {
  products, collections, productVariants, inventory, productImages, variantImages,
  productReviews, blogComments,
} });
type SnapshotReader = Pick<typeof db, 'select'>;

type StorefrontCollection = {
  id: string; slug: string; name: string; heritage: string | null;
  description: string | null; isFeatured: boolean; productCount: number;
};

async function exportProducts(snapshot: SnapshotReader): Promise<StorefrontProduct[]> {
  const rows = await snapshot
    .select({
      id: products.id, slug: products.slug, name: products.name,
      subtitle: products.subtitle, description: products.description,
      category: products.category, heritage: products.heritage,
      materials: products.materials, basePriceCents: products.basePriceCents,
      compareAtPriceCents: products.compareAtPriceCents, isFeatured: products.isFeatured,
      craftStory: products.craftStory, careNotes: products.careNotes,
      collectionSlug: collections.slug, collectionName: collections.name,
      seoTitle: products.seoTitle, seoDescription: products.seoDescription,
      updatedAt: products.updatedAt,
      variantId: productVariants.id, variantSku: productVariants.sku, variantName: productVariants.name,
      variantPriceCents: productVariants.priceCents,
      stock: sql<number>`coalesce(${inventory.quantity}, 0) - coalesce(${inventory.reserved}, 0)`,
      imageUrl: productImages.url, imageIsPrimary: productImages.isPrimary,
      imageSort: productImages.sortOrder, imageIsProductPhoto: productImages.isProductPhoto,
    })
    .from(products)
    .leftJoin(collections, eq(products.collectionId, collections.id))
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
    .leftJoin(productImages, eq(productImages.productId, products.id))
    .where(eq(products.status, 'active'))
    .orderBy(products.createdAt, products.id, productVariants.createdAt, productVariants.id, productImages.sortOrder, productImages.id);

  const variantPhotoRows = await snapshot.select({
    variantId: variantImages.variantId, url: variantImages.url, isProductPhoto: variantImages.isProductPhoto,
    isPrimary: variantImages.isPrimary, sortOrder: variantImages.sortOrder,
  }).from(variantImages)
    .innerJoin(productVariants, eq(productVariants.id, variantImages.variantId))
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(and(eq(products.status, 'active'), eq(variantImages.isProductPhoto, true)));
  const variantPhotos = new Map<string, typeof variantPhotoRows>();
  for (const row of variantPhotoRows) {
    const photos = variantPhotos.get(row.variantId) ?? [];
    photos.push(row);
    variantPhotos.set(row.variantId, photos);
  }

  const map = new Map<string, { product: StorefrontProduct; photos: Parameters<typeof selectProductPhotos>[0][number][]; variants: Map<string, StorefrontVariant> }>();
  for (const r of rows) {
    if (!map.has(r.id)) {
      map.set(r.id, { photos: [], variants: new Map(), product: {
        id: r.id, slug: r.slug, name: r.name, subtitle: r.subtitle,
        description: r.description, category: r.category, heritage: r.heritage,
        materials: r.materials, basePriceCents: Number(r.basePriceCents),
        compareAtPriceCents: r.compareAtPriceCents ? Number(r.compareAtPriceCents) : null,
        isFeatured: r.isFeatured, craftStory: r.craftStory, careNotes: r.careNotes,
        collectionSlug: r.collectionSlug, collectionName: r.collectionName,
        primaryImage: null, images: [], stock: 0,
        seoTitle: r.seoTitle, seoDescription: r.seoDescription,
        updatedAt: r.updatedAt.toISOString(),
      } });
    }
    const item = map.get(r.id)!;
    if (r.variantId && r.variantSku && r.variantName && !item.variants.has(r.variantId)) {
      const photos = selectProductPhotos(variantPhotos.get(r.variantId) ?? []);
      item.variants.set(r.variantId, {
        id: r.variantId, sku: r.variantSku, name: r.variantName,
        unitPriceCents: r.variantPriceCents ?? r.basePriceCents, stock: Math.max(0, Number(r.stock)),
        ...(photos ? { photoUrls: photos.images } : {}),
      });
    }
    if (r.imageUrl) {
      item.product.images.push(r.imageUrl);
      if (r.imageIsPrimary && !item.product.primaryImage) item.product.primaryImage = r.imageUrl;
      item.photos.push({
        url: r.imageUrl, isPrimary: r.imageIsPrimary ?? false,
        isProductPhoto: r.imageIsProductPhoto ?? false, sortOrder: r.imageSort ?? 0,
      });
    }
  }
  return Array.from(map.values(), ({ product, photos, variants }) => {
    const offer = storefrontOffer(Array.from(variants.values()), product.basePriceCents);
    const confirmed = selectProductPhotos(photos);
    if (confirmed) return { ...product, ...offer, ...confirmed };
    const primaryImage = product.primaryImage ?? product.images[0] ?? null;
    const images = primaryImage ? [...new Set([primaryImage, ...product.images])] : [];
    return { ...product, ...offer, primaryImage, images };
  });
}

async function exportCollections(snapshot: SnapshotReader): Promise<StorefrontCollection[]> {
  const rows = await snapshot
    .select({
      id: collections.id, slug: collections.slug, name: collections.name,
      heritage: collections.heritage, description: collections.description,
      isFeatured: collections.isFeatured,
      productCount: sql<number>`(select count(*) from ${products} where ${products.collectionId} = ${collections.id} and ${products.status} = 'active')`,
    })
    .from(collections)
    .orderBy(collections.sortOrder);
  return rows.map((r) => ({ ...r, productCount: Number(r.productCount) }));
}

async function exportReviews(snapshot: SnapshotReader) {
  const rows = await snapshot
    .select({
      id: productReviews.id, productId: productReviews.productId,
      authorName: productReviews.authorName, rating: productReviews.rating,
      title: productReviews.title, text: productReviews.text,
      isVerifiedPurchase: productReviews.isVerifiedPurchase,
      createdAt: productReviews.createdAt,
    })
    .from(productReviews)
    .where(eq(productReviews.isFeatured, false));
  const byProduct: Record<string, typeof rows> = {};
  for (const r of rows) {
    if (!byProduct[r.productId]) byProduct[r.productId] = [];
    byProduct[r.productId].push(r);
  }
  return { all: rows, byProduct };
}

async function exportComments(snapshot: SnapshotReader) {
  const rows = await snapshot
    .select({
      id: blogComments.id, articleSlug: blogComments.articleSlug,
      authorName: blogComments.authorName, text: blogComments.text,
      createdAt: blogComments.createdAt,
    })
    .from(blogComments)
    .where(eq(blogComments.isApproved, true));
  const byArticle: Record<string, typeof rows> = {};
  for (const r of rows) {
    if (!byArticle[r.articleSlug]) byArticle[r.articleSlug] = [];
    byArticle[r.articleSlug].push(r);
  }
  return { all: rows, byArticle };
}

async function main() {
  console.log('📦 导出前端静态数据...\n');

  const [prods, colls, reviews, comments] = await db.transaction(async (snapshot) => {
    await snapshot.execute(sql`set local statement_timeout = '30s'`);
    const products = await exportProducts(snapshot);
    const collections = await exportCollections(snapshot);
    const reviews = await exportReviews(snapshot);
    const comments = await exportComments(snapshot);
    return [products, collections, reviews, comments] as const;
  }, { isolationLevel: 'repeatable read', accessMode: 'read only' });

  if (prods.length === 0) {
    console.error('The database has no active products. The storefront snapshot was not written.');
    process.exitCode = 1;
    return;
  }

  const dataDir = process.env.STOREFRONT_DATA_DIR
    ? resolve(process.env.STOREFRONT_DATA_DIR)
    : resolve(__dirname, '../src/data');
  if (process.env.STOREFRONT_REQUIRE_PUBLISHED_PHOTOS === 'true') {
    const published: Pick<StorefrontProduct, 'slug'>[] = JSON.parse(await readFile(resolve(dataDir, 'products.json'), 'utf8'));
    const publishedSlugs = new Set(published.map(({ slug }) => slug));
    const candidates = prods.filter((product) => !publishedSlugs.has(product.slug) && productIndexPhotos(product).length === 0);
    if (candidates.length > 0) {
      console.error('New listings require a verified product photo: ' + candidates.map(({ slug }) => slug).sort().join(', '));
      process.exitCode = 1;
      return;
    }
  }
  await mkdir(dataDir, { recursive: true });

  await writeFile(
    resolve(dataDir, 'products.json'),
    JSON.stringify(prods, null, 2),
  );
  console.log(`✅ products.json — ${prods.length} 产品`);

  await writeFile(
    resolve(dataDir, 'collections.json'),
    JSON.stringify(colls, null, 2),
  );
  console.log(`✅ collections.json — ${colls.length} 系列`);

  await writeFile(
    resolve(dataDir, 'reviews.json'),
    JSON.stringify(reviews.byProduct, null, 2),
  );
  console.log(`✅ reviews.json — ${reviews.all.length} 评价`);

  await writeFile(
    resolve(dataDir, 'comments.json'),
    JSON.stringify(comments.byArticle, null, 2),
  );
  console.log(`✅ comments.json — ${comments.all.length} 评论`);

  console.log('\n🎉 导出完成!');
}

main().catch((error: unknown) => {
  const cause = error instanceof Error ? error.cause ?? error : error;
  const code = cause && typeof cause === 'object' && 'code' in cause ? cause.code : undefined;
  const detail = typeof code === 'string' && /^[A-Z0-9_]{2,30}$/.test(code) ? ` (${code})` : '';
  console.error(`Could not export storefront data${detail}. Check the database connection, schema, or output path.`);
  process.exitCode = 1;
}).finally(() => client.end({ timeout: 1 }));
