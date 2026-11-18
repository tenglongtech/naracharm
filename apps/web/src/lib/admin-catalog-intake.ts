'use server';

import { requireAdmin } from './auth';
import { applyCatalogIntake, catalogIntakeTemplate, previewCatalogIntake } from './catalog-intake';
import { CatalogIntakeError } from './catalog-intake-csv';

async function checked<T>(operation: () => Promise<T>) {
  await requireAdmin();
  try {
    return { ok: true as const, value: await operation() };
  } catch (error) {
    if (error instanceof CatalogIntakeError) return { ok: false as const, error: error.message };
    console.error('Catalog intake did not complete', error instanceof Error ? error.name : 'Unknown error');
    return { ok: false as const, error: '批次处理未完成。请刷新商品列表并重新预检。' };
  }
}

function validateCsv(csv: string) {
  if (typeof csv !== 'string') throw new CatalogIntakeError('请选择 CSV 文件。');
}

export async function checkCatalogCsv(csv: string) {
  return checked(() => {
    validateCsv(csv);
    return previewCatalogIntake(csv);
  });
}

export async function saveCatalogCsv(csv: string, revision: string) {
  return checked(() => {
    validateCsv(csv);
    if (typeof revision !== 'string' || !/^[0-9a-f]{64}$/.test(revision)) throw new CatalogIntakeError('请先预检文件。');
    return applyCatalogIntake(csv, revision);
  });
}

export async function downloadCatalogCsv(kind: 'studio' | 'photos' | 'blank') {
  return checked(() => {
    if (!['studio', 'photos', 'blank'].includes(kind)) throw new CatalogIntakeError('请选择可用模板。');
    return catalogIntakeTemplate(kind);
  });
}
