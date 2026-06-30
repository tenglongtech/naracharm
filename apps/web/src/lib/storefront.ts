import { db } from '@/lib/db';
import { products, collections, productImages, productVariants, inventory } from '@jewelry/db';
import { eq, and, sql } from 'drizzle-orm';

/**
 * 前台数据查询层 (只读,Server Component 用)
 *
 * 所有前台页面从这里读数据,不再用 sample-data。
 * 后台改商品 → 前台自动更新。
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
  seoTitle: string | null;
  seoDescription: string | null;
};

// ─── 查所有在售商品 (首页 Best Sellers 用) ──────────────────────────────
export async function getActiveProducts(): Promise<StorefrontProduct[]> {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      subtitle: products.subtitle,
      description: products.description,
      category: products.category,
      heritage: products.heritage,
      materials: products.materials,
      basePriceCents: products.basePriceCents,
      compareAtPriceCents: products.compareAtPriceCents,
      isFeatured: products.isFeatured,
      craftStory: products.craftStory,
      careNotes: products.careNotes,
      collectionSlug: collections.slug,
      collectionName: collections.name,
      seoTitle: products.seoTitle,
      seoDescription: products.seoDescription,
      stock: sql<number>`coalesce(${inventory.quantity}, 0)`,
      imageUrl: productImages.url,
      imageIsPrimary: productImages.isPrimary,
      imageSort: productImages.sortOrder,
    })
    .from(products)
    .leftJoin(collections, eq(products.collectionId, collections.id))
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
    .leftJoin(productImages, eq(productImages.productId, products.id))
    .where(eq(products.status, 'active'))
    .orderBy(products.createdAt);

  // 合并图片 (一个产品多行 → 一行 + images 数组)
  const map = new Map<string, StorefrontProduct>();
  for (const r of rows) {
    if (!map.has(r.id)) {
      map.set(r.id, {
        id: r.id,
        slug: r.slug,
        name: r.name,
        subtitle: r.subtitle,
        description: r.description,
        category: r.category,
        heritage: r.heritage,
        materials: r.materials,
        basePriceCents: r.basePriceCents,
        compareAtPriceCents: r.compareAtPriceCents,
        isFeatured: r.isFeatured,
        craftStory: r.craftStory,
        careNotes: r.careNotes,
        collectionSlug: r.collectionSlug,
        collectionName: r.collectionName,
        primaryImage: null,
        images: [],
        stock: Number(r.stock),
        seoTitle: r.seoTitle,
        seoDescription: r.seoDescription,
      });
    }
    const p = map.get(r.id)!;
    if (r.imageUrl) {
      p.images.push(r.imageUrl);
      if (r.imageIsPrimary) p.primaryImage = r.imageUrl;
    }
  }
  // 主图放第一
  for (const p of map.values()) {
    if (p.primaryImage) {
      p.images = [p.primaryImage, ...p.images.filter((i) => i !== p.primaryImage)];
    } else if (p.images.length > 0) {
      p.primaryImage = p.images[0];
    }
  }
  return Array.from(map.values());
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
  const rows = await db
    .select({
      id: collections.id,
      slug: collections.slug,
      name: collections.name,
      heritage: collections.heritage,
      description: collections.description,
      isFeatured: collections.isFeatured,
      productCount: sql<number>`(select count(*) from ${products} where ${products.collectionId} = ${collections.id} and ${products.status} = 'active')`,
    })
    .from(collections)
    .orderBy(collections.sortOrder);

  return rows.map((r: any) => ({ ...r, productCount: Number(r.productCount) }));
}

export async function getCollectionBySlug(slug: string): Promise<StorefrontCollection | null> {
  const all = await getAllCollections();
  return all.find((c) => c.slug === slug) ?? null;
}
