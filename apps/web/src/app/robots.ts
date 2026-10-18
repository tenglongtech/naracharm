import { siteConfig } from '@/lib/site-config';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

/**
 * robots.txt · 部署时自动生成 /robots.txt
 * 允许全站抓取,仅 /admin /api /account 私有区屏蔽
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url;
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api', '/account', '/cart', '/checkout', '/order', '/login', '/register', '/forgot-password'],
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
