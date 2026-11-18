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
