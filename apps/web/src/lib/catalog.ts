import type { StorefrontProduct } from './storefront';
import { CATEGORIES } from './categories';

export type CatalogFilters = {
  query: string;
  category: string;
  collection?: string;
  inStock: boolean;
  previewsOnly?: boolean;
  sort: 'featured' | 'price-asc' | 'price-desc';
};

export type CatalogProduct = Pick<StorefrontProduct,
  'slug' | 'name' | 'description' | 'heritage' | 'materials' | 'category' | 'collectionSlug' | 'collectionName'
  | 'basePriceCents' | 'compareAtPriceCents' | 'primaryImage' | 'availability' | 'stock' | 'isFeatured'
  | 'imageKind' | 'palette'
> & { sku?: string };

export function catalogEntry(product: StorefrontProduct): CatalogProduct {
  const {
    slug, name, description, heritage, materials, category, collectionSlug, collectionName, basePriceCents,
    compareAtPriceCents, primaryImage, availability, stock, isFeatured, imageKind, palette,
  } = product;
  return {
    slug, name, description, heritage, materials, category, collectionSlug, collectionName, basePriceCents,
    compareAtPriceCents, primaryImage, availability, stock, isFeatured, imageKind, palette, sku: product.variant?.sku,
  };
}

export function filterProducts<T extends CatalogProduct>(products: T[], filters: CatalogFilters): T[] {
  const words = (value: string) => value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const query = words(filters.query);

  return products.filter((product) => {
    if (filters.category !== 'all' && product.category !== filters.category) return false;
    if (filters.collection && filters.collection !== 'all' && product.collectionSlug !== filters.collection) return false;
    if (filters.inStock && (product.stock <= 0 || product.availability === 'preview')) return false;
    if (filters.previewsOnly && product.availability !== 'preview') return false;
    if (!query.length) return true;
    const categoryName = CATEGORIES.find(({ productType }) => productType === product.category)?.name;
    const searchable = words([
      product.name, product.description, product.category, categoryName, product.heritage, product.collectionName, product.sku,
      ...(product.materials ?? []),
    ].join(' '));
    return query.every((term) => searchable.some((word) => word.startsWith(term)));
  }).sort((a, b) => {
    if (filters.sort === 'featured') return Number(b.isFeatured) - Number(a.isFeatured);
    if (!a.basePriceCents || !b.basePriceCents) return Number(Boolean(b.basePriceCents)) - Number(Boolean(a.basePriceCents));
    return (a.basePriceCents - b.basePriceCents) * (filters.sort === 'price-asc' ? 1 : -1);
  });
}

export function priceLabel(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function productCard(product: CatalogProduct) {
  const isPreview = product.availability === 'preview';
  return {
    slug: product.slug,
    name: product.name,
    heritage: product.collectionName ?? 'Nara Charm',
    price: product.basePriceCents > 0 ? priceLabel(product.basePriceCents) : null,
    compareAt: product.compareAtPriceCents ? priceLabel(product.compareAtPriceCents) : null,
    image: product.primaryImage ?? undefined,
    isPreview,
    isIllustration: product.imageKind === 'illustration',
    palette: product.palette,
    tag: isPreview ? 'Design preview' : product.stock <= 0 ? 'Sold out' : null,
  };
}
