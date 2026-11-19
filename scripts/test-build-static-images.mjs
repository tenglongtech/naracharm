import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { buildStaticImages } from './build-static-images.mjs';

const sharp = createRequire(new URL('../apps/web/package.json', import.meta.url))('sharp');
const storefront = 'https://naracharm.com';
const photo = '/products/photos/fixture.webp';

async function fixture(context, products) {
  const root = await mkdtemp(join(tmpdir(), 'nara-static-photo-test-'));
  context.after(() => rm(root, { recursive: true, force: true }));
  for (const dir of ['public/editorial', 'public/products/photos', 'src/data']) {
    await mkdir(join(root, dir), { recursive: true });
  }
  await writeFile(join(root, 'src/data/products.json'), JSON.stringify(products));
  return root;
}

const listing = (url, slug = 'actual-ring') => ({ slug, imageKind: 'photo', primaryImage: url, images: [url] });
const pixels = (width, height) => sharp({ create: { width, height, channels: 3, background: '#9b5835' } });

test('a missing confirmed local photo stops packaging and identifies its listings', async (context) => {
  const root = await fixture(context, [listing(photo), listing(storefront + photo, 'second-ring')]);
  await assert.rejects(buildStaticImages(root, sharp, storefront), /fixture\.webp.*actual-ring.*second-ring/);
});

test('packaging checks a confirmed photo even when only a non-default SKU uses it', async (context) => {
  const root = await fixture(context, [{
    slug: 'multi-variant-ring', imageKind: 'illustration', primaryImage: '/products/p01.jpg',
    variants: [{ sku: 'DEFAULT' }, { sku: 'ALTERNATE', photoUrls: [photo] }],
  }]);
  await assert.rejects(buildStaticImages(root, sharp, storefront), /fixture\.webp.*multi-variant-ring/);
});

test('confirmed photo content must match its file extension', async (context) => {
  const root = await fixture(context, [listing(photo)]);
  await pixels(600, 600).jpeg().toFile(join(root, 'public', photo));
  await assert.rejects(buildStaticImages(root, sharp, storefront), /fixture\.webp.*WebP/i);
});

test('small genuine photos emit a Merchant Center warning and remote hosts remain unchecked', async (context) => {
  const root = await fixture(context, [
    listing(photo), listing('https://assets.example.com/product/image.webp', 'remote-listed'),
    { slug: 'studio-preview', availability: 'preview', imageKind: 'illustration', primaryImage: '/products/studio/example.webp' },
  ]);
  await pixels(500, 499).webp().toFile(join(root, 'public', photo));
  const warnings = [];
  const stub = context.mock.method(console, 'warn', (message) => warnings.push(message));
  await buildStaticImages(root, sharp, storefront);
  assert.equal(stub.mock.callCount(), 1);
  assert.match(warnings[0], /fixture\.webp.*500 × 499.*500 × 500/);
});

test('bulk packaging flags one confirmed photo reused across different products', async (context) => {
  const alternate = '/products/photos/alternate.webp';
  const sharedRemote = 'https://assets.example.com/shared.webp';
  const root = await fixture(context, [
    listing(photo, 'first-piece'),
    listing(alternate, 'second-piece'),
    listing(sharedRemote, 'third-piece'),
    listing(sharedRemote, 'fourth-piece'),
  ]);
  const shared = await pixels(600, 600).webp().toBuffer();
  await Promise.all([photo, alternate].map((path) => writeFile(join(root, 'public', path), shared)));
  const warnings = [];
  context.mock.method(console, 'warn', (message) => warnings.push(message));

  await buildStaticImages(root, sharp, storefront);
  assert.equal(warnings.length, 2);
  assert.ok(warnings.some((message) => /first-piece.*second-piece/.test(message)));
  assert.ok(warnings.some((message) => /fourth-piece.*third-piece/.test(message)));
});


test('large editorial covers include closer source sizes for high-density phones', async (context) => {
  const root = await fixture(context, []);
  const asset = '/editorial/cover.webp';
  await pixels(1400, 960).webp().toFile(join(root, 'public', asset));
  await buildStaticImages(root, sharp, storefront);
  const variants = JSON.parse(await readFile(join(root, 'src/data/static-image-variants.json'), 'utf8'))[asset];
  for (const width of [800, 1320]) {
    assert.ok(variants.widths.includes(width));
    const encoded = await sharp(join(root, 'public/image', `${variants.key}-${width}.webp`)).metadata();
    assert.equal(encoded.width, width);
  }
});

test('the portrait share card keeps both ends of the product image in a landscape frame', async (context) => {
  const root = await fixture(context, []);
  const asset = '/products/redesigned/upright.webp';
  await mkdir(join(root, 'public/products/redesigned'));
  await pixels(510, 680).webp().toFile(join(root, 'public', asset));
  await buildStaticImages(root, sharp, storefront);

  const variants = JSON.parse(await readFile(join(root, 'src/data/static-image-variants.json'), 'utf8'));
  const { url, width, height } = variants[asset].share;
  const card = sharp(join(root, 'public', url));
  const metadata = await card.metadata();
  assert.deepEqual([metadata.format, metadata.width, metadata.height], ['jpeg', 1200, 630]);
  assert.deepEqual([width, height], [1200, 630]);
  const { data, info } = await card.raw().toBuffer({ resolveWithObject: true });
  for (const y of [45, 584]) {
    const offset = (y * info.width + 915) * info.channels;
    assert.ok(data[offset] > 130 && data[offset + 1] < 110 && data[offset + 2] < 85, 'product color should reach both ends');
  }
});
