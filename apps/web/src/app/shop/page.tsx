import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { ProductCatalog } from '@/components/product-catalog';
import { getActiveProducts } from '@/lib/storefront';
import { CATEGORIES } from '@/lib/categories';
export const metadata: Metadata = { title: 'Shop Handmade Jewelry & Phone Charms', description: 'Find your everyday piece. Explore bracelets, necklaces, earrings and phone charms by material, category and price at Nara Charm.', alternates: { canonical: '/shop' } };
export default async function ShopPage() {
  const products = await getActiveProducts();
  return <><SiteHeader /><main id="main" className="mx-auto max-w-7xl px-5 py-12 md:py-20"><p className="eyebrow">The jewelry edit</p><h1 className="mt-4 font-display text-5xl md:text-7xl">Find a piece of you.</h1><p className="mt-5 max-w-xl leading-relaxed text-muted">A touch of color. A meaningful detail. Something to make the everyday feel a little more yours.</p><nav aria-label="Shop by category" className="my-8 flex flex-wrap gap-3">{CATEGORIES.map(c=><Link key={c.slug} href={`/collections/${c.slug}`} className="rounded-full border border-border px-5 py-3 text-sm hover:border-brand">{c.name} ↗</Link>)}</nav><ProductCatalog products={products} /></main><SiteFooter /></>;
}
