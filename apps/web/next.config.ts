import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // 品牌名确认后 + 上线图床后填实际域名 (Payload Media / Cloudinary / etc.)
      // { protocol: 'https', hostname: 'cdn.example.com' },
    ],
  },
  // Payload CMS 3 + Next.js 16 默认无需额外 webpack 配置
  experimental: {
    // Next.js 16 Cache Components (按需启用)
    // cacheComponents: true,
  },
};

export default nextConfig;
