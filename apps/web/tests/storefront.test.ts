import { test } from 'node:test';
import assert from 'node:assert/strict';
import products from '../src/data/products.json';
import * as catalog from '../src/lib/catalog';
import * as seo from '../src/lib/seo';
import sitemap from '../src/app/sitemap';
import robots from '../src/app/robots';
import { giftSelections } from '../src/lib/gift-selections';
import { applyLiveOffer } from '../src/lib/storefront-offer';
import { inquiryPath } from '../src/lib/product-inquiry';
import type { StorefrontProduct } from '../src/lib/storefront';
const items = products as StorefrontProduct[];

test('catalog listings keep descriptive product markup and open an inquiry for the selected SKU', () => {
  const product = items[0];
  const catalog = seo.catalogProductSchema(product);
  assert.equal(catalog['@type'], 'Product');
  assert.equal(catalog.name, product.name);
  assert.equal('offers' in catalog, false);
  const path = new URL(inquiryPath('Jade & silver', 'SKU+2', 'Wide'), 'https://naracharm.com');
  assert.equal(path.pathname, '/contact');
  assert.equal(path.searchParams.get('piece'), 'Jade & silver');
  assert.match(path.searchParams.get('message') ?? '', /Wide.*SKU\+2/);
});

test('photo inquiries ask for the selected piece and variant without implying stock', () => {
  const path = new URL(inquiryPath('Lotus & cord', 'LOTUS+LONG', 'Long', { type: 'photo' }), 'https://naracharm.com');
  assert.equal(path.pathname, '/contact');
  assert.equal(path.searchParams.get('topic'), 'product');
  assert.equal(path.searchParams.get('piece'), 'Lotus & cord');
  assert.equal(path.searchParams.get('message'), 'Could you share a photo of the actual piece for Long, SKU LOTUS+LONG?');
});

test('measurement inquiries identify the selected variant and distinguish fit from availability', () => {
  const path = new URL(inquiryPath('Lotus & cord', 'LOTUS+LONG', 'Long', {
    type: 'measurements', measurements: 'the total wearable cord length',
  }), 'https://naracharm.com');
  assert.equal(path.pathname, '/contact');
  assert.equal(path.searchParams.get('topic'), 'product');
  assert.equal(path.searchParams.get('piece'), 'Lotus & cord');
  assert.equal(path.searchParams.get('message'), 'Could you confirm the total wearable cord length for Long, SKU LOTUS+LONG?');

  const standard = new URL(inquiryPath('Lotus & cord', 'LOTUS-STD', 'Default', {
    type: 'measurements', measurements: 'the pendant width',
  }), path);
  assert.equal(standard.searchParams.get('message'), 'Could you confirm the pendant width for SKU LOTUS-STD?');
});

test('a current offer reprices the exact SKU, regains stock and leaves sibling variants isolated', () => {
  const slim = { id: 'slim', sku: 'SLIM', name: 'Slim', stock: 0, unitPriceCents: 3200 };
  const wide = { id: 'wide', sku: 'WIDE', name: 'Wide', stock: 2, unitPriceCents: 4200 };
  const live = new Map([[slim.id, { id: slim.id, sku: slim.sku, unitPriceCents: 3500, stock: 3 }]]);
  assert.equal(applyLiveOffer(slim, null), slim);
  assert.deepEqual(applyLiveOffer(slim, live), { ...slim, unitPriceCents: 3500, stock: 3 });
  assert.deepEqual(applyLiveOffer(wide, live), { ...wide, stock: 0 });
  assert.equal(applyLiveOffer(slim, new Map([[slim.id, { ...wide, id: slim.id }]])).stock, 0);
});

test('gift picks follow current USD prices and exclude sold-out and preview pieces', () => {
  const piece = items[0];
  const products = [
    { ...piece, slug: 'last-under-40', basePriceCents: 3_999 },
    { ...piece, slug: 'exactly-40', basePriceCents: 4_000 },
    { ...piece, slug: 'last-under-80', basePriceCents: 7_999 },
    { ...piece, slug: 'exactly-80', basePriceCents: 8_000 },
    { ...piece, slug: 'sold-out', basePriceCents: 5_000, stock: 0 },
    { ...piece, slug: 'preview', basePriceCents: 5_500, availability: 'preview' as const },
    { ...piece, slug: 'missing-price', basePriceCents: 0 },
  ];
  assert.deepEqual(giftSelections(products).map(({ id, picks }) => [id, picks.map(({ slug }) => slug)]), [
    ['under-40', ['last-under-40']],
    ['40-to-80', ['exactly-40', 'last-under-80']],
    ['80-and-up', ['exactly-80']],
  ]);
  assert.deepEqual(giftSelections(products.slice(-3)), []);
  assert.deepEqual(giftSelections(products.slice(-3), false).flatMap(({ picks }) => picks.map(({ slug }) => slug)), ['sold-out']);
});

test('search crawlers can read noindex on public utility pages', () => {
  const config = robots().rules;
  const searchRules = (Array.isArray(config) ? config : [config]).find(({ userAgent }) => userAgent === '*');
  assert.ok(searchRules);
  const denied = [searchRules.disallow ?? []].flat();
  for (const route of ['/account/orders', '/cart', '/checkout/success', '/order/demo', '/login', '/register', '/forgot-password', '/search']) {
    assert.equal(denied.some((prefix) => route.startsWith(prefix)), false, route);
  }
  assert.ok(denied.includes('/admin'));
  assert.ok(denied.includes('/api'));
});

test('stocked catalog pages use the same exported SKU, quantity and price as their cart offer', () => {
  const seen = new Set<string>();
  for (const product of items.filter(({ stock }) => stock > 0)) {
    const variant = product.variant;
    assert.ok(variant && variant.sku, product.slug);
    assert.notEqual(variant.id, product.id, product.slug);
    assert.equal(seen.has(variant.sku), false, product.slug);
    seen.add(variant.sku);
    assert.equal(variant.unitPriceCents, product.basePriceCents, product.slug);
    assert.equal(variant.stock, product.stock, product.slug);
    const schema = seo.productSchema(product);
    const selected = schema['@type'] === 'ProductGroup'
      ? schema.hasVariant.find(({ sku }) => sku === variant.sku)
      : schema;
    assert.equal(selected?.sku, variant.sku, product.slug);
  }
  assert.ok(seen.has('CAR-FUSE-DEFAULT'));
});
test('catalog searches materials and combines category with stock', () => {
  const results = catalog.filterProducts(items, { query: 'silver', category: 'bracelet', inStock: true, sort: 'price-asc' });
  assert.ok(results.length > 0);
  assert.ok(results.every(p => p.category === 'bracelet' && p.stock > 0));
  assert.deepEqual(results.map(p => p.basePriceCents), results.map(p => p.basePriceCents).sort((a,b)=>a-b));
  assert.equal(catalog.filterProducts(items, { query: 'unfindable-zxy', category: 'all', inStock: false, sort: 'featured' }).length, 0);
  assert.equal(items[0].slug, products[0].slug);
});

test('material filters use catalog material fields and combine with other filters', () => {
  const options = { query: '', category: 'all', inStock: false, sort: 'featured' as const };
  const turquoise = catalog.filterProducts(items, { ...options, material: 'turquoise' });
  assert.deepEqual(turquoise.map(({ slug }) => slug).sort(), [
    'caravan-fusion-necklace', 'tibetan-amulet-925-bracelet', 'turquoise-sky-bracelet',
  ]);
  const silver = catalog.filterProducts(items, { ...options, material: 'sterling-silver', category: 'earrings' });
  assert.deepEqual(silver.map(({ slug }) => slug).sort(), ['amethyst-earrings-silver', 'miao-filigree-drop-earrings']);
  const preview = { ...items[0], availability: 'preview' as const };
  assert.deepEqual(catalog.filterProducts([preview], { ...options, material: 'turquoise' }), []);
  const imitation = { ...items[0], materials: ['Imitation turquoise beads'] };
  assert.deepEqual(catalog.filterProducts([imitation], { ...options, material: 'turquoise' }), []);
});

test('catalog-only browsing keeps listed pieces independent of inventory and excludes studio previews', () => {
  const listed = { ...items[0], stock: 0 };
  const preview = { ...listed, slug: 'unreleased-design', availability: 'preview' as const };
  const filters = { query: '', category: 'all', inStock: false, catalogOnly: true, sort: 'featured' as const };
  assert.deepEqual(catalog.filterProducts([preview, listed], filters), [listed]);
});
test('catalog understands plural category labels, diacritics and exact catalog SKUs', () => {
  const entries = items.map(catalog.catalogEntry);
  const search = (query: string) => catalog.filterProducts(entries, { query, category: 'all', inStock: true, sort: 'featured' });
  assert.ok(search('silver bracelets').some(({ slug }) => slug === 'tibetan-amulet-925-bracelet'));
  assert.ok(search('ámethyst earrings').some(({ slug }) => slug === 'amethyst-earrings-silver'));
  assert.deepEqual(search('CAR-FUSE-DEFAULT').map(({ slug }) => slug), ['caravan-fusion-necklace']);
});
test('exact SKU searches select the correct variant and honor its own stock', () => {
  const variant = { id: 'wide-variant', sku: 'FUSION-WIDE+2', name: 'Wide', stock: 0, unitPriceCents: 4300 };
  assert.ok(items[0].variant);
  const entry = catalog.catalogEntry({ ...items[0], variants: [items[0].variant, variant] });
  const filters = { query: 'fusion-wide+2', category: 'all', inStock: false, sort: 'featured' as const };
  assert.deepEqual(catalog.filterProducts([entry], filters), [entry]);
  assert.equal(catalog.filterProducts([entry], { ...filters, inStock: true }).length, 0);
  assert.equal(catalog.productCardForSearch(entry, filters.query).href, `/products/${entry.slug}?sku=FUSION-WIDE%2B2`);
  assert.equal(catalog.productCardForSearch(entry, filters.query).price, '$43.00');
  assert.equal(catalog.productCardForSearch(entry, filters.query).tag, 'Sold out');
});
test('product schema resolves both local and remote images and stock', () => {
  const photo = '/products/photos/bracelet/main.jpg';
  const schema = seo.productSchema({ ...items[0], variants: undefined, primaryImage: photo, images: [photo, 'https://images.example.com/photo.jpg'], imageKind: 'photo', stock: 0 });
  assert.equal(schema['@type'], 'Product');
  assert.deepEqual(schema.image, ['https://naracharm.com/products/photos/bracelet/main.jpg', 'https://images.example.com/photo.jpg']);
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
test('all catalog images exist and studio concepts stay out of the sitemap', async () => {
  for (const p of items) for (const src of p.images) if (src.startsWith('/')) assert.ok(existsSync(resolve('public',src.slice(1))),src);
  const drafts = JSON.parse(readFileSync('../../docs/products/2026-09-22-product-drafts.json','utf8'));
  const entries = await sitemap();
  assert.equal(drafts.length,6);
  for (const draft of drafts) {
    assert.equal(draft.status,'draft');
    assert.equal(draft.price,null);
    assert.equal(draft.stock,null);
    assert.ok(!items.some(p=>p.slug===draft.slug));
    assert.ok(!entries.some(e=>e.url.endsWith('/'+draft.slug)));
  }
});

import * as siteUrl from '../src/lib/site-url';
test('production SEO cannot accidentally publish localhost canonical URLs', () => {
  assert.equal(siteUrl.resolveSiteUrl('http://localhost:37000','production'),'https://naracharm.com');
  assert.equal(siteUrl.resolveSiteUrl('http://127.0.0.1:37000','production'),'https://naracharm.com');
  assert.equal(siteUrl.resolveSiteUrl('https://shop.example.com/','production'),'https://shop.example.com');
  assert.equal(siteUrl.resolveSiteUrl('http://localhost:37000','development'),'http://localhost:37000');
});
