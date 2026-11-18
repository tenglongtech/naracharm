import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getActiveProducts, getAllCollections } from '../src/lib/storefront';
import { BLOG_ARTICLES, getArticleBySlug, getRelatedArticles, isPublishedGuide } from '../src/lib/blog-data';
import { JOURNAL_TOPICS } from '../src/lib/journal-topics';
import { JOURNAL_MATERIAL_REVISIONS } from '../src/lib/journal-material-revisions';
import { filterProducts } from '../src/lib/catalog';
import { getProductCopy } from '../src/lib/product-copy';
import { CATEGORIES } from '../src/lib/categories';
import { CATEGORY_EDITORIAL } from '../src/lib/category-editorial';
import sitemap from '../src/app/sitemap';

test('the expanded catalog has unique designs with accurate collection counts', async () => {
  const products = await getActiveProducts();
  const collections = await getAllCollections();
  assert.ok(products.length > 100);
  assert.ok(collections.length >= 17);
  assert.equal(new Set(products.map((product) => product.slug)).size, products.length);
  assert.equal(new Set(products.map((product) => product.description)).size, products.length);
  for (const collection of collections) {
    assert.equal(collection.productCount, products.filter((product) => product.collectionSlug === collection.slug).length);
  }
  assert.ok(products.filter((product) => product.availability === 'preview').every((product) => product.stock === 0));
});

test('shoppers can find a studio design by collection and filter out concepts', async () => {
  const products = await getActiveProducts();
  const filters = { query: 'ink silver', category: 'all', collection: 'ink-silver', inStock: false, sort: 'featured' as const };
  const found = filterProducts(products, filters);
  assert.equal(found.length, 10);
  assert.ok(found.every((product) => product.collectionSlug === 'ink-silver'));
  assert.equal(filterProducts(products, { ...filters, inStock: true }).length, 0);
});

test('article topics and the studio index are crawlable while concepts stay out of the product sitemap', async () => {
  const products = await getActiveProducts();
  const urls = new Set((await sitemap()).map((entry) => new URL(entry.url).pathname));
  assert.ok(BLOG_ARTICLES.length > 100);
  assert.ok(BLOG_ARTICLES.filter(isPublishedGuide).length > 100);
  assert.equal(new Set(BLOG_ARTICLES.map((article) => article.slug)).size, BLOG_ARTICLES.length);
  assert.ok(urls.has('/blog/topic/care'));
  assert.ok(urls.has('/studio'));
  for (const product of products) {
    assert.equal(urls.has('/products/' + product.slug), product.availability !== 'preview');
  }
  for (const article of BLOG_ARTICLES) {
    assert.equal(urls.has('/blog/' + article.slug), isPublishedGuide(article));
  }
  assert.equal(getRelatedArticles('how-to-layer-necklaces-and-bracelets', 1)[0]?.slug, 'choose-a-meaningful-jewelry-gift');
});

test('merchant edits take precedence after the editorial snapshot update', () => {
  const slug = 'han-jade-lotus-pendant';
  assert.match(getProductCopy({ slug })?.seoTitle ?? '', /Jade-Tone/);
  assert.equal(getProductCopy({ slug, updatedAt: '2026-11-20T00:00:00.000Z' }), undefined);
});

test('legacy listings all have piece-specific care while merchant care notes take precedence', async () => {
  const catalog = await getActiveProducts();
  const shop = catalog.filter((product) => product.availability !== 'preview');
  assert.ok(shop.every(({ careNotes }) => careNotes?.trim()));
  assert.equal(new Set(shop.map(({ careNotes }) => careNotes)).size, shop.length);
  assert.match(shop.find(({ slug }) => slug === 'tai-silk-cord-phone-charm')?.careNotes ?? '', /attachment loop/);
  assert.match(shop.find(({ slug }) => slug === 'howlite-turquoise-bracelet')?.careNotes ?? '', /dyed howlite/);

  const slug = 'tai-silk-cord-phone-charm';
  const careNotes = 'Use the instructions inside the maker’s repair card.';
  const historicalCopy = getProductCopy({ slug, careNotes, updatedAt: '2026-08-01' });
  assert.ok(historicalCopy);
  assert.equal('careNotes' in historicalCopy, false);
  assert.equal(getProductCopy({ slug, updatedAt: '2026-11-20T00:00:00.000Z' }), undefined);
});

test('category landing pages have distinct artwork and guides with canonical published URLs', async () => {
  const entries = new Map((await sitemap()).map((entry) => [new URL(entry.url).pathname, entry]));
  const covers = new Set<string>();
  for (const { slug } of CATEGORIES) {
    const { image, guides } = CATEGORY_EDITORIAL[slug];
    covers.add(image.src);
    const category = entries.get('/collections/' + slug);
    assert.ok(category, slug);
    assert.deepEqual(category.images, [new URL(image.src, category.url).href]);
    assert.equal(new Set(guides.map((guide) => guide.slug)).size, 3, slug);
    for (const guide of guides) assert.ok(entries.has('/blog/' + guide.slug), guide.slug);
  }
  assert.equal(covers.size, CATEGORIES.length);
});

test('revised stone guides keep their canonical paths and connect to published guides and available catalog entries', async () => {
  const urls = new Map((await sitemap()).map((entry) => [new URL(entry.url).pathname, entry]));
  const catalog = new Map((await getActiveProducts()).map((product) => [product.slug, product]));
  const amethyst = getArticleBySlug('amethyst-meaning-healing-properties');
  assert.equal(amethyst?.title, 'Amethyst Jewelry Guide to Color, Cut and Care');
  assert.equal(urls.get('/blog/amethyst-meaning-healing-properties')?.lastModified, '2026-11-19');
  assert.match(amethyst?.sources?.[0]?.url ?? '', /^https:\/\/www\.gia\.edu\//);

  for (const article of JOURNAL_MATERIAL_REVISIONS) {
    assert.ok(urls.has('/blog/' + article.slug), article.slug);
    for (const slug of article.relatedProducts) {
      const product = catalog.get(slug);
      assert.ok(product && product.availability !== 'preview', slug);
    }
    for (const slug of article.relatedArticles ?? []) {
      assert.ok(urls.has('/blog/' + slug), slug);
    }
  }

  for (const slug of ['best-crystals-for-anxiety', 'crystal-healing-for-beginners-5-practices', 'amethyst-for-sleep-guide']) {
    assert.equal(getArticleBySlug(slug)?.publication, 'archived');
    assert.equal(urls.has('/blog/' + slug), false);
  }
  for (const topic of JOURNAL_TOPICS) {
    assert.equal(getArticleBySlug(topic.featured)?.category, topic.category, topic.slug);
    assert.ok(urls.has('/blog/' + topic.featured), topic.slug);
  }
});
