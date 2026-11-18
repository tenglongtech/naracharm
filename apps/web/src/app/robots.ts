import { siteConfig } from '@/lib/site-config';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

/**
 * robots.txt · 部署时自动生成 /robots.txt
 * 公开工具页面可被抓取，让搜索引擎读取 HTML 的 noindex。
 * 后台与 API 继续屏蔽爬虫。
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url;
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
      {
        userAgent: ['GPTBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended'],
        allow: ['/', '/llms.txt', '/blog', '/products', '/collections', '/stories', '/our-craft'],
        disallow: ['/admin', '/api', '/account', '/cart', '/checkout'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
