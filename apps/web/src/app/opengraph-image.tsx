import { ImageResponse } from 'next/og';

/**
 * 默认 OG 图 · 1200×630,品牌色 + 莲花 logo + 标语
 * 社交分享 (Facebook / Twitter / LinkedIn) 时展示
 */
export const runtime = 'edge';
export const alt = 'Nara Charm — Jewelry with Spirit';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FAF7F1 0%, #F3EDE2 100%)',
          fontFamily: 'Georgia, serif',
          color: '#3A2E2B',
        }}
      >
        {/* 莲花 (简化 SVG) */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 100 100"
          fill="none"
          stroke="#C4745A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M 50 90 C 30 70 20 50 20 35 C 30 25 40 28 50 40 C 60 28 70 25 80 35 C 80 50 70 70 50 90 Z" />
          <path d="M 50 75 C 38 60 32 45 32 32 C 38 27 45 30 50 38 C 55 30 62 27 68 32 C 68 45 62 60 50 75 Z" />
          <line x1="50" y1="90" x2="50" y2="20" />
        </svg>
        {/* 品牌名 */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 600,
            marginTop: 32,
            letterSpacing: '-1px',
          }}
        >
          Nara Charm
        </div>
        {/* 金线 */}
        <div
          style={{
            width: 80,
            height: 2,
            background: '#D4AF37',
            marginTop: 24,
            marginBottom: 24,
          }}
        />
        {/* 标语 */}
        <div
          style={{
            fontSize: 28,
            fontStyle: 'italic',
            color: '#6B4F47',
            letterSpacing: '2px',
          }}
        >
          Jewelry with Spirit
        </div>
        <div
          style={{
            fontSize: 18,
            color: '#6B4F47',
            marginTop: 12,
            letterSpacing: '4px',
          }}
        >
          STORIES IN EVERY PIECE
        </div>
      </div>
    ),
    { ...size }
  );
}
