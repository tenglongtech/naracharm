import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/data/products.json';
import { selectProductPhotos, withProductMedia } from '../src/lib/product-media';
import { productSchema } from '../src/lib/seo';
import { renderGoogleFeed } from '../src/lib/merchant-feed';
import type { StorefrontProduct } from '../src/lib/storefront';

const base = data[0] as StorefrontProduct;
const illustration = { primaryImage: '/products/redesigned/reference.webp', images: ['/products/redesigned/reference.webp'], imageKind: 'illustration' as const };
const firstPhoto = 'https://assets.example.com/catalog/exact-piece.jpg';
const secondPhoto = 'https://assets.example.com/catalog/exact-piece-side.jpg';

test('storefront chooses the primary confirmed photo and leaves legacy imagery out of its gallery', () => {
  const media = selectProductPhotos([
    { url: '/products/p01.jpg', isProductPhoto: false, isPrimary: true, sortOrder: 0 },
    { url: secondPhoto, isProductPhoto: true, isPrimary: false, sortOrder: 1 },
    { url: firstPhoto, isProductPhoto: true, isPrimary: true, sortOrder: 2 },
    { url: firstPhoto, isProductPhoto: true, isPrimary: false, sortOrder: 3 },
    { url: 'http://example.com/catalog/insecure.jpg', isProductPhoto: true, isPrimary: false, sortOrder: 4 },
  ]);
  assert.deepEqual(media, { primaryImage: firstPhoto, images: [firstPhoto, secondPhoto], imageKind: 'photo' });
  assert.deepEqual(withProductMedia({ ...base, ...media }, illustration).images, [firstPhoto, secondPhoto]);
});

test('structured data and the Shopping Feed use actual product photos and the storefront offer', () => {
  const verified = {
    ...base, slug: 'actual', description: 'Braided cord & silver', descriptionSource: 'trained_algorithmic_media' as const,
    ...selectProductPhotos([{ url: firstPhoto, isProductPhoto: true, isPrimary: true, sortOrder: 0 }]),
  };
  const sample = { ...base, slug: 'illustrated', ...illustration };
  const preview = { ...verified, slug: 'preview', availability: 'preview' as const };
  const unknown = { ...base, slug: 'unknown' };
  const xml = renderGoogleFeed([verified, sample, preview, unknown], 'https://naracharm.com');
  assert.equal((xml.match(/<item>/g) ?? []).length, 1);
  assert.match(xml, /<g:link>https:\/\/naracharm\.com\/products\/actual<\/g:link>/);
  assert.ok(xml.includes(`<g:image_link>${firstPhoto}</g:image_link>`));
  assert.match(xml, /<g:structured_description>.*<g:content>Braided cord &amp; silver<\/g:content>/);
  assert.deepEqual(productSchema(verified).image, [firstPhoto]);
  assert.equal(productSchema(sample).image, undefined);
  assert.deepEqual(withProductMedia(base, illustration).images, illustration.images);
});

test('a product group exposes both its available and sold-out SKUs with separate offers and stable Feed IDs', () => {
  const slim = { id: 'a122b109-fbd5-41ed-8423-0b1a0d535947', sku: 'SILVER-SLIM', name: 'Slim', unitPriceCents: 2800, stock: 0 };
  const wide = { id: 'bbdeb621-bc2a-4bd2-93bd-93dc4f0f721a', sku: 'SILVER-WIDE+ /01', name: 'Wide & polished', unitPriceCents: 4200, stock: 3 };
  const group = {
    ...base, name: 'Silver band', slug: 'silver-band', variant: wide, variants: [slim, wide], basePriceCents: 4200, stock: 3,
    ...selectProductPhotos([{ url: firstPhoto, isProductPhoto: true, isPrimary: true, sortOrder: 0 }]),
  };
  const schema = productSchema(group);
  assert.equal(schema['@type'], 'ProductGroup');
  assert.equal(schema.productGroupID, group.id);
  assert.equal(schema.url, 'https://naracharm.com/products/silver-band');
  assert.deepEqual(schema.hasVariant?.map(({ name, sku, offers }) => [name, sku, offers.price, offers.availability, offers.url]), [
    ['Silver band – Slim', slim.sku, '28.00', 'https://schema.org/OutOfStock', 'https://naracharm.com/products/silver-band?sku=SILVER-SLIM'],
    ['Silver band – Wide & polished', wide.sku, '42.00', 'https://schema.org/InStock', 'https://naracharm.com/products/silver-band?sku=SILVER-WIDE%2B+%2F01'],
  ]);
  const xml = renderGoogleFeed([group, { ...group, ...illustration }], 'https://naracharm.com');
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  assert.equal(items.length, 2);
  assert.ok(items[0].includes(`<g:id>${slim.id}</g:id>`));
  assert.ok(items[0].includes('<g:availability>out_of_stock</g:availability>'));
  assert.ok(items[0].includes('<g:price>28.00 USD</g:price>'));
  assert.ok(items[1].includes(`<g:id>${wide.id}</g:id>`));
  assert.ok(items[1].includes(`<g:item_group_id>${group.id}</g:item_group_id>`));
  assert.ok(items[1].includes('<g:value>Wide &amp; polished</g:value>'));
  assert.ok(items[1].includes('<g:link>https://naracharm.com/products/silver-band?sku=SILVER-WIDE%2B+%2F01</g:link>'));
  assert.ok(renderGoogleFeed([{ ...group, variants: undefined }], 'https://naracharm.com').includes(`<g:id>${wide.id}</g:id>`));
});

test('photos assigned to an individual SKU never appear on a sibling variant or its shopping listing', () => {
  const amber = { id: 'amber', sku: 'AMBER', name: 'Amber', unitPriceCents: 3200, stock: 4, photoUrls: [firstPhoto] };
  const green = { id: 'green', sku: 'GREEN', name: 'Green', unitPriceCents: 3500, stock: 4, photoUrls: [secondPhoto] };
  const violet = { id: 'violet', sku: 'VIOLET', name: 'Violet', unitPriceCents: 3900, stock: 4 };
  const product = { ...base, ...illustration, variant: amber, variants: [amber, green, violet] };
  const schema = productSchema(product);
  assert.equal(schema['@type'], 'ProductGroup');
  assert.deepEqual(schema.image, [firstPhoto, secondPhoto]);
  assert.deepEqual(schema.hasVariant.map(({ sku, image }) => [sku, image]), [
    ['AMBER', [firstPhoto]], ['GREEN', [secondPhoto]], ['VIOLET', undefined],
  ]);

  const xml = renderGoogleFeed([product], 'https://naracharm.com');
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  assert.equal(items.length, 2);
  assert.match(items[0], /sku=AMBER/);
  assert.ok(items[0].includes(`<g:image_link>${firstPhoto}</g:image_link>`));
  assert.match(items[1], /sku=GREEN/);
  assert.ok(items[1].includes(`<g:image_link>${secondPhoto}</g:image_link>`));
  assert.doesNotMatch(xml, /sku=VIOLET|\/products\/redesigned/);
});
