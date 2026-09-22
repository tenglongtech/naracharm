import type { StorefrontProduct } from './storefront';
export type CatalogFilters = { query: string; category: string; inStock: boolean; sort: 'featured' | 'price-asc' | 'price-desc' };
export function filterProducts(products: StorefrontProduct[], filters: CatalogFilters) {
  const query = filters.query.trim().toLowerCase();
  return products.filter(p => (filters.category === 'all' || p.category === filters.category)
    && (!filters.inStock || p.stock > 0)
    && [p.name, p.description, p.heritage, ...(p.materials ?? [])].join(' ').toLowerCase().includes(query))
    .sort((a, b) => filters.sort === 'price-asc' ? a.basePriceCents - b.basePriceCents
      : filters.sort === 'price-desc' ? b.basePriceCents - a.basePriceCents : Number(b.isFeatured) - Number(a.isFeatured));
}
export function productCard(p: StorefrontProduct) {
  return { slug: p.slug, name: p.name, heritage: p.collectionName ?? 'Nara Charm', price: `$${(p.basePriceCents / 100).toFixed(2)}`, compareAt: p.compareAtPriceCents ? `$${(p.compareAtPriceCents / 100).toFixed(2)}` : null, image: p.primaryImage ?? undefined, tag: p.availability === 'preview' ? 'Design preview' : p.stock <= 0 ? 'Sold out' : null };
}
