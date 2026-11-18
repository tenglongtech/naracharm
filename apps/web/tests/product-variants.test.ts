import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { StorefrontProduct } from '../src/lib/storefront';

const fixtureUrl = process.env.CHECKOUT_TEST_DATABASE_URL;

test('merchant variant edits, snapshot and checkout preserve the exact SKU', { skip: !fixtureUrl }, async (context) => {
  assert.equal(new URL(fixtureUrl!).hostname, '127.0.0.1');
  assert.equal(new URL(fixtureUrl!).pathname, '/checkout_fixture');
  assert.equal(fixtureUrl, process.env.DATABASE_URL);
  const { db } = await import('../src/lib/db');
  const { insertCatalogProduct, updateCatalogProduct, editableProduct } = await import('../src/lib/product-maintenance');
  const { reserveCheckout } = await import('../src/lib/checkout-orders');
  const sql = db.$client;
  context.after(() => sql.end());
  const product = await insertCatalogProduct({
    fields: { name: 'Fixture Cord Bracelets', slug: 'fixture-variant-cord', category: 'bracelet', status: 'active', basePriceCents: 5900 },
    initialStock: 2, sku: 'FIXTURE-CORD-SMALL',
  });
  const { variants: [initial] } = await editableProduct(product.id);
  await updateCatalogProduct(product.id, {
    fields: {},
    variantEdits: [{ variantId: initial.id, name: 'Small', priceCents: 5100, expectedName: initial.name, expectedPriceCents: null }],
    newVariants: [{ sku: 'FIXTURE-CORD-LARGE', name: 'Large', priceCents: 7300, quantity: 5 }],
  });
  const { variants } = await editableProduct(product.id);
  const small = variants.find(({ sku }) => sku === 'FIXTURE-CORD-SMALL')!;
  const large = variants.find(({ sku }) => sku === 'FIXTURE-CORD-LARGE')!;
  assert.deepEqual([small.id, small.name, small.priceCents, small.quantity], [initial.id, 'Small', 5100, 2]);
  assert.deepEqual([large.name, large.priceCents, large.quantity], ['Large', 7300, 5]);

  await assert.rejects(updateCatalogProduct(product.id, {
    fields: {},
    stockEdits: [{ variantId: small.id, quantity: 8 }],
    newVariants: [{ sku: large.sku, name: 'Duplicate', priceCents: 7000, quantity: 1 }],
  }), /SKU 已被使用/);
  assert.equal((await editableProduct(product.id)).variants.find(({ id }) => id === small.id)?.quantity, 2);
  await assert.rejects(updateCatalogProduct(product.id, {
    fields: {},
    variantEdits: [{ variantId: small.id, name: 'Stale', priceCents: 5200, expectedName: initial.name, expectedPriceCents: null }],
  }), /规格信息已变化/);

  const directory = await mkdtemp(join(tmpdir(), 'nara-variant-snapshot-'));
  context.after(() => rm(directory, { recursive: true, force: true }));
  await promisify(execFile)(process.execPath, ['--import', 'tsx', 'scripts/export-storefront.ts'], {
    env: { ...process.env, STOREFRONT_DATA_DIR: directory }, timeout: 30_000,
  });
  const snapshot: StorefrontProduct[] = JSON.parse(await readFile(join(directory, 'products.json'), 'utf8'));
  const listing = snapshot.find(({ id }) => id === product.id)!;
  assert.equal(listing.variant?.sku, small.sku);
  assert.deepEqual(listing.variants?.map(({ sku, stock, unitPriceCents }) => [sku, stock, unitPriceCents]), [
    [small.sku, 2, 5100], [large.sku, 5, 7300],
  ]);

  const email = 'variant-test@example.test';
  const base = { email, checkoutId: randomUUID() };
  const line = { productSlug: 'fixture-variant-cord', quantity: 2 };
  const returnUrl = 'https://naracharm.com/checkout/success';
  await assert.rejects(reserveCheckout({ ...base, lines: [{ ...line, sku: small.sku, variantId: large.id }] }, returnUrl), /no longer available/);
  assert.equal((await editableProduct(product.id)).variants.every(({ reserved }) => reserved === 0), true);
  const reservation = await reserveCheckout({
    ...base, checkoutId: randomUUID(), lines: [
      { ...line, sku: small.sku, variantId: small.id },
      { ...line, sku: large.sku, variantId: large.id },
    ],
  }, returnUrl);
  assert.equal(reservation.order.subtotalCents, 24_800);
  assert.deepEqual(reservation.lines.map(({ sku, quantity }) => [sku, quantity]).sort(), [[large.sku, 2], [small.sku, 2]]);
});
