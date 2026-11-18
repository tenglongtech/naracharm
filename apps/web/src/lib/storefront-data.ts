import imagery from '@/data/product-imagery.json';
import productsJson from '@/data/products.json';
import collectionsJson from '@/data/collections.json';
import reviewsJson from '@/data/reviews.json';
import commentsJson from '@/data/comments.json';
import type { StorefrontProduct, StorefrontCollection } from './storefront';
import { STUDIO_PREVIEWS, STUDIO_CATALOG_COLLECTIONS } from './studio-listings';
import { mergeCatalog } from './catalog-merge';

const catalog = mergeCatalog(
  productsJson as StorefrontProduct[],
  collectionsJson as StorefrontCollection[],
  STUDIO_PREVIEWS,
  STUDIO_CATALOG_COLLECTIONS,
  imagery as Record<string, Pick<StorefrontProduct, 'primaryImage' | 'images' | 'imageKind'>>,
);

export const STATIC_PRODUCTS = catalog.products;
export const STATIC_COLLECTIONS = catalog.collections;
export const STATIC_REVIEWS: Record<string, unknown[]> = reviewsJson as Record<string, unknown[]>;
export const STATIC_COMMENTS: Record<string, unknown[]> = commentsJson as Record<string, unknown[]>;
