import type { StorefrontProduct } from './storefront';
import { CATEGORIES } from './categories';
import { productOfferPath, variantTitle, type StorefrontVariant } from './storefront-offer';

export type CatalogFilters = {
  query: string;
  category: string;
  collection?: string;
  material?: string;
  inStock: boolean;
  catalogOnly?: boolean;
  previewsOnly?: boolean;
  sort: 'featured' | 'price-asc' | 'price-desc';
};

export const CATALOG_MATERIALS = [
  { value: 'amethyst', label: 'Amethyst', pattern: /\bamethyst\b/i },
  { value: 'citrine', label: 'Citrine', pattern: /\bcitrine\b/i },
  { value: 'cotton', label: 'Cotton', pattern: /\bcotton\b/i },
  { value: 'hematite', label: 'Hematite', pattern: /\bhematite\b/i },
  { value: 'howlite', label: 'Howlite', pattern: /\bhowlite\b/i },
  { value: 'jade-tone-stone', label: 'Jade-tone stone', pattern: /\bjade[\s-]+tone\s+stone\b/i },
  { value: 'obsidian', label: 'Obsidian', pattern: /\bobsidian\b/i },
  { value: 'rose-quartz', label: 'Rose quartz', pattern: /\brose[\s-]+quartz\b/i },
  { value: 'silk', label: 'Silk', pattern: /\bsilk\b/i },
  { value: 'sterling-silver', label: 'Sterling silver (925)', pattern: /\b(?:sterling|925)[\s-]+silver\b(?![\s-]+(?:plated|tone|colou?r|finish)\b)/i },
  { value: 'strawberry-quartz', label: 'Strawberry quartz', pattern: /\bstrawberry[\s-]+quartz\b/i },
  { value: 'turquoise', label: 'Turquoise', pattern: /^(?!.*\b(?:dyed|faux|imitation)[\s-]+turquoise\b).*\bturquoise(?:\s+(?:beads?|inlay|cabochon|stones?|drops?|pendant)\b|$)/i },
  { value: 'unakite', label: 'Unakite', pattern: /\bunakite\b/i },
] as const;

type CatalogVariant = Pick<StorefrontVariant, 'sku' | 'name' | 'unitPriceCents' | 'stock' | 'photoUrls'>;

export type CatalogProduct = Pick<StorefrontProduct,
  'slug' | 'name' | 'description' | 'heritage' | 'materials' | 'category' | 'collectionSlug' | 'collectionName'
  | 'basePriceCents' | 'compareAtPriceCents' | 'primaryImage' | 'availability' | 'stock' | 'isFeatured'
  | 'imageKind' | 'palette'
> & { sku?: string; variant?: Pick<CatalogVariant, 'photoUrls'>; variants?: CatalogVariant[] };

export function catalogEntry(product: StorefrontProduct): CatalogProduct {
  const {
    slug, name, description, heritage, materials, category, collectionSlug, collectionName, basePriceCents,
    compareAtPriceCents, primaryImage, availability, stock, isFeatured, imageKind, palette,
  } = product;
  return {
    slug, name, description, heritage, materials, category, collectionSlug, collectionName, basePriceCents,
    compareAtPriceCents, primaryImage, availability, stock, isFeatured, imageKind, palette, sku: product.variant?.sku,
    ...(product.variant?.photoUrls?.length ? { variant: { photoUrls: product.variant.photoUrls } } : {}),
    variants: product.variants?.map(({ sku, name, unitPriceCents, stock, photoUrls }) => ({ sku, name, unitPriceCents, stock, photoUrls })),
  };
}

function matchingVariant(product: CatalogProduct, query: string) {
  const sku = query.trim();
  return product.variants?.find((variant) => variant.sku === sku)
    ?? product.variants?.find((variant) => variant.sku.toLowerCase() === sku.toLowerCase());
}

export function filterProducts<T extends CatalogProduct>(products: T[], filters: CatalogFilters): T[] {
  const words = (value: string) => value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const query = words(filters.query);
  const material = CATALOG_MATERIALS.find(({ value }) => value === filters.material);

  return products.filter((product) => {
    if (filters.category !== 'all' && product.category !== filters.category) return false;
    if (filters.collection && filters.collection !== 'all' && product.collectionSlug !== filters.collection) return false;
    if (material && (product.availability === 'preview' || !product.materials?.some((item) => material.pattern.test(item.trim().normalize('NFKC'))))) return false;
    if (filters.catalogOnly && product.availability === 'preview') return false;
    const variant = matchingVariant(product, filters.query);
    if (filters.inStock && ((variant?.stock ?? product.stock) <= 0 || product.availability === 'preview')) return false;
    if (filters.previewsOnly && product.availability !== 'preview') return false;
    if (variant || !query.length) return true;
    const categoryName = CATEGORIES.find(({ productType }) => productType === product.category)?.name;
    const searchable = words([
      product.name, product.description, product.category, categoryName, product.heritage, product.collectionName, product.sku,
      ...(product.materials ?? []),
      ...(product.variants?.flatMap(({ name, sku }) => [name, sku]) ?? []),
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
  const variantPhoto = isPreview ? undefined : product.variant?.photoUrls?.[0];
  return {
    slug: product.slug,
    href: productOfferPath(product.slug),
    name: product.name,
    heritage: product.collectionName ?? 'Nara Charm',
    price: product.basePriceCents > 0 ? priceLabel(product.basePriceCents) : null,
    compareAt: product.compareAtPriceCents ? priceLabel(product.compareAtPriceCents) : null,
    image: variantPhoto ?? product.primaryImage ?? undefined,
    isPreview,
    isIllustration: !variantPhoto && product.imageKind === 'illustration',
    palette: product.palette,
    tag: isPreview ? 'Design preview' : product.stock <= 0 ? 'Sold out' : null,
  };
}

export function productCardForSearch(product: CatalogProduct, query: string) {
  const variant = matchingVariant(product, query);
  if (!variant) return productCard(product);
  return {
    ...productCard({
      ...product,
      name: variantTitle(product.name, variant),
      basePriceCents: variant.unitPriceCents,
      compareAtPriceCents: null,
      stock: variant.stock,
      variant,
    }),
    href: productOfferPath(product.slug, variant.sku),
  };
}
