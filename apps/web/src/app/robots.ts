import type { MetadataRoute } from 'next';

/**
 * robots.txt · 部署时自动生成 /robots.txt
 * 允许全站抓取,仅 /admin /api /account 私有区屏蔽
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://naracharm.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api', '/account', '/cart', '/checkout', '/order'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
