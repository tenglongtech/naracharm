import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { catalogCsv, parseCatalogIntake } from '../src/lib/catalog-intake-csv';
import { checkCatalogPhotoFiles } from '../src/lib/catalog-photo-files';

const fixtureUrl = process.env.CHECKOUT_TEST_DATABASE_URL;
const photoUrl = 'https://catalog-fixture.example.com/pieces/bracelet.webp';

test('catalog CSV round trips quoted text and validates verified photos before publication', () => {
  const file = catalogCsv([{
    action: 'publish', slug: 'fixture-bead-loop', name: 'Bead, loop "one"', stock: '0',
    price_usd: '129.09', category: 'bracelet', materials: 'Porcelain | Cotton',
    description: 'A description, with a comma.\nA new line.', photo_url: photoUrl, photo_verified: 'yes',
  }]);
  const valid = parseCatalogIntake(file);
  assert.deepEqual(valid.issues, []);
  assert.equal(valid.rows[0].name, 'Bead, loop "one"');
  assert.equal(valid.rows[0].description, 'A description, with a comma.\nA new line.');
  assert.equal(valid.rows[0].priceCents, 12_909);
  assert.equal(valid.rows[0].stock, 0);
  assert.deepEqual(valid.rows[0].materials, ['Porcelain', 'Cotton']);

  const invalid = parseCatalogIntake(`action,slug,photo_url,photo_verified\r\nphoto,fixture-bead-loop,${photoUrl},no\r\ndraft,fixture-bead-loop,,\r\n`);
  assert.deepEqual(invalid.issues.map(({ row }) => row), [2, 3]);
  assert.throws(() => parseCatalogIntake('action,slug\ndraft,"incomplete'), /引号没有闭合/);
  assert.match(catalogCsv([{ action: 'photo', slug: 'fixture-bead-loop', name: '=plain text' }]), /"'=plain text"/);
});

test('photo preflight reports every row with a missing file or a directory in place of a photo', async () => {
  const publicDir = await mkdtemp(join(tmpdir(), 'catalog-photos-'));
  try {
    const photoDir = join(publicDir, 'products', 'photos');
    await mkdir(join(photoDir, 'directory.webp'), { recursive: true });
    await writeFile(join(photoDir, 'present.webp'), 'fixture');
    const file = catalogCsv([
      { action: 'photo', slug: 'piece-one', photo_url: '/products/photos/present.webp', photo_verified: 'yes' },
      { action: 'photo', slug: 'piece-two', photo_url: '/products/photos/missing.webp', photo_verified: 'yes' },
      { action: 'photo', slug: 'piece-three', photo_url: photoUrl, photo_verified: 'yes' },
      { action: 'photo', slug: 'piece-four', photo_url: '/products/photos/directory.webp', photo_verified: 'yes' },
      { action: 'photo', slug: 'piece-five', photo_url: '/products/photos/missing.webp', photo_verified: 'yes' },
    ]);
    const { rows, issues } = parseCatalogIntake(file);
    assert.deepEqual(issues, []);
    assert.deepEqual((await checkCatalogPhotoFiles(rows, publicDir)).map(({ row }) => row), [3, 5, 6]);
  } finally {
    await rm(publicDir, { recursive: true, force: true });
  }
});

test('offline intake stages a photo update and a promoted design while keeping the original snapshot', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'catalog-snapshot-test-'));
  const source = new URL('../src/data/products.json', import.meta.url);
  const previous = await readFile(source, 'utf8');
  const listed = JSON.parse(previous);
  const primary = listed[0];
  const publish = {
    action: 'publish', slug: 'quiet-tide-cord-bracelet', price_usd: '39.50', stock: '4',
    materials: 'Cotton', description: 'Braided cotton bracelet.', photo_url: photoUrl, photo_verified: 'yes',
  } as const;
  const input = join(directory, 'intake.csv');
  const candidate = join(directory, 'candidate.json');
  const run = () => spawnSync(process.execPath, ['--import', 'tsx', 'scripts/catalog-offline.ts', 'snapshot', input, candidate], {
    cwd: new URL('..', import.meta.url), encoding: 'utf8', timeout: 30_000,
  });
  try {
    await writeFile(input, catalogCsv([
      { action: 'photo', slug: primary.slug, photo_url: photoUrl, photo_verified: 'yes' },
      publish,
      { action: 'draft', slug: 'draft-only-intake' },
    ]));
    const added = run();
    assert.ifError(added.error);
    assert.equal(added.status, 0, added.stdout + added.stderr);
    const snapshot = await readFile(candidate, 'utf8');
    const listings = JSON.parse(snapshot);
    assert.equal(listings.length, listed.length + 1);
    assert.equal(listings[0].id, primary.id);
    assert.deepEqual(listings[0].variant, primary.variant);
    assert.deepEqual(listings[0].images, [photoUrl]);
    assert.equal(listings[0].imageKind, 'photo');
    const promoted = listings.find(({ slug }: { slug: string }) => slug === publish.slug);
    assert.equal(promoted.name, 'Quiet Tide Cord Bracelet');
    assert.equal(promoted.collectionSlug, 'studio-edit');
    assert.equal(promoted.variant.sku, 'NC-QUIET-TIDE-CORD-BRACELET');
    assert.equal(promoted.variant.stock, 4);
    assert.equal(promoted.basePriceCents, 3950);
    assert.equal(promoted.availability, undefined);
    assert.equal(await readFile(source, 'utf8'), previous);
    assert.equal(run().status, 1, 'a second run should preserve an existing candidate file');
    assert.equal(await readFile(candidate, 'utf8'), snapshot);

    await rm(candidate);
    await writeFile(input, catalogCsv([{ ...publish, sku: primary.variant.sku }]));
    const conflict = run();
    assert.equal(conflict.status, 1, conflict.stdout + conflict.stderr);
    assert.match(conflict.stderr, /第 2 行.*SKU/);
    await assert.rejects(readFile(candidate), { code: 'ENOENT' });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('batch catalog writes preserve draft SKUs, reject stale previews and roll back on a database error', { skip: !fixtureUrl }, async (context) => {
  assert.equal(new URL(fixtureUrl!).pathname, '/checkout_fixture');
  assert.equal(process.env.DATABASE_URL, fixtureUrl);
  const { db } = await import('../src/lib/db');
  const { applyCatalogIntake, previewCatalogIntake } = await import('../src/lib/catalog-intake');
  const { editableProduct, insertStudioDraft, updateCatalogProduct } = await import('../src/lib/product-maintenance');
  const sql = db.$client;
  context.after(async () => sql.end());

  const design = 'ink-window-drops';
  const draft = await insertStudioDraft(design);
  const before = await editableProduct(draft.id);
  const intake = catalogCsv([{
    action: 'publish', slug: design, stock: '8', price_usd: '72.50', materials: 'Silver',
    description: 'Fixture earrings with dark silver openwork.', photo_url: photoUrl, photo_verified: 'yes',
  }, { action: 'draft', slug: 'batch-new-draft', name: 'Batch named draft', category: 'bracelet' }]);
  const preview = await previewCatalogIntake(intake);
  assert.deepEqual(preview.issues, []);
  assert.equal(preview.rows[0].sku, before.variants[0].sku);
  assert.equal(preview.rows[0].photoUrl, photoUrl);
  assert.equal(preview.rows[1].photoUrl, undefined);
  assert.ok(preview.revision);

  await updateCatalogProduct(draft.id, { fields: { subtitle: 'Changed after preview' } });
  await assert.rejects(applyCatalogIntake(intake, preview.revision!), /发生变化/);
  assert.equal((await sql`select id from products where slug='batch-new-draft'`).length, 0);
  const refreshed = await previewCatalogIntake(intake);
  assert.deepEqual(await applyCatalogIntake(intake, refreshed.revision!), { drafts: 1, published: 1, photos: 1 });
  const after = await editableProduct(draft.id);
  assert.equal(after.product.status, 'active');
  assert.equal(after.product.basePriceCents, 7250);
  assert.equal(after.variants[0].id, before.variants[0].id);
  assert.equal(after.variants[0].quantity, 8);
  const [image] = await sql`select url, is_primary, is_product_photo from product_images where product_id=${draft.id}`;
  assert.deepEqual({ ...image }, { url: photoUrl, is_primary: true, is_product_photo: true });
  await assert.rejects(applyCatalogIntake(intake, refreshed.revision!), /重新预检/);

  const photoList = catalogCsv([{ action: 'photo', slug: design, photo_url: 'https://catalog-fixture.example.com/new.webp', photo_verified: 'yes' }]);
  const photoChange = await previewCatalogIntake(photoList);
  assert.deepEqual(await applyCatalogIntake(photoList, photoChange.revision!), { drafts: 0, published: 0, photos: 1 });
  const [changed] = await sql`select url from product_images where product_id=${draft.id} and is_primary`;
  assert.equal(changed.url, 'https://catalog-fixture.example.com/new.webp');
  const price = await editableProduct(draft.id);
  assert.equal(price.product.basePriceCents, 7250);
  assert.equal(price.variants[0].quantity, 8);

  await sql`create function fixture_reject_catalog_row() returns trigger language plpgsql as $$
    begin
      if new.slug = 'batch-z-rejected' then raise exception 'fixture write failed'; end if;
      return new;
    end
  $$`;
  await sql`create trigger fixture_catalog_error before insert on products for each row execute function fixture_reject_catalog_row()`;
  try {
    const rollback = catalogCsv([
      { action: 'draft', slug: 'batch-a-rolls-back', name: 'Early row', category: 'bracelet' },
      { action: 'draft', slug: 'batch-z-rejected', name: 'Late row', category: 'bracelet' },
    ]);
    const check = await previewCatalogIntake(rollback);
    assert.ok(check.revision);
    await assert.rejects(applyCatalogIntake(rollback, check.revision!));
    assert.equal((await sql`select id from products where slug in ('batch-a-rolls-back','batch-z-rejected')`).length, 0);
    assert.equal((await sql`select id from product_variants where sku='NC-BATCH-A-ROLLS-BACK'`).length, 0);
  } finally {
    await sql`drop trigger fixture_catalog_error on products`;
    await sql`drop function fixture_reject_catalog_row()`;
  }
});
