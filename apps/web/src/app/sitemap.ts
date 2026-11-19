import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';
import { getActiveProducts, getAllCollections } from '@/lib/storefront';
import { CATEGORIES } from '@/lib/categories';
import { CATEGORY_EDITORIAL } from '@/lib/category-editorial';
import { getCollectionArtwork } from '@/lib/collection-editorials';
import { getStudioCover, STUDIO_SERIES } from '@/lib/studio-designs';
import { STORIES, storiesCover } from '@/lib/stories-data';
import { BLOG_ARTICLES, isPublishedGuide } from '@/lib/blog-data';
import { articleImagePaths } from '@/lib/editorial-art';
import { JOURNAL_TOPICS } from '@/lib/journal-topics';
import { productIndexPhotos } from '@/lib/product-media';

export const dynamic = 'force-static';

const publicPages = [
  '/', '/shop', '/collections', '/best-sellers', '/studio', '/stories', '/blog',
  '/our-craft', '/gift-guide', '/about', '/size-guide', '/shipping', '/returns',
  '/faq', '/contact', '/wholesale', '/stockists',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections] = await Promise.all([getActiveProducts(), getAllCollections()]);
  const urls = new Set([
    ...publicPages,
    ...CATEGORIES.map(({ slug }) => `/collections/${slug}`),
    ...collections.map(({ slug }) => `/collections/${slug}`),
    ...JOURNAL_TOPICS.map(({ slug }) => `/blog/topic/${slug}`),
  ]);
  const pageImages = new Map(CATEGORIES.map(({ slug }) => [`/collections/${slug}`, [CATEGORY_EDITORIAL[slug].image.src]]));
  pageImages.set('/stories', [storiesCover.url]);
  for (const { slug } of collections) {
    const artwork = getCollectionArtwork(slug);
    if (artwork) pageImages.set(`/collections/${slug}`, [artwork.image]);
  }
  for (const { slug } of STUDIO_SERIES) {
    const designs = products.filter((item) => item.collectionSlug === slug);
    const cover = getStudioCover(slug, designs);
    if (!cover) continue;
    const additional = designs.flatMap(({ slug: designSlug, primaryImage }) =>
      designSlug !== cover.lead.slug && primaryImage ? [primaryImage] : []);
    pageImages.set(`/collections/${slug}`, [cover.src, ...additional]);
  }

  return [
    ...Array.from(urls, (url) => {
      const images = pageImages.get(url)?.map(absoluteUrl);
      return { url: absoluteUrl(url), ...(images?.length ? { images } : {}) };
    }),
    ...products.filter((product) => product.availability !== 'preview').map((product) => {
      const images = productIndexPhotos(product).map(absoluteUrl);
      return {
        url: absoluteUrl(`/products/${product.slug}`),
        ...(product.updatedAt ? { lastModified: product.updatedAt } : {}),
        ...(images.length ? { images } : {}),
      };
    }),
    ...STORIES.map(({ slug, updatedAt, cover }) => ({
      url: absoluteUrl(`/stories/${slug}`), lastModified: updatedAt, images: [absoluteUrl(cover.url)],
    })),
    ...BLOG_ARTICLES.filter(isPublishedGuide).map((article) => {
      const images = articleImagePaths(article).map(absoluteUrl);
      return {
        url: absoluteUrl(`/blog/${article.slug}`), lastModified: article.updatedAt,
        ...(images.length ? { images } : {}),
      };
    }),
  ];
}
