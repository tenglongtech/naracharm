import { STATIC_PRODUCTS, STATIC_COLLECTIONS } from './storefront-data';

/**
 * 前台数据查询层 (静态数据)
 *
 * 数据来自构建时导出的 JSON (scripts/export-storefront.ts),
 * 不再直接查数据库。后台改商品 → 重新构建导出即可。
 * 函数签名保持不变,调用方页面零改动。
 */

export type StorefrontProduct = {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  category: 'phone-charm' | 'necklace' | 'bracelet' | 'earrings';
  heritage: string | null;
  materials: string[] | null;
  basePriceCents: number;
  compareAtPriceCents: number | null;
  isFeatured: boolean;
  craftStory: string | null;
  careNotes: string | null;
  collectionSlug: string | null;
  collectionName: string | null;
  primaryImage: string | null;
  images: string[];
  stock: number;
  availability?: 'preview';
  imageKind?: 'illustration';
  seoTitle: string | null;
  seoDescription: string | null;
};

// ─── 查所有在售商品 (首页 Best Sellers 用) ──────────────────────────────
export async function getActiveProducts(): Promise<StorefrontProduct[]> {
  return STATIC_PRODUCTS;
}

// ─── 按 slug 查单个产品 ──────────────────────────────────────────────────
export async function getProductBySlug(slug: string): Promise<StorefrontProduct | null> {
  const all = await getActiveProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

// ─── 按系列查产品 ─────────────────────────────────────────────────────────
export async function getProductsByCollection(collectionSlug: string): Promise<StorefrontProduct[]> {
  const all = await getActiveProducts();
  return all.filter((p) => p.collectionSlug === collectionSlug);
}

// ─── 按品类查产品 ─────────────────────────────────────────────────────────
export async function getProductsByCategory(category: string): Promise<StorefrontProduct[]> {
  const all = await getActiveProducts();
  return all.filter((p) => p.category === category);
}

// ─── 查所有系列 ──────────────────────────────────────────────────────────
export type StorefrontCollection = {
  id: string;
  slug: string;
  name: string;
  heritage: string | null;
  description: string | null;
  isFeatured: boolean;
  productCount: number;
};

export async function getAllCollections(): Promise<StorefrontCollection[]> {
  return STATIC_COLLECTIONS;
}

export async function getCollectionBySlug(slug: string): Promise<StorefrontCollection | null> {
  const all = await getAllCollections();
  return all.find((c) => c.slug === slug) ?? null;
}
