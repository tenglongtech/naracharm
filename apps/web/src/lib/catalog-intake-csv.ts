import { z } from 'zod';
import { productPhotoUrl } from './product-media';

export const MAX_CATALOG_CSV_BYTES = 256 * 1024;
export const MAX_CATALOG_ROWS = 200;
export const CATALOG_COLUMNS = [
  'action', 'slug', 'name', 'category', 'collection_slug', 'sku', 'price_usd', 'stock',
  'materials', 'description', 'care_notes', 'craft_story', 'photo_url', 'photo_verified',
] as const;
type Column = (typeof CATALOG_COLUMNS)[number];
type Cells = Partial<Record<Column, string>>;

export class CatalogIntakeError extends Error {}

export type IntakeIssue = { row: number; message: string };
type IntakeAction = 'draft' | 'publish' | 'photo';
export type IntakeRow = {
  row: number; action: IntakeAction; slug: string; name?: string; category?: 'bracelet' | 'necklace' | 'earrings' | 'phone-charm';
  collectionSlug?: string; sku?: string; priceCents?: number; stock?: number; materials?: string[];
  description?: string; careNotes?: string; craftStory?: string; photoUrl?: string;
};

function readCsv(input: string) {
  if (new TextEncoder().encode(input).byteLength > MAX_CATALOG_CSV_BYTES) {
    throw new CatalogIntakeError('CSV 文件不能超过 256 KB。');
  }
  const source = input.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const records: { row: number; fields: string[] }[] = [];
  let fields: string[] = [];
  let cell = '';
  let mode: 'start' | 'plain' | 'quoted' | 'closed' = 'start';
  let row = 1;
  let line = 1;

  function finishCell() {
    fields.push(cell);
    cell = '';
    mode = 'start';
  }

  function finishRow() {
    finishCell();
    if (fields.some((value) => value.trim())) records.push({ row, fields });
    if (records.length > MAX_CATALOG_ROWS + 1) throw new CatalogIntakeError('一份 CSV 最多包含 200 条商品记录。');
    fields = [];
    row = line + 1;
  }

  for (let index = 0; index < source.length; index++) {
    const char = source[index];
    if (mode === 'quoted') {
      if (char === '"' && source[index + 1] === '"') {
        cell += '"';
        index++;
      } else if (char === '"') {
        mode = 'closed';
      } else {
        cell += char;
        if (char === '\n') line++;
      }
      continue;
    }

    if (char === ',') finishCell();
    else if (char === '\n') {
      finishRow();
      line++;
    } else if (mode === 'closed') {
      if (!/[ \t]/.test(char)) throw new CatalogIntakeError(`第 ${line} 行引号后应接逗号或换行。`);
    } else if (char === '"') {
      if (mode !== 'start') throw new CatalogIntakeError(`第 ${line} 行的引号需要成对，并包住整个字段。`);
      mode = 'quoted';
    } else {
      mode = 'plain';
      cell += char;
    }
  }

  if ((mode as string) === 'quoted') throw new CatalogIntakeError(`第 ${row} 行的引号没有闭合。`);
  finishRow();
  return records;
}

const slugValue = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const format = z.object({
  action: z.enum(['draft', 'publish', 'photo'], { error: 'action 使用 draft、publish 或 photo。' }),
  slug: z.string().max(140).regex(slugValue, 'slug 使用小写字母、数字和连字符。'),
  name: z.string().max(180, '商品名最长 180 字符。').optional(),
  category: z.enum(['bracelet', 'necklace', 'earrings', 'phone-charm'], { error: '请选择有效品类。' }).optional(),
  collection_slug: z.string().max(140).regex(slugValue, '系列网址标识格式不正确。').optional(),
  sku: z.string().max(160, 'SKU 最长 160 字符。').optional(),
  price_usd: z.string().regex(/^\d{1,6}(?:\.\d{1,2})?$/, '售价使用美元数字，最多两位小数。').optional(),
  stock: z.string().regex(/^\d{1,10}$/, '库存使用零或正整数。').refine((value) => Number(value) <= 2_147_483_647, '库存数值过大。').optional(),
  materials: z.string().max(1500, '材质说明过长。').optional(),
  description: z.string().max(5000, '商品描述过长。').optional(),
  care_notes: z.string().max(3000, '保养说明过长。').optional(),
  craft_story: z.string().max(5000, '工艺故事过长。').optional(),
  photo_url: z.string().max(2000, '照片地址过长。').optional(),
  photo_verified: z.enum(['yes', 'no'], { error: 'photo_verified 使用 yes 或 no。' }).optional(),
});

export function parseCatalogIntake(csv: string): { rows: IntakeRow[]; issues: IntakeIssue[] } {
  const [header, ...data] = readCsv(csv);
  if (!header || !data.length) throw new CatalogIntakeError('CSV 需要表头和至少一条商品记录。');
  const columns = header.fields.map((value) => value.trim());
  const allowed = new Set<string>(CATALOG_COLUMNS);
  if (new Set(columns).size !== columns.length || columns.some((field) => !allowed.has(field))) {
    throw new CatalogIntakeError('表头包含未知或重复的字段。请使用下载的模板。');
  }
  if (!columns.includes('action') || !columns.includes('slug')) throw new CatalogIntakeError('表头需要 action 和 slug 字段。');

  const rows: IntakeRow[] = [];
  const issues: IntakeIssue[] = [];
  const slugs = new Map<string, number>();
  for (const { row, fields } of data) {
    if (fields.length !== columns.length) {
      issues.push({ row, message: '这一行的字段数与表头不一致。' });
      continue;
    }
    const raw = Object.fromEntries(columns.map((field, i) => [field, fields[i].trim() || undefined]));
    const checked = format.safeParse(raw);
    if (!checked.success) {
      issues.push(...checked.error.issues.map(({ path, message }) => ({ row, message: `${String(path[0])} · ${message}` })));
      continue;
    }
    const value = checked.data;
    const earlier = slugs.get(value.slug);
    if (earlier) {
      issues.push({ row, message: `商品网址标识与第 ${earlier} 行重复。` });
      continue;
    }
    slugs.set(value.slug, row);
    const materials = value.materials?.split('|').map((item) => item.trim()).filter(Boolean);
    const [dollars, centPart = ''] = value.price_usd?.split('.') ?? [];
    const priceCents = dollars === undefined ? undefined : Number(dollars) * 100 + Number(centPart.padEnd(2, '0'));
    const photoUrl = value.photo_url ? productPhotoUrl(value.photo_url) : undefined;

    if (value.photo_url && (!photoUrl || value.photo_verified !== 'yes')) {
      issues.push({ row, message: '使用有效的实拍地址，并在 photo_verified 填写 yes。' });
    }
    if (value.action === 'photo' && !photoUrl) issues.push({ row, message: '补实拍需要填写照片地址。' });
    if (value.action === 'photo' && [value.category, value.collection_slug, value.sku, value.price_usd, value.stock, value.materials, value.description, value.care_notes, value.craft_story].some(Boolean)) {
      issues.push({ row, message: 'photo 行只填写商品网址、可选商品名及实拍字段。' });
    }
    if (value.action === 'publish' && (!priceCents || value.stock === undefined || !materials?.length || !value.description || !photoUrl)) {
      issues.push({ row, message: '上架需要填写正式售价、库存、实物材质、商品描述及实拍地址。' });
    }
    rows.push({
      row, action: value.action, slug: value.slug, name: value.name, category: value.category,
      collectionSlug: value.collection_slug, sku: value.sku, priceCents, stock: value.stock === undefined ? undefined : Number(value.stock),
      materials, description: value.description, careNotes: value.care_notes, craftStory: value.craft_story, photoUrl,
    });
  }
  return { rows, issues };
}

export function catalogCsv(records: Cells[]) {
  function quote(raw: string) {
    const value = /^\s*[=+\-@]/.test(raw) ? "'" + raw : raw;
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return '\uFEFF' + [CATALOG_COLUMNS.join(','), ...records.map((row) => CATALOG_COLUMNS.map((key) => quote(row[key] ?? '')).join(','))].join('\r\n') + '\r\n';
}
