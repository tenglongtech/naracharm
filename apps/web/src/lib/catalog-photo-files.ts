import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { IntakeIssue, IntakeRow } from './catalog-intake-csv';

export async function checkCatalogPhotoFiles(rows: readonly IntakeRow[], publicDir: string): Promise<IntakeIssue[]> {
  const paths = [...new Set(rows.flatMap(({ photoUrl }) => photoUrl?.startsWith('/') ? [photoUrl] : []))];
  const missing = new Set(await Promise.all(paths.map(async (url) => {
    try {
      if ((await stat(join(publicDir, url.slice(1)))).isFile()) return undefined;
    } catch {
      // A missing or unreadable path must be corrected before applying the batch.
    }
    return url;
  })));

  return rows.flatMap(({ row, photoUrl }) => photoUrl && missing.has(photoUrl)
    ? [{ row, message: '找不到本地实拍文件。请使用已部署的图片路径或公开 HTTPS 地址。' }]
    : []);
}
