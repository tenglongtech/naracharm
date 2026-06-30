import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    // 本地图片在 public/ 下,无需 localPatterns 限制
    // 远程图床上线后在 remotePatterns 添加
  },
};

export default nextConfig;
