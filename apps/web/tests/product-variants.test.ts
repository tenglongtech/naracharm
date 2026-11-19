import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { StorefrontProduct } from '../src/lib/storefront';
import type { CatalogTransaction } from '../src/lib/product-maintenance';

const fixtureUrl = process.env.CHECKOUT_TEST_DATABASE_URL;

test('merchant variant edits, snapshot and checkout preserve the exact SKU', { skip: !fixtureUrl }, async (context) => {
  assert.equal(new URL(fixtureUrl!).hostname, '127.0.0.1');
  assert.equal(new URL(fixtureUrl!).pathname, '/checkout_fixture');
  assert.equal(fixtureUrl, process.env.DATABASE_URL);
  const { db } = await import('../src/lib/db');
  const { insertCatalogProduct, updateCatalogProduct, editableProduct } = await import('../src/lib/product-maintenance');
  const { reserveCheckout } = await import('../src/lib/checkout-orders');
  const { createCheckoutSession, stripe } = await import('../src/lib/stripe');
  const { CheckoutError } = await import('../src/lib/checkout-request');
  const { GET: liveOffer } = await import('../src/app/api/catalog/offer/route');
  const { saveVariantPhoto } = await import('../src/lib/product-image-write');
  const { products } = await import('@jewelry/db');
  const { eq } = await import('drizzle-orm');
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

  const smallPhoto = 'https://assets.example.com/catalog/cord-small.jpg';
  const largePhoto = 'https://assets.example.com/catalog/cord-large.jpg';
  await sql`insert into variant_images (variant_id, url, sort_order) values (${large.id}, '/unverified-old-image.jpg', 0)`;
  await db.transaction(async (tx: CatalogTransaction) => {
    await tx.select({ id: products.id }).from(products).where(eq(products.id, product.id)).for('update');
    const slim = await saveVariantPhoto(tx, product.id, small.id, smallPhoto);
    const wide = await saveVariantPhoto(tx, product.id, large.id, largePhoto);
    assert.equal(slim.isPrimary && wide.isPrimary, true);
    assert.equal((await saveVariantPhoto(tx, product.id, large.id, largePhoto)).id, wide.id);
  });
  await assert.rejects(db.transaction((tx: CatalogTransaction) => saveVariantPhoto(tx, randomUUID(), large.id, largePhoto)), /此商品的规格/);

  const directory = await mkdtemp(join(tmpdir(), 'nara-variant-snapshot-'));
  context.after(() => rm(directory, { recursive: true, force: true }));
  await promisify(execFile)(process.execPath, ['--import', 'tsx', 'scripts/export-storefront.ts'], {
    env: { ...process.env, STOREFRONT_DATA_DIR: directory }, timeout: 30_000,
  });
  const snapshot: StorefrontProduct[] = JSON.parse(await readFile(join(directory, 'products.json'), 'utf8'));
  const listing = snapshot.find(({ id }) => id === product.id)!;
  assert.equal(listing.variant?.sku, small.sku);
  assert.deepEqual(listing.variant?.photoUrls, [smallPhoto]);
  assert.deepEqual(listing.variants?.find(({ sku }) => sku === large.sku)?.photoUrls, [largePhoto]);
  assert.deepEqual(listing.variants?.map(({ sku, stock, unitPriceCents }) => [sku, stock, unitPriceCents]), [
    [small.sku, 2, 5100], [large.sku, 5, 7300],
  ]);

  const availabilityUrl = 'http://localhost/api/catalog/offer?slug=fixture-variant-cord';
  const catalogUrl = 'http://localhost/api/catalog/offer?catalog=1';
  assert.equal((await liveOffer(new Request(availabilityUrl, { headers: { Origin: 'https://unrelated.example' } }))).status, 403);
  assert.equal((await liveOffer(new Request('http://localhost/api/catalog/offer?slug=../../wrong'))).status, 400);
  assert.equal((await liveOffer(new Request(`${catalogUrl}&slug=fixture-variant-cord`))).status, 400);
  const availability = () => liveOffer(new Request(availabilityUrl, { headers: { Origin: 'https://naracharm.com' } }));
  const offered = await availability();
  assert.equal(offered.headers.get('Cache-Control'), 'no-store');
  assert.equal(offered.headers.get('Access-Control-Allow-Origin'), 'https://naracharm.com');
  const readOffers = (body: { offers: { id: string; sku: string; stock: number; unitPriceCents: number }[] }) => body.offers.sort((a, b) => a.sku.localeCompare(b.sku));
  const productOffers = [
    { id: large.id, sku: large.sku, stock: 5, unitPriceCents: 7300 },
    { id: small.id, sku: small.sku, stock: 2, unitPriceCents: 5100 },
  ];
  assert.deepEqual(readOffers(await offered.json()), productOffers);
  const activeWithoutSku = 'fixture-catalog-without-sku';
  const hiddenDraft = 'fixture-catalog-draft';
  await sql`insert into products (slug,name,status,category,base_price_cents) values
    (${activeWithoutSku}, 'Active listing without SKU', 'active', 'bracelet', 1200),
    (${hiddenDraft}, 'Unpublished draft', 'draft', 'bracelet', 1200)`;
  const readCatalog = async () => {
    const response = await liveOffer(new Request(catalogUrl, { headers: { Origin: 'https://naracharm.com' } }));
    assert.equal(response.status, 200);
    const result: { catalog: { slug: string; offers: Parameters<typeof readOffers>[0]['offers'] }[] } = await response.json();
    return new Map(result.catalog.map((item) => [item.slug, readOffers(item)]));
  };
  const catalog = await readCatalog();
  assert.deepEqual(catalog.get('fixture-variant-cord'), productOffers);
  assert.deepEqual(catalog.get(activeWithoutSku), []);
  assert.equal(catalog.has(hiddenDraft), false);

  const email = 'variant-test@example.test';
  const base = { email, checkoutId: randomUUID() };
  const line = { productSlug: 'fixture-variant-cord', quantity: 2 };
  const returnUrl = 'https://naracharm.com/checkout/success';
  await assert.rejects(reserveCheckout({ ...base, lines: [{ ...line, sku: small.sku, variantId: large.id }] }, returnUrl), /no longer available/);
  assert.equal((await editableProduct(product.id)).variants.every(({ reserved }) => reserved === 0), true);
  const purchase = {
    ...base, checkoutId: randomUUID(), lines: [
      { ...line, sku: small.sku, variantId: small.id },
      { ...line, sku: large.sku, variantId: large.id },
    ],
  };
  await assert.rejects(reserveCheckout({
    ...purchase, expectedTotals: { subtotalCents: 5100, discountCents: 0, shippingCents: 690 },
  }, returnUrl), (error) => {
    assert.ok(error instanceof CheckoutError);
    assert.equal(error.code, 'quote_changed');
    assert.deepEqual(error.quote?.items.map(({ productName }) => productName).sort(), [
      'Fixture Cord Bracelets — Large', 'Fixture Cord Bracelets — Small',
    ]);
    return true;
  });
  const reservation = await reserveCheckout(purchase, returnUrl);
  assert.equal(reservation.order.subtotalCents, 24_800);
  assert.deepEqual(reservation.lines.map(({ sku, quantity }) => [sku, quantity]).sort(), [[large.sku, 2], [small.sku, 2]]);
  assert.deepEqual(readOffers(await (await availability()).json()).map(({ stock }) => stock), [3, 0]);
  const stripeSession = context.mock.method(stripe.checkout.sessions, 'create', async () => ({ id: 'cs_test_variant_fixture' }));
  await createCheckoutSession({
    orderId: reservation.order.id, items: reservation.lines, email, returnUrl,
    shippingCents: 0, discountCents: 0, expiresAt: 0,
  });
  const [stripePayload] = stripeSession.mock.calls[0].arguments as Parameters<typeof stripe.checkout.sessions.create>;
  assert.deepEqual(stripePayload?.line_items?.map(({ price_data }) => price_data?.product_data?.name).sort(), [
    'Fixture Cord Bracelets — Large', 'Fixture Cord Bracelets — Small',
  ]);

  await sql`update products set status = 'archived' where id = ${product.id}`;
  assert.deepEqual(await (await availability()).json(), { slug: 'fixture-variant-cord', offers: [] });
  assert.equal((await readCatalog()).has('fixture-variant-cord'), false);
});
