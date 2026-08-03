import type { NextConfig } from 'next';

/**
 * Nara Charm 构建配置 — 双模式
 *
 * BUILD_TARGET 环境变量:
 *   'static'   → output: 'export'   (Cloudflare Pages 纯静态前端)
 *   'backend' / 未设置 → output: 'standalone' (Contabo 后端 API 服务)
 *
 * ⚠️ 切换 static 前必须等 Contabo 后端上线 (见 docs/STATICIZATION-HANDOFF.md)
 */
const buildTarget = process.env.BUILD_TARGET;
const isStatic = buildTarget === 'static';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 静态前端 export; 后端 standalone
  output: isStatic ? 'export' : 'standalone',
  images: {
    // 静态模式下 next/image 无法优化 → 关闭
    ...(isStatic ? { unoptimized: true } : {}),
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
