'use client';

import { Suspense, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CATALOG_MATERIALS, filterProducts, productCardForSearch, type CatalogFilters, type CatalogProduct } from '@/lib/catalog';
import {
  catalogFragment, catalogHashPrefix, catalogPageSize, catalogQueryLimit, defaultCatalogFilters, parseCatalogLocation, type CatalogView,
} from '@/lib/catalog-location';
import { CATEGORIES } from '@/lib/categories';
import { siteConfig } from '@/lib/site-config';
import { ProductTile } from './product-tile';
import styles from './product-catalog.module.css';

const locationChanged = 'naracharm:catalog-location';

function notifyCatalogLocation() {
  window.dispatchEvent(new Event(locationChanged));
}

function subscribeCatalogLocation(notify: () => void) {
  window.addEventListener('popstate', notify);
  window.addEventListener('hashchange', notify);
  window.addEventListener(locationChanged, notify);
  return () => {
    window.removeEventListener('popstate', notify);
    window.removeEventListener('hashchange', notify);
    window.removeEventListener(locationChanged, notify);
  };
}

function catalogLocation() {
  return window.location.search + window.location.hash;
}

function initialLocation() {
  return '';
}

function CatalogLocationObserver() {
  const params = useSearchParams();
  useEffect(() => {
    notifyCatalogLocation();
  }, [params]);
  return null;
}

function writeCatalogLocation(view: CatalogView, mode: 'pushState' | 'replaceState') {
  const url = new URL(window.location.href);
  const fragment = catalogFragment(view);
  if (fragment || url.hash.startsWith(catalogHashPrefix)) url.hash = fragment;
  if (url.searchParams.has('q')) url.searchParams.delete('q');
  if (url.href === window.location.href) return false;

  window.history[mode](null, '', url);
  notifyCatalogLocation();
  return true;
}

const availabilityOptions = ([
  { value: 'all', label: 'All pieces' },
  { value: 'catalog', label: 'Catalog pieces' },
  { value: 'stock', label: 'In stock' },
  { value: 'preview', label: 'Studio previews' },
] as const).filter(({ value }) => siteConfig.checkoutEnabled || value !== 'stock');

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Lowest price' },
  { value: 'price-desc', label: 'Highest price' },
] as const;

type Props = {
  products: CatalogProduct[];
  collections: { slug: string; name: string }[];
};

export function ProductCatalog({ products, collections }: Props) {
  const location = useSyncExternalStore(subscribeCatalogLocation, catalogLocation, initialLocation);
  const [facetOpen, setFacetOpen] = useState(false);
  const [copyResult, setCopyResult] = useState<{ location: string; message: string } | null>(null);
  const editingQuery = useRef(false);
  const resultSummary = useRef<HTMLParagraphElement>(null);
  const results = useRef<HTMLDivElement>(null);
  const firstAddedResult = useRef<number | null>(null);
  const facetsId = useId();
  const collectionSlugs = useMemo(() => new Set(collections.map(({ slug }) => slug)), [collections]);
  const maxPages = Math.max(1, Math.ceil(products.length / catalogPageSize));
  const { filters, pages } = useMemo(() => parseCatalogLocation(location, collectionSlugs, maxPages, siteConfig.checkoutEnabled), [location, collectionSlugs, maxPages]);
  const matches = useMemo(() => filterProducts(products, filters), [products, filters]);
  const visible = matches.slice(0, pages * catalogPageSize);
  const availability = filters.inStock ? 'stock' : filters.catalogOnly ? 'catalog' : filters.previewsOnly ? 'preview' : 'all';
  const previews = matches.filter(({ availability }) => availability === 'preview').length;
  const listed = matches.length - previews;
  const resultCount = [
    listed > 0 && `${listed} catalog ${listed === 1 ? 'piece' : 'pieces'}`,
    previews > 0 && `${previews} studio ${previews === 1 ? 'preview' : 'previews'}`,
  ].filter(Boolean).join(' · ');
  const category = CATEGORIES.find(({ productType }) => productType === filters.category);
  const collection = collections.find(({ slug }) => slug === filters.collection);
  const material = CATALOG_MATERIALS.find(({ value }) => value === filters.material);
  const sort = sortOptions.find(({ value }) => value === filters.sort && value !== 'featured');
  const activeFacets = [
    ...(category ? [{ name: 'category', label: category.name, clear: { category: 'all' } }] : []),
    ...(collection ? [{ name: 'collection', label: collection.name, clear: { collection: 'all' } }] : []),
    ...(material ? [{ name: 'material', label: material.label, clear: { material: undefined } }] : []),
    ...(sort ? [{ name: 'sort', label: sort.label, clear: { sort: 'featured' as const } }] : []),
  ];
  const facetCount = activeFacets.length;
  const hasFilters = Boolean(filters.query.trim() || facetCount || availability !== 'all');

  useEffect(() => {
    const index = firstAddedResult.current;
    if (index === null || visible.length <= index) return;
    firstAddedResult.current = null;
    const product = results.current?.children.item(index);
    if (product instanceof HTMLElement) product.focus();
  }, [visible.length]);

  function update(next: Partial<CatalogFilters>) {
    writeCatalogLocation({ filters: { ...filters, ...next }, pages: 1 }, 'pushState');
  }

  function updateQuery(query: string) {
    const changed = writeCatalogLocation({ filters: { ...filters, query }, pages: 1 }, editingQuery.current ? 'replaceState' : 'pushState');
    if (changed) editingQuery.current = true;
  }

  function showMore() {
    firstAddedResult.current = visible.length;
    if (!writeCatalogLocation({ filters, pages: pages + 1 }, 'replaceState')) firstAddedResult.current = null;
  }

  async function copyLink() {
    let message = 'Link copied.';
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      message = 'Copy the address from your browser.';
    }
    setCopyResult({ location, message });
  }

  return (
    <section aria-label="Jewelry catalog">
      <Suspense fallback={null}><CatalogLocationObserver /></Suspense>
      <div className={styles.tools}>
        <label className={styles.search}>
          Search jewelry
          <input
            id="catalog-search-input" type="search" value={filters.query} maxLength={catalogQueryLimit}
            onChange={(event) => updateQuery(event.target.value)}
            onBlur={() => { editingQuery.current = false; }}
            placeholder="Try silver bracelets or an item code"
          />
        </label>
        <div role="group" aria-label="Catalog view" className={styles.availability}>
          {availabilityOptions.map(({ value, label }) => (
            <button key={value} type="button" aria-pressed={availability === value} onClick={() => update({ inStock: value === 'stock', catalogOnly: value === 'catalog', previewsOnly: value === 'preview' })}>{label}</button>
          ))}
        </div>

        <button type="button" className={styles.disclosure} aria-controls={facetsId} aria-expanded={facetOpen} onClick={() => setFacetOpen((open) => !open)}>
          <span>Filters and sorting {facetCount ? '(' + facetCount + ')' : ''}</span>
          <span aria-hidden="true">{facetOpen ? '−' : '+'}</span>
        </button>
        <div id={facetsId} className={styles.facets} data-open={facetOpen}>
          <label>Category
            <select value={filters.category} onChange={(event) => update({ category: event.target.value })}>
              <option value="all">All categories</option>
              {CATEGORIES.map(({ slug, productType, name }) => <option key={slug} value={productType}>{name}</option>)}
            </select>
          </label>
          <label>Collection
            <select value={filters.collection} onChange={(event) => update({ collection: event.target.value })}>
              <option value="all">All collections</option>
              {collections.map(({ slug, name }) => <option key={slug} value={slug}>{name}</option>)}
            </select>
          </label>
          <label>Material
            <select value={filters.material ?? ''} onChange={(event) => update({ material: event.target.value || undefined })}>
              <option value="">All materials</option>
              {CATALOG_MATERIALS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>Sort by
            <select value={filters.sort} onChange={(event) => update({ sort: event.target.value as CatalogFilters['sort'] })}>
              {sortOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
      </div>
      {facetCount > 0 && (
        <ul role="list" aria-label="Active filters" className={styles.activeFacets}>
          {activeFacets.map(({ name, label, clear }) => (
            <li key={name}>
              <button type="button" aria-label={`Remove ${name} filter (${label})`} onClick={() => {
                update(clear);
                resultSummary.current?.focus();
              }}>
                <span>{label}</span><span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.resultBar}>
        <p role="status" ref={resultSummary} tabIndex={-1} className={styles.resultSummary}>
          {resultCount || 'No results'}{matches.length > visible.length && <> · Showing {visible.length}</>}
        </p>
        <div className={styles.resultActions}>
          {(hasFilters || pages > 1) && <button type="button" onClick={copyLink}>Copy link</button>}
          {hasFilters && <button type="button" onClick={() => {
            writeCatalogLocation({ filters: defaultCatalogFilters, pages: 1 }, 'pushState');
            resultSummary.current?.focus();
          }}>Clear filters</button>}
        </div>
        {copyResult?.location === location && <p role="status" className={styles.copyResult}>{copyResult.message}</p>}
      </div>
      {visible.length > 0 ? (
        <div ref={results} className={styles.results}>
          {visible.map((product, index) => (
            <ProductTile
              key={product.slug}
              product={productCardForSearch(product, filters.query)}
              sizes="(max-width: 639px) 46vw, (max-width: 1023px) 30vw, (max-width: 1392px) 23vw, 307px"
              prioritizeImage={index === 0}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <h2>No pieces match these filters</h2>
          <p>{material && filters.previewsOnly
            ? 'Material filters apply to catalog pieces. Choose a different catalog view to browse by material.'
            : 'Try another material, collection or catalog view.'}</p>
        </div>
      )}
      {visible.length < matches.length && (
        <div className={styles.more}>
          <button type="button" className="shop-button" onClick={showMore}>Show more pieces <span aria-hidden="true">↓</span></button>
        </div>
      )}
      <div className={styles.footerLinks}>
        <Link href="/collections">Browse all collections <span aria-hidden="true">↗</span></Link>
        <Link href="/studio">Explore studio designs <span aria-hidden="true">↗</span></Link>
        <Link href="/size-guide">Jewelry size guide <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );
}
