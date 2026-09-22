import { test } from 'node:test';
import assert from 'node:assert/strict';
import products from '../src/data/products.json';
import * as catalog from '../src/lib/catalog';
import * as seo from '../src/lib/seo';
import sitemap from '../src/app/sitemap';
import type { StorefrontProduct } from '../src/lib/storefront';
const items = products as StorefrontProduct[];
test('catalog searches materials and combines category with stock', () => {
  const results = catalog.filterProducts(items, { query: 'silver', category: 'bracelet', inStock: true, sort: 'price-asc' });
  assert.ok(results.length > 0);
  assert.ok(results.every(p => p.category === 'bracelet' && p.stock > 0));
  assert.deepEqual(results.map(p => p.basePriceCents), results.map(p => p.basePriceCents).sort((a,b)=>a-b));
  assert.equal(catalog.filterProducts(items, { query: 'unfindable-zxy', category: 'all', inStock: false, sort: 'featured' }).length, 0);
  assert.equal(items[0].slug, products[0].slug);
});
test('product schema resolves both local and remote images and stock', () => {
  const schema = seo.productSchema({...items[0], images: ['/products/p01.jpg', 'https://images.example.com/photo.jpg'], stock: 0});
  assert.deepEqual(schema.image, ['https://naracharm.com/products/p01.jpg', 'https://images.example.com/photo.jpg']);
  assert.equal(schema.offers.availability, 'https://schema.org/OutOfStock');
  assert.ok(schema.offers.url.startsWith('https://naracharm.com/products/'));
});
test('sitemap contains shopping categories without invented update dates', async () => {
  const entries = await sitemap();
  for (const path of ['/shop', '/collections/bracelets', '/collections/earrings', '/collections/necklaces', '/collections/phone-charms']) {
    assert.ok(entries.some(e => new URL(e.url).pathname === path), path);
  }
  assert.equal(entries.find(e=>new URL(e.url).pathname === '/')?.lastModified, undefined);
  assert.equal(new Set(entries.map(e=>e.url)).size, entries.length);
});

test('sorting never mutates the exported catalog and filters handle empty results', () => {
  const snapshot = JSON.stringify(items);
  const sorted = catalog.filterProducts(items, { query: '  ', category: 'all', inStock: false, sort: 'price-desc' });
  assert.equal(sorted.length, items.length);
  assert.deepEqual(sorted.map(p=>p.basePriceCents), [...items].map(p=>p.basePriceCents).sort((a,b)=>b-a));
  assert.equal(JSON.stringify(items), snapshot);
  assert.equal(catalog.filterProducts([{...items[0],stock:0}], { query:'', category:'all', inStock:true, sort:'featured' }).length,0);
});

import { BLOG_ARTICLES } from '../src/lib/blog-data';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
test('new guides link to real products and other published guides', () => {
  const additions = BLOG_ARTICLES.filter(a=>a.publishedAt === '2026-09-22');
  assert.equal(additions.length, 3);
  for (const article of additions) {
    assert.ok(article.content.length >= 4);
    for (const slug of article.relatedProducts) assert.ok(items.some(p=>p.slug===slug), slug);
    for (const slug of article.relatedArticles ?? []) assert.ok(BLOG_ARTICLES.some(a=>a.slug===slug), slug);
  }
});
test('all catalog images exist and product concepts cannot enter the storefront', async () => {
  for (const p of items) for (const src of p.images) if (src.startsWith('/')) assert.ok(existsSync(resolve('public',src.slice(1))),src);
  const drafts = JSON.parse(readFileSync('../../docs/products/2026-09-22-product-drafts.json','utf8'));
  const entries = await sitemap();
  assert.equal(drafts.length,6);
  for (const draft of drafts) {
    assert.equal(draft.status,'draft');
    assert.equal(draft.price,null);
    assert.equal(draft.stock,null);
    assert.ok(!items.some(p=>p.slug===draft.slug));
    assert.ok(entries.some(e=>e.url.endsWith('/'+draft.slug))); // Published as a non-purchasable design preview.
  }
});

import * as siteUrl from '../src/lib/site-url';
test('production SEO cannot accidentally publish localhost canonical URLs', () => {
  assert.equal(siteUrl.resolveSiteUrl('http://localhost:37000','production'),'https://naracharm.com');
  assert.equal(siteUrl.resolveSiteUrl('http://127.0.0.1:37000','production'),'https://naracharm.com');
  assert.equal(siteUrl.resolveSiteUrl('https://shop.example.com/','production'),'https://shop.example.com');
  assert.equal(siteUrl.resolveSiteUrl('http://localhost:37000','development'),'http://localhost:37000');
});
