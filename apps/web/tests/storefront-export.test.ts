import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const databaseUrl = process.env.STOREFRONT_EMPTY_TEST_DATABASE_URL;
const placeholderDatabaseUrl = process.env.STOREFRONT_PLACEHOLDER_TEST_DATABASE_URL;
const webDir = fileURLToPath(new URL('..', import.meta.url));

test('an empty catalog cannot overwrite a published storefront snapshot', { skip: !databaseUrl }, async () => {
  const snapshot = await mkdtemp(join(tmpdir(), 'storefront-export-test-'));
  try {
    const files = ['products.json', 'collections.json', 'reviews.json', 'comments.json'];
    const previous = '{"previous":"published snapshot"}';
    await Promise.all(files.map((file) => writeFile(join(snapshot, file), previous)));
    const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/export-storefront.ts'], {
      cwd: webDir,
      env: { ...process.env, DATABASE_URL: databaseUrl, STOREFRONT_DATA_DIR: snapshot },
      encoding: 'utf8',
      timeout: 30_000,
    });
    assert.ifError(result.error);
    assert.equal(result.status, 1, result.stdout);
    assert.match(result.stderr, /no active products/i);
    for (const file of files) assert.equal(await readFile(join(snapshot, file), 'utf8'), previous, file);
  } finally {
    await rm(snapshot, { recursive: true, force: true });
  }
});

test('a public refresh requires a verified photo for new listings and preserves existing listings', {
  skip: !placeholderDatabaseUrl,
}, async () => {
  const snapshot = await mkdtemp(join(tmpdir(), 'storefront-export-test-'));
  try {
    const existing = '[{"slug":"existing-piece"}]';
    await writeFile(join(snapshot, 'products.json'), existing);
    const refresh = () => spawnSync(process.execPath, ['--import', 'tsx', 'scripts/export-storefront.ts'], {
      cwd: webDir,
      env: {
        ...process.env,
        DATABASE_URL: placeholderDatabaseUrl,
        STOREFRONT_DATA_DIR: snapshot,
        STOREFRONT_REQUIRE_PUBLISHED_PHOTOS: 'true',
      },
      encoding: 'utf8',
      timeout: 30_000,
    });
    const result = refresh();
    assert.ifError(result.error);
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, /verified product photo: new-placeholder/);
    assert.equal(await readFile(join(snapshot, 'products.json'), 'utf8'), existing);

    await writeFile(join(snapshot, 'products.json'), '[{"slug":"existing-piece"},{"slug":"new-placeholder"}]');
    const updated = refresh();
    assert.ifError(updated.error);
    assert.equal(updated.status, 0, updated.stdout + updated.stderr);
    const products = JSON.parse(await readFile(join(snapshot, 'products.json'), 'utf8'));
    assert.deepEqual(products.map(({ slug }: { slug: string }) => slug).sort(), [
      'existing-piece', 'new-photographed', 'new-placeholder',
    ]);
  } finally {
    await rm(snapshot, { recursive: true, force: true });
  }
});
