import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COLLECTION_DESIGNS, STUDIO_COLLECTIONS } from '../src/lib/studio-designs';
import { mergeCatalog } from '../src/lib/catalog-merge';
import { storefrontOffer } from '../src/lib/storefront-offer';

const preview = COLLECTION_DESIGNS.find((product) => product.slug === 'paper-moon-pendant')!;
const collection = STUDIO_COLLECTIONS.find((item) => item.slug === preview.collectionSlug)!;

test('a saleable studio design replaces its preview at the same URL and keeps one studio collection', () => {
  const live = {
    ...preview,
    id: '2a0a7d35-90b1-47c2-a590-d8a38037b38d',
    availability: undefined,
    collectionSlug: null,
    collectionName: null,
    images: [],
    primaryImage: null,
    basePriceCents: 6900,
    stock: 4,
    seoTitle: null,
    seoDescription: null,
    description: 'Porcelain pendant with a green ceramic crescent.',
  };
  const result = mergeCatalog([live], [{ ...collection, id: '8e3fbf0e-2eaf-4837-a440-85d1820b110c', kind: undefined }], [preview], [collection], {});
  assert.equal(result.products.length, 1);
  assert.equal(result.collections.length, 1);
  const [listed] = result.products;
  assert.equal(listed.slug, preview.slug);
  assert.equal(listed.id, live.id);
  assert.equal(listed.availability, undefined);
  assert.equal(listed.basePriceCents, 6900);
  assert.equal(listed.collectionSlug, collection.slug);
  assert.equal(listed.primaryImage, preview.primaryImage);
  assert.equal(listed.imageKind, 'illustration');
  assert.equal(listed.seoTitle, null);
  assert.equal(result.collections[0].kind, 'studio');
  assert.equal(result.collections[0].productCount, 1);
});

test('the exported offer uses a stocked SKU and its actual price instead of the product base price', () => {
  const variants = [
    { id: 'old', sku: 'NC-OLD', name: 'First', unitPriceCents: 4900, stock: 0 },
    { id: 'new', sku: 'NC-NEW', name: 'Second', unitPriceCents: 6700, stock: 4 },
  ];
  const offer = storefrontOffer(variants, 5700);
  assert.deepEqual(offer, { variant: variants[1], variants, basePriceCents: 6700, stock: 4 });
  assert.deepEqual(storefrontOffer([variants[1]], 5700), { variant: variants[1], basePriceCents: 6700, stock: 4 });
  assert.deepEqual(storefrontOffer([], 5700), { basePriceCents: 5700, stock: 0 });
});

test('studio promotion creates one draft and protects inventory reserved at checkout', {
  skip: !process.env.CHECKOUT_TEST_DATABASE_URL,
}, async () => {
  const databaseUrl = process.env.CHECKOUT_TEST_DATABASE_URL!;
  assert.equal(process.env.DATABASE_URL, databaseUrl);
  assert.equal(new URL(databaseUrl).pathname, '/checkout_fixture');
  const { db } = await import('../src/lib/db');
  const { editableProduct, insertStudioDraft, updateCatalogProduct } = await import('../src/lib/product-maintenance');
  const sql = db.$client;
  try {
    const [first, second] = await Promise.all([insertStudioDraft(preview.slug), insertStudioDraft(preview.slug)]);
    assert.equal(first.id, second.id);
    const { product, variants: [variant], studioDesign } = await editableProduct(first.id);
    assert.equal(product.slug, preview.slug);
    assert.equal(product.status, 'draft');
    assert.equal(variant.sku, 'NC-PAPER-MOON-PENDANT');
    assert.equal(variant.quantity, 0);
    assert.ok(studioDesign);
    const [registeredSeries] = await sql`select slug from collections where id = ${product.collectionId}`;
    assert.equal(registeredSeries.slug, preview.collectionSlug);

    await assert.rejects(updateCatalogProduct(first.id, { fields: { slug: 'new-url-for-paper-moon' } }), /沿用/);
    await assert.rejects(updateCatalogProduct(first.id, { fields: { status: 'active' } }), /售价/);
    await updateCatalogProduct(first.id, {
      fields: { status: 'active', basePriceCents: 6900, materials: ['Porcelain', 'Cotton'] },
      stockEdits: [{ variantId: variant.id, quantity: 4, expectedQuantity: 0 }],
    });
    await sql`update inventory set reserved = 2 where variant_id = ${variant.id}`;
    await assert.rejects(updateCatalogProduct(first.id, {
      fields: { name: 'A change that must roll back' },
      stockEdits: [{ variantId: variant.id, quantity: 1, expectedQuantity: 4 }],
    }), /预留/);
    await assert.rejects(updateCatalogProduct(first.id, {
      fields: {}, stockEdits: [{ variantId: variant.id, quantity: 5, expectedQuantity: 0 }],
    }), /数量已变化/);
    const listed = await editableProduct(first.id);
    assert.equal(listed.product.status, 'active');
    assert.equal(listed.product.name, preview.name);
    assert.equal(listed.product.basePriceCents, 6900);
    assert.deepEqual(listed.product.materials, ['Porcelain', 'Cotton']);
    assert.equal(listed.variants[0].quantity, 4);
    assert.equal(listed.variants[0].reserved, 2);
  } finally {
    await sql.end();
  }
});
