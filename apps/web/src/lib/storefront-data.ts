/**
 * 静态数据源: 从构建时导出的 JSON 读取
 *
 * 由 scripts/export-storefront.ts 生成 (构建前运行)。
 * 前端 storefront.ts 从这里的静态数据读取,不再查数据库。
 */
import productsJson from '@/data/products.json';
import collectionsJson from '@/data/collections.json';
import reviewsJson from '@/data/reviews.json';
import commentsJson from '@/data/comments.json';
import type { StorefrontProduct, StorefrontCollection } from './storefront';

export const STATIC_PRODUCTS: StorefrontProduct[] = productsJson as StorefrontProduct[];
export const STATIC_COLLECTIONS: StorefrontCollection[] = collectionsJson as StorefrontCollection[];

// 评价/评论静态兜底: 构建时已审核数据,后端不可达时仍可显示
export const STATIC_REVIEWS: Record<string, unknown[]> = reviewsJson as Record<string, unknown[]>;
export const STATIC_COMMENTS: Record<string, unknown[]> = commentsJson as Record<string, unknown[]>;
