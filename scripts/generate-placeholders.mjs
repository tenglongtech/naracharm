#!/usr/bin/env node
/**
 * 占位图生成器 · 品牌色 SVG (无外部依赖)
 *
 * 用法: pnpm gen:placeholders
 * 输出: apps/web/public/products/placeholder-NN.svg (3 个备用)
 *
 * 设计原则:
 * - 1000×1000 viewBox, 比例与商品图一致
 * - 品牌色: bg=cream (#FAF7F1), accent=terracotta (#C4745A), gold (#D4AF37)
 * - 中央渲染产品名 (sans-serif fallback), 4 角抽象纹样
 * - 占位图给"未到位的产品/未来 SKU"用, 已有真实图 (p01-p21.jpg) 不覆盖
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'apps', 'web', 'public', 'products');

// 占位图 3 个: 备用 / 缺货时兜底 / 未来 SKU
const PLACEHOLDERS = [
  { n: 1, title: 'Image Coming Soon', subtitle: 'Nara Charm · Handmade', glyph: 'lotus' },
  { n: 2, title: 'Crafted by Hand', subtitle: 'Story waiting to be told', glyph: 'knot' },
  { n: 3, title: 'New Drop', subtitle: 'A piece is on the loom', glyph: 'wave' },
];

// 4 角抽象纹样 (SVG path)
const GLYPHS = {
  lotus: `<g stroke="#C4745A" stroke-width="2" fill="none" stroke-linecap="round">
    <path d="M 0 100 Q 30 80 60 100 Q 30 60 0 100 Z" />
    <path d="M 1000 900 Q 970 880 940 900 Q 970 860 1000 900 Z" />
  </g>`,
  knot: `<g stroke="#C4745A" stroke-width="2" fill="none" stroke-linecap="round">
    <path d="M 60 100 Q 100 80 100 120 Q 100 100 80 100 Q 100 100 100 80" />
    <path d="M 940 900 Q 900 920 900 880 Q 900 900 920 900 Q 900 900 900 920" />
  </g>`,
  wave: `<g stroke="#C4745A" stroke-width="2" fill="none" stroke-linecap="round">
    <path d="M 0 100 Q 25 90 50 100 T 100 100" />
    <path d="M 1000 900 Q 975 890 950 900 T 900 900" />
  </g>`,
};

function makeSVG({ n, title, subtitle, glyph }) {
  const corner = GLYPHS[glyph] || GLYPHS.lotus;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <defs>
    <linearGradient id="bg-${n}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FAF7F1" />
      <stop offset="100%" stop-color="#F3EDE2" />
    </linearGradient>
  </defs>
  <!-- 背景 -->
  <rect width="1000" height="1000" fill="url(#bg-${n})" />
  <!-- 4 角纹样 -->
  ${corner}
  <!-- 中央莲花图标 (简化) -->
  <g transform="translate(500 460)" stroke="#3A2E2B" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 0 60 C -30 30 -50 0 -50 -30 C -30 -45 -10 -40 0 -20 C 10 -40 30 -45 50 -30 C 50 0 30 30 0 60 Z" />
    <path d="M 0 40 C -15 20 -25 0 -25 -20 C -15 -25 -5 -22 0 -10 C 5 -22 15 -25 25 -20 C 25 0 15 20 0 40 Z" />
    <line x1="0" y1="60" x2="0" y2="20" />
  </g>
  <!-- 标题 -->
  <text x="500" y="620" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="42" font-style="italic" fill="#3A2E2B">
    ${title}
  </text>
  <!-- 副标题 -->
  <text x="500" y="680" text-anchor="middle"
        font-family="-apple-system, 'Helvetica Neue', Arial, sans-serif"
        font-size="20" letter-spacing="3" fill="#6B4F47">
    ${subtitle.toUpperCase()}
  </text>
  <!-- 底部金线 -->
  <line x1="400" y1="740" x2="600" y2="740" stroke="#D4AF37" stroke-width="1" />
  <!-- 编号 -->
  <text x="500" y="780" text-anchor="middle"
        font-family="-apple-system, sans-serif"
        font-size="12" letter-spacing="2" fill="#6B4F47" opacity="0.5">
    PLACEHOLDER · 0${n}
  </text>
</svg>
`;
}

function main() {
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }
  console.log(`📦 输出目录: ${OUT_DIR}`);
  for (const p of PLACEHOLDERS) {
    const svg = makeSVG(p);
    const out = join(OUT_DIR, `placeholder-0${p.n}.svg`);
    writeFileSync(out, svg, 'utf8');
    console.log(`  ✓ placeholder-0${p.n}.svg (${(svg.length / 1024).toFixed(1)} KB)`);
  }
  console.log(`\n✅ 已生成 ${PLACEHOLDERS.length} 个 SVG 占位图`);
  console.log('用法: 商品图暂缺时,在 seed 中引用 /products/placeholder-0N.svg');
}

main();
