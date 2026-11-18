import firstEdit from '@/data/studio-products.json';
import { COLLECTION_DESIGNS, STUDIO_COLLECTIONS } from './studio-designs';
import type { StorefrontCollection, StorefrontProduct } from './storefront';

export const STUDIO_PREVIEWS: StorefrontProduct[] = [
  ...firstEdit.map((item) => ({ ...item, availability: 'preview', imageKind: 'illustration' } as StorefrontProduct)),
  ...COLLECTION_DESIGNS,
];

export const STUDIO_CATALOG_COLLECTIONS: StorefrontCollection[] = [
  {
    id: 'studio-edit', slug: 'studio-edit', name: 'Studio Edit', heritage: 'Design studio',
    description: 'Jewelry and phone charm designs from the first studio edit.',
    isFeatured: false, productCount: firstEdit.length, kind: 'studio',
  },
  ...STUDIO_COLLECTIONS,
];

export function getStudioPreview(slug: string) {
  return STUDIO_PREVIEWS.find((product) => product.slug === slug);
}

export function getStudioCollection(slug: string) {
  return STUDIO_CATALOG_COLLECTIONS.find((collection) => collection.slug === slug);
}
