import { ImageResponse } from 'next/og';

/**
 * Favicon · 32×32 莲花 logo (动态生成,无需额外图片资源)
 */
export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FAF7F1',
          fontSize: 24,
          color: '#C4745A',
        }}
      >
        🪷
      </div>
    ),
    { ...size }
  );
}
