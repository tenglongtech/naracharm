/**
 * 静态数据源: 从构建时导出的 JSON 读取
 *
 * 由 scripts/export-storefront.ts 生成 (构建前运行)。
 * 前端 storefront.ts 从这里的静态数据读取,不再查数据库。
 */
import imagery from '@/data/product-imagery.json';
import studioProducts from '@/data/studio-products.json';
import productsJson from '@/data/products.json';
import collectionsJson from '@/data/collections.json';
import reviewsJson from '@/data/reviews.json';
import commentsJson from '@/data/comments.json';
import type { StorefrontProduct, StorefrontCollection } from './storefront';

export const STATIC_PRODUCTS: StorefrontProduct[] = [...productsJson.map(p => ({ ...p, ...(imagery as Record<string, object>)[p.slug] })), ...studioProducts] as StorefrontProduct[];
export const STATIC_COLLECTIONS: StorefrontCollection[] = [...collectionsJson, { id: 'studio-edit', slug: 'studio-edit', name: 'Studio Edit', heritage: 'Design studio', description: 'A first look at six new jewelry designs. Explore the planned pieces while we confirm production and availability.', isFeatured: false, productCount: 6 }].map(c => ({ ...c, productCount: STATIC_PRODUCTS.filter(p => p.collectionSlug === c.slug).length })) as StorefrontCollection[];

// 评价/评论静态兜底: 构建时已审核数据,后端不可达时仍可显示
export const STATIC_REVIEWS: Record<string, unknown[]> = reviewsJson as Record<string, unknown[]>;
export const STATIC_COMMENTS: Record<string, unknown[]> = commentsJson as Record<string, unknown[]>;
