import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getActiveProducts, getAllCollections } from '../src/lib/storefront';
import { COLLECTION_DESIGNS, STUDIO_SERIES } from '../src/lib/studio-designs';
import { searchableProductPhotos } from '../src/lib/product-media';

test('shopping items use existing redesigns and each new studio collection gets an individual lead image', async () => {
  const products = await getActiveProducts();
  for (const product of products.filter((item) => item.availability !== 'preview')) {
    assert.equal(product.images[0], product.primaryImage, product.slug);
    assert.ok(product.primaryImage?.startsWith('/products/redesigned/'), product.slug);
    for (const image of product.images) assert.ok(existsSync(resolve('public', image.slice(1))), image);
  }
  const caravan = products.find(({ slug }) => slug === 'caravan-fusion-necklace');
  assert.equal(caravan?.images.length, 2);
  assert.equal(caravan?.imageKind, 'illustration');
  for (const { slug } of STUDIO_SERIES) {
    const lead = products.find((product) => product.collectionSlug === slug);
    assert.equal(lead?.primaryImage, '/products/studio/' + lead?.slug + '.webp');
    assert.ok(existsSync(resolve('public', lead!.primaryImage!.slice(1))));
    assert.equal(lead?.imageKind, 'illustration');
  }
});

test('every studio design has its own illustration without publishing preview product photos', () => {
  const sources = new Set<string>();
  for (const { slug } of STUDIO_SERIES) {
    const designs = COLLECTION_DESIGNS.filter((product) => product.collectionSlug === slug);
    assert.deepEqual(new Set(designs.map((product) => product.category)), new Set(['bracelet', 'earrings', 'necklace', 'phone-charm']), slug);
    for (const product of designs) {
      assert.equal(product.imageKind, 'illustration');
      const src = '/products/studio/' + product.slug + '.webp';
      assert.equal(product.primaryImage, src);
      assert.deepEqual(product.images, [src]);
      assert.ok(existsSync(resolve('public', src.slice(1))), src);
      assert.equal(sources.has(src), false, src);
      assert.deepEqual(searchableProductPhotos(product), []);
      sources.add(src);
    }
  }
  assert.equal(sources.size, COLLECTION_DESIGNS.length);
});

test('the original six planned prices and preview availability are preserved', async () => {
  const products = await getActiveProducts();
  const concepts = products.filter((product) => product.collectionSlug === 'studio-edit');
  assert.equal(concepts.length, 6);
  for (const product of concepts) {
    assert.equal(product.availability, 'preview');
    assert.equal(product.stock, 0);
    assert.ok(product.basePriceCents >= 2600 && product.basePriceCents <= 11800);
    assert.ok(product.primaryImage, product.slug);
    assert.ok(existsSync(resolve('public', product.primaryImage.slice(1))), product.primaryImage);
  }
  const collections = await getAllCollections();
  assert.equal(collections.find((collection) => collection.slug === 'studio-edit')?.productCount, 6);
});
