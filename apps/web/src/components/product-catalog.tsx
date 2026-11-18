'use client';

import { Suspense, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { filterProducts, productCard, type CatalogFilters, type CatalogProduct } from '@/lib/catalog';
import {
  catalogFragment, catalogHashPrefix, catalogPageSize, catalogQueryLimit, defaultCatalogFilters, parseCatalogLocation, type CatalogView,
} from '@/lib/catalog-location';
import { CATEGORIES } from '@/lib/categories';
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

const availabilityOptions = [
  { value: 'all', label: 'All pieces' },
  { value: 'stock', label: 'In stock' },
  { value: 'preview', label: 'Design previews' },
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
  const facetsId = useId();
  const collectionSlugs = useMemo(() => new Set(collections.map(({ slug }) => slug)), [collections]);
  const maxPages = Math.max(1, Math.ceil(products.length / catalogPageSize));
  const { filters, pages } = useMemo(() => parseCatalogLocation(location, collectionSlugs, maxPages), [location, collectionSlugs, maxPages]);
  const matches = useMemo(() => filterProducts(products, filters), [products, filters]);
  const visible = matches.slice(0, pages * catalogPageSize);
  const availability = filters.inStock ? 'stock' : filters.previewsOnly ? 'preview' : 'all';
  const facetCount = Number(filters.category !== 'all') + Number(filters.collection !== 'all') + Number(filters.sort !== 'featured');
  const hasFilters = Boolean(filters.query.trim() || facetCount || availability !== 'all');

  function update(next: Partial<CatalogFilters>) {
    writeCatalogLocation({ filters: { ...filters, ...next }, pages: 1 }, 'pushState');
  }

  function updateQuery(query: string) {
    const changed = writeCatalogLocation({ filters: { ...filters, query }, pages: 1 }, editingQuery.current ? 'replaceState' : 'pushState');
    if (changed) editingQuery.current = true;
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
        <div role="group" aria-label="Availability" className={styles.availability}>
          {availabilityOptions.map(({ value, label }) => (
            <button key={value} type="button" aria-pressed={availability === value} onClick={() => update({ inStock: value === 'stock', previewsOnly: value === 'preview' })}>{label}</button>
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
          <label>Sort by
            <select value={filters.sort} onChange={(event) => update({ sort: event.target.value as CatalogFilters['sort'] })}>
              <option value="featured">Featured</option>
              <option value="price-asc">Lowest price</option>
              <option value="price-desc">Highest price</option>
            </select>
          </label>
        </div>
      </div>
      <div className={styles.resultBar}>
        <p role="status">
          {matches.length} {matches.length === 1 ? 'piece' : 'pieces'}{matches.length > visible.length && <> · Showing {visible.length}</>}
        </p>
        <div className={styles.resultActions}>
          {(hasFilters || pages > 1) && <button type="button" onClick={copyLink}>Copy link</button>}
          {hasFilters && <button type="button" onClick={() => update(defaultCatalogFilters)}>Clear filters</button>}
        </div>
        {copyResult?.location === location && <p role="status" className={styles.copyResult}>{copyResult.message}</p>}
      </div>
      {visible.length > 0 ? (
        <div className={styles.results}>
          {visible.map((product) => <ProductTile key={product.slug} product={productCard(product)} sizes="(max-width: 639px) 46vw, (max-width: 1023px) 30vw, (max-width: 1392px) 23vw, 307px" />)}
        </div>
      ) : (
        <div className={styles.empty}>
          <h2>No pieces match these filters</h2>
          <p>Try another material, collection or availability setting.</p>
        </div>
      )}
      {visible.length < matches.length && (
        <div className={styles.more}>
          <button type="button" className="shop-button" onClick={() => writeCatalogLocation({ filters, pages: pages + 1 }, 'replaceState')}>Show more pieces <span aria-hidden="true">↓</span></button>
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
