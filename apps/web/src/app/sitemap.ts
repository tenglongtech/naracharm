export const dynamic = "force-dynamic";
import type { MetadataRoute } from 'next';
import { getActiveProducts, getAllCollections } from '@/lib/storefront';
import { STORIES } from '@/lib/stories-data';

/**
 * Sitemap · Next.js 16 原生,部署时自动生成 /sitemap.xml
 * 包含: 静态页 + 全部 in-stock 商品 + 全部 collection + 全部 story
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://naracharm.com';
  const now = new Date();

  // 静态页 (核心转化路径 + 内容页)
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1.0, lastModified: now },
    { url: `${base}/collections`, changeFrequency: 'weekly', priority: 0.9, lastModified: now },
    { url: `${base}/best-sellers`, changeFrequency: 'weekly', priority: 0.8, lastModified: now },
    { url: `${base}/stories`, changeFrequency: 'weekly', priority: 0.8, lastModified: now },
    { url: `${base}/our-craft`, changeFrequency: 'monthly', priority: 0.8, lastModified: now },
    { url: `${base}/gift-guide`, changeFrequency: 'monthly', priority: 0.8, lastModified: now },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.6, lastModified: now },
    { url: `${base}/size-guide`, changeFrequency: 'monthly', priority: 0.5, lastModified: now },
    { url: `${base}/shipping`, changeFrequency: 'monthly', priority: 0.4, lastModified: now },
    { url: `${base}/returns`, changeFrequency: 'monthly', priority: 0.4, lastModified: now },
    { url: `${base}/faq`, changeFrequency: 'monthly', priority: 0.7, lastModified: now },
    { url: `${base}/contact`, changeFrequency: 'yearly', priority: 0.4, lastModified: now },
  ];

  // Story 详情页
  const storyEntries: MetadataRoute.Sitemap = STORIES.map((s) => ({
    url: `${base}/stories/${s.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    lastModified: new Date(s.publishedAt),
  }));

  // 动态: 商品
  let productEntries: MetadataRoute.Sitemap = [];
  let collectionEntries: MetadataRoute.Sitemap = [];
  try {
    const [products, collections] = await Promise.all([
      getActiveProducts(),
      getAllCollections(),
    ]);
    productEntries = products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      lastModified: now,
    }));
    collectionEntries = collections.map((c) => ({
      url: `${base}/collections/${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      lastModified: now,
    }));
  } catch (e) {
    console.warn('sitemap: 数据库未就绪,跳过动态条目', e);
  }

  return [...staticPages, ...storyEntries, ...collectionEntries, ...productEntries];
}
