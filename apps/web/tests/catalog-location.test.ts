import assert from 'node:assert/strict';
import { test } from 'node:test';
import { catalogFragment, parseCatalogLocation } from '../src/lib/catalog-location';

const collections = new Set(['crystal', 'jade-and-paper']);

test('catalog filters and expanded results round-trip in a shareable fragment', () => {
  const original = {
    filters: { query: 'silver & 石', category: 'necklace', collection: 'jade-and-paper', inStock: false, previewsOnly: true, sort: 'price-desc' as const },
    pages: 3,
  };
  const hash = catalogFragment(original);
  assert.match(hash, /^#catalog\?/);
  assert.deepEqual(parseCatalogLocation(`?utm_source=sample${hash}`, collections, 5), original);
});

test('catalog uses legacy search queries, rejects unknown filter values and bounds the number of expanded pages', () => {
  const defaults = parseCatalogLocation('', collections, 3);
  assert.equal(catalogFragment(defaults), '');
  assert.equal(parseCatalogLocation('?q=rose+quartz#main', collections, 3).filters.query, 'rose quartz');
  assert.equal(parseCatalogLocation('?q=rose+quartz#catalog?category=bracelet', collections, 3).filters.query, '');
  assert.deepEqual(parseCatalogLocation('#catalog?category=unknown&collection=deleted&availability=pending&sort=random&page=99', collections, 3), { ...defaults, pages: 3 });
  assert.equal(parseCatalogLocation('#catalog?page=-2', collections, 3).pages, 1);
});
