'use client';
import { useState } from 'react';
import Link from 'next/link';
import { filterProducts, productCard, type CatalogFilters } from '@/lib/catalog';
import type { StorefrontProduct } from '@/lib/storefront';
import { ProductTile } from './product-tile';
const initial: CatalogFilters = { query: '', category: 'all', inStock: false, sort: 'featured' };
export function ProductCatalog({ products }: { products: StorefrontProduct[] }) {
  const [filters, setFilters] = useState(initial);
  const visible = filterProducts(products, filters);
  return <div>
    <div className="grid gap-4 border-y border-border py-6 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
      <label className="text-xs font-medium">Find your piece<input type="search" value={filters.query} onChange={e=>setFilters({...filters, query:e.target.value})} placeholder="Try silver, turquoise, a bracelet…" className="mt-2 block w-full rounded-md border border-border bg-white/60 p-3 text-sm" /></label>
      <label className="text-xs font-medium">Category<select value={filters.category} onChange={e=>setFilters({...filters,category:e.target.value})} className="mt-2 block w-full rounded-md border border-border bg-white/60 p-3 text-sm"><option value="all">All jewelry</option><option value="bracelet">Bracelets</option><option value="necklace">Necklaces</option><option value="earrings">Earrings</option><option value="phone-charm">Phone charms</option></select></label>
      <label className="text-xs font-medium">Sort by<select value={filters.sort} onChange={e=>setFilters({...filters,sort:e.target.value as CatalogFilters['sort']})} className="mt-2 block w-full rounded-md border border-border bg-white/60 p-3 text-sm"><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-4 py-5 text-sm"><p role="status" aria-live="polite">{visible.length} {visible.length === 1 ? 'piece' : 'pieces'}</p><label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={filters.inStock} onChange={e=>setFilters({...filters,inStock:e.target.checked})} className="accent-brand" /> In stock only</label></div>
    {visible.length ? <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">{visible.map(p=><ProductTile key={p.slug} product={productCard(p)} />)}</div> : <div className="rounded-lg bg-surface p-12 text-center"><h2 className="font-display text-2xl">A little room to explore.</h2><p className="mt-3 text-muted">No pieces match these filters. Try a different material or category.</p><button className="mt-5 min-h-11 text-brand underline" onClick={()=>setFilters(initial)}>Clear all filters</button></div>}
    <p className="mt-12 text-sm text-muted">Looking for a particular fit? Start with our <Link className="underline" href="/size-guide">size guide</Link> or <Link className="underline" href="/contact">ask us about a piece</Link>.</p>
  </div>;
}
