/**
 * 导出前端静态数据: 从 DB (Neon/Contabo) 导出 products/collections/reviews/comments JSON
 *
 * 用法: cd apps/web && set -a && source .env.prod && set +a && npx tsx scripts/export-storefront.ts
 *
 * 输出:
 *   apps/web/src/data/products.json     — StorefrontProduct[]
 *   apps/web/src/data/collections.json  — StorefrontCollection[]
 *   apps/web/src/data/reviews.json      — 已审核评价 (按 productId 分组)
 *   apps/web/src/data/comments.json     — 已审核文章评论
 *
 * 守卫: 无 DATABASE_URL 时 throw,避免静默导出空目录
 */
import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  products, collections, productVariants, inventory, productImages,
  productReviews, blogComments,
} from '../packages/db/schema';
import { eq, sql } from 'drizzle-orm';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL 未设置 — 无法导出静态数据');
  process.exit(1);
}

const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle({ client, schema: {
  products, collections, productVariants, inventory, productImages,
  productReviews, blogComments,
} });

type StorefrontProduct = {
  id: string; slug: string; name: string; subtitle: string | null;
  description: string | null; category: string; heritage: string | null;
  materials: string[] | null; basePriceCents: number;
  compareAtPriceCents: number | null; isFeatured: boolean;
  craftStory: string | null; careNotes: string | null;
  collectionSlug: string | null; collectionName: string | null;
  primaryImage: string | null; images: string[]; stock: number;
  seoTitle: string | null; seoDescription: string | null;
};

type StorefrontCollection = {
  id: string; slug: string; name: string; heritage: string | null;
  description: string | null; isFeatured: boolean; productCount: number;
};

async function exportProducts(): Promise<StorefrontProduct[]> {
  const rows: any[] = await db
    .select({
      id: products.id, slug: products.slug, name: products.name,
      subtitle: products.subtitle, description: products.description,
      category: products.category, heritage: products.heritage,
      materials: products.materials, basePriceCents: products.basePriceCents,
      compareAtPriceCents: products.compareAtPriceCents, isFeatured: products.isFeatured,
      craftStory: products.craftStory, careNotes: products.careNotes,
      collectionSlug: collections.slug, collectionName: collections.name,
      seoTitle: products.seoTitle, seoDescription: products.seoDescription,
      stock: sql<number>`coalesce(${inventory.quantity}, 0) - coalesce(${inventory.reserved}, 0)`,
      imageUrl: productImages.url, imageIsPrimary: productImages.isPrimary,
      imageSort: productImages.sortOrder,
    })
    .from(products)
    .leftJoin(collections, eq(products.collectionId, collections.id))
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
    .leftJoin(productImages, eq(productImages.productId, products.id))
    .where(eq(products.status, 'active'))
    .orderBy(products.createdAt);

  const map = new Map<string, StorefrontProduct>();
  for (const r of rows) {
    if (!map.has(r.id)) {
      map.set(r.id, {
        id: r.id, slug: r.slug, name: r.name, subtitle: r.subtitle,
        description: r.description, category: r.category, heritage: r.heritage,
        materials: r.materials, basePriceCents: Number(r.basePriceCents),
        compareAtPriceCents: r.compareAtPriceCents ? Number(r.compareAtPriceCents) : null,
        isFeatured: r.isFeatured, craftStory: r.craftStory, careNotes: r.careNotes,
        collectionSlug: r.collectionSlug, collectionName: r.collectionName,
        primaryImage: null, images: [], stock: Math.max(0, Number(r.stock)),
        seoTitle: r.seoTitle, seoDescription: r.seoDescription,
      });
    }
    const p = map.get(r.id)!;
    if (r.imageUrl) {
      p.images.push(r.imageUrl);
      if (r.imageIsPrimary) p.primaryImage = r.imageUrl;
    }
  }
  for (const p of map.values()) {
    if (p.primaryImage) {
      p.images = [p.primaryImage, ...p.images.filter((i) => i !== p.primaryImage)];
    } else if (p.images.length > 0) {
      p.primaryImage = p.images[0];
    }
  }
  return Array.from(map.values());
}

async function exportCollections(): Promise<StorefrontCollection[]> {
  const rows: any[] = await db
    .select({
      id: collections.id, slug: collections.slug, name: collections.name,
      heritage: collections.heritage, description: collections.description,
      isFeatured: collections.isFeatured,
      productCount: sql<number>`(select count(*) from ${products} where ${products.collectionId} = ${collections.id} and ${products.status} = 'active')`,
    })
    .from(collections)
    .orderBy(collections.sortOrder);
  return rows.map((r: any) => ({ ...r, productCount: Number(r.productCount) }));
}

async function exportReviews() {
  const rows: any[] = await db
    .select({
      id: productReviews.id, productId: productReviews.productId,
      authorName: productReviews.authorName, rating: productReviews.rating,
      title: productReviews.title, text: productReviews.text,
      isVerifiedPurchase: productReviews.isVerifiedPurchase,
      createdAt: productReviews.createdAt,
    })
    .from(productReviews)
    .where(eq(productReviews.isFeatured, false)); // 已审核展示的
  // 按 productId 分组
  const byProduct: Record<string, any[]> = {};
  for (const r of rows) {
    if (!byProduct[r.productId]) byProduct[r.productId] = [];
    byProduct[r.productId].push(r);
  }
  return { all: rows, byProduct };
}

async function exportComments() {
  const rows: any[] = await db
    .select({
      id: blogComments.id, articleSlug: blogComments.articleSlug,
      authorName: blogComments.authorName, text: blogComments.text,
      createdAt: blogComments.createdAt,
    })
    .from(blogComments)
    .where(eq(blogComments.isApproved, true));
  const byArticle: Record<string, any[]> = {};
  for (const r of rows) {
    if (!byArticle[r.articleSlug]) byArticle[r.articleSlug] = [];
    byArticle[r.articleSlug].push(r);
  }
  return { all: rows, byArticle };
}

async function main() {
  console.log('📦 导出前端静态数据...\n');

  const [prods, colls, reviews, comments] = await Promise.all([
    exportProducts(), exportCollections(), exportReviews(), exportComments(),
  ]);

  const dataDir = resolve(process.cwd(), 'src/data');
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

  await client.end();
  console.log('\n🎉 导出完成!');
  process.exit(0);
}

main().catch((e) => { console.error('❌ 导出失败:', e); process.exit(1); });
