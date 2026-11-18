import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
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
