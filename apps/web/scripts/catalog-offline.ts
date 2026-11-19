import { link, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalogCsv, MAX_CATALOG_ROWS, parseCatalogIntake } from '../src/lib/catalog-intake-csv';
import { checkCatalogPhotoFiles } from '../src/lib/catalog-photo-files';
import { productIndexPhotos } from '../src/lib/product-media';
import { getActiveProducts } from '../src/lib/storefront';
import { stageCatalogSnapshot } from './catalog-snapshot';

async function main() {
  const [mode, file, argument, ...extra] = process.argv.slice(2);
  if (extra.length) throw new Error('参数过多。');

  if (file && ((mode === 'check' && argument === undefined) || (mode === 'snapshot' && argument?.endsWith('.json')))) {
    const { rows, issues } = parseCatalogIntake(await readFile(file, 'utf8'));
    const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
    issues.push(...await checkCatalogPhotoFiles(rows, publicDir));
    const candidate = mode === 'snapshot' && issues.length === 0 ? stageCatalogSnapshot(rows, issues) : undefined;
    for (const { row, message } of issues.sort((a, b) => a.row - b.row)) console.error(`第 ${row} 行 · ${message}`);
    if (issues.length) return 1;

    const publish = rows.filter(({ action }) => action === 'publish').length;
    const photos = rows.filter(({ action }) => action === 'photo').length;
    if (candidate && argument) {
      const destination = resolve(argument);
      const staging = await mkdtemp(join(dirname(destination), '.catalog-snapshot-'));
      try {
        const prepared = join(staging, 'products.json');
        await writeFile(prepared, JSON.stringify(candidate, null, 2) + '\n');
        await link(prepared, destination);
      } finally {
        await rm(staging, { recursive: true, force: true });
      }
      console.log(`候选目录已生成。新增 ${publish} 款，补实拍 ${photos} 款，共 ${candidate.length} 款。`);
      return 0;
    }
    console.log(`格式和本地图片路径校验通过。${rows.length} 条记录，${publish} 条上架，${photos} 条补实拍，${rows.length - publish - photos} 条草稿。`);
    console.log('应用前请核对 HTTPS 图片、SKU、当前商品状态和库存预留。');
    return 0;
  }

  if (!file || (mode !== 'studio' && mode !== 'photos')) {
    throw new Error('用法：catalog:offline studio|photos <CSV 文件> [页码]、check <CSV 文件> 或 snapshot <CSV 文件> <候选 JSON 文件>。');
  }

  const page = Number(argument ?? '1');
  if (!Number.isSafeInteger(page) || page < 1) throw new Error('页码必须是正整数。');

  const products = await getActiveProducts();
  const records = mode === 'studio'
    ? products.filter(({ availability }) => availability === 'preview').map(({ slug, name, category, collectionSlug }) => ({
      action: 'draft', slug, name, category, collection_slug: collectionSlug ?? '',
    }))
    : products.filter((piece) => piece.availability !== 'preview' && !productIndexPhotos(piece).length).map(({ slug, name }) => ({
      action: 'photo', slug, name,
    }));
  const pages = Math.max(1, Math.ceil(records.length / MAX_CATALOG_ROWS));
  if (page > pages) throw new Error(`这份目录只有 ${pages} 页。`);

  const first = (page - 1) * MAX_CATALOG_ROWS;
  const batch = records.slice(first, first + MAX_CATALOG_ROWS);
  await writeFile(file, catalogCsv(batch), { flag: 'wx' });
  console.log(`已生成 ${batch.length} 条记录（第 ${page} / ${pages} 页）。`);
  return 0;
}

main().then((status) => {
  process.exitCode = status;
}).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : '目录文件处理失败。');
  process.exitCode = 1;
});
