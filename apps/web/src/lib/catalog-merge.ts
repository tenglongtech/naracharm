import type { StorefrontCollection, StorefrontProduct } from './storefront';
import { getProductCopy } from './product-copy';
import { withProductMedia } from './product-media';

type ProductMedia = Pick<StorefrontProduct, 'primaryImage' | 'images' | 'imageKind'>;

export function mergeCatalog(
  listed: readonly StorefrontProduct[],
  registeredCollections: readonly StorefrontCollection[],
  previews: readonly StorefrontProduct[],
  studioCollections: readonly StorefrontCollection[],
  illustrations: Readonly<Record<string, ProductMedia>>,
) {
  const designsBySlug = new Map(previews.map((preview) => [preview.slug, preview]));
  const products = new Map<string, StorefrontProduct>();
  for (const item of listed) {
    const design = designsBySlug.get(item.slug);
    const collection = item.collectionSlug ? {} : { collectionSlug: design?.collectionSlug ?? null, collectionName: design?.collectionName ?? null };
    const illustration = illustrations[item.slug] ?? (design?.primaryImage ? {
      primaryImage: design.primaryImage, images: design.images, imageKind: 'illustration' as const,
    } : undefined);
    products.set(item.slug, withProductMedia({
      ...item, ...getProductCopy(item), ...collection,
    }, illustration));
  }
  for (const preview of previews) {
    if (!products.has(preview.slug)) products.set(preview.slug, preview);
  }

  const counts = new Map<string, number>();
  for (const { collectionSlug } of products.values()) {
    if (collectionSlug) counts.set(collectionSlug, (counts.get(collectionSlug) ?? 0) + 1);
  }
  const collectionBySlug = new Map(registeredCollections.map((collection) => [collection.slug, collection]));
  for (const studio of studioCollections) {
    const registered = collectionBySlug.get(studio.slug);
    collectionBySlug.set(studio.slug, { ...studio, ...registered, kind: 'studio' });
  }
  return {
    products: Array.from(products.values()),
    collections: Array.from(collectionBySlug.values(), (collection) => ({ ...collection, productCount: counts.get(collection.slug) ?? 0 })),
  };
}
