import { CATALOG_MATERIALS, type CatalogFilters } from './catalog';
import { CATEGORIES } from './categories';

export const catalogHashPrefix = '#catalog?';
export const catalogPageSize = 24;
export const catalogQueryLimit = 160;

export const defaultCatalogFilters: CatalogFilters = {
  query: '', category: 'all', collection: 'all', inStock: false, previewsOnly: false, sort: 'featured',
};

export type CatalogView = { filters: CatalogFilters; pages: number };

export function parseCatalogLocation(location: string, collections: ReadonlySet<string>, maxPages: number, checkoutEnabled = true): CatalogView {
  const hashAt = location.indexOf('#');
  const hash = hashAt === -1 ? '' : location.slice(hashAt);
  const search = hashAt === -1 ? location : location.slice(0, hashAt);
  const params = hash.startsWith(catalogHashPrefix)
    ? new URLSearchParams(hash.slice(catalogHashPrefix.length))
    : new URLSearchParams({ q: new URLSearchParams(search).get('q') ?? '' });
  const category = params.get('category') ?? '';
  const collection = params.get('collection') ?? '';
  const material = CATALOG_MATERIALS.find(({ value }) => value === params.get('material'));
  const availability = params.get('availability');
  const catalogOnly = availability === 'catalog' || (availability === 'stock' && !checkoutEnabled);
  const sort = params.get('sort');
  const page = params.get('page') ?? '';

  return {
    filters: {
      query: (params.get('q') ?? '').slice(0, catalogQueryLimit),
      category: CATEGORIES.some(({ productType }) => productType === category) ? category : 'all',
      collection: collections.has(collection) ? collection : 'all',
      ...(material ? { material: material.value } : {}),
      inStock: checkoutEnabled && availability === 'stock', previewsOnly: availability === 'preview',
      ...(catalogOnly ? { catalogOnly } : {}),
      sort: sort === 'price-asc' || sort === 'price-desc' ? sort : 'featured',
    },
    pages: /^\d{1,9}$/.test(page) ? Math.max(1, Math.min(Number(page), maxPages)) : 1,
  };
}

export function catalogFragment({ filters, pages }: CatalogView) {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set('q', filters.query.slice(0, catalogQueryLimit));
  if (filters.category !== 'all') params.set('category', filters.category);
  if (filters.collection && filters.collection !== 'all') params.set('collection', filters.collection);
  if (filters.material) params.set('material', filters.material);
  if (filters.inStock) params.set('availability', 'stock');
  else if (filters.catalogOnly) params.set('availability', 'catalog');
  else if (filters.previewsOnly) params.set('availability', 'preview');
  if (filters.sort !== 'featured') params.set('sort', filters.sort);
  if (pages > 1) params.set('page', String(pages));
  return params.size ? catalogHashPrefix + params.toString() : '';
}
