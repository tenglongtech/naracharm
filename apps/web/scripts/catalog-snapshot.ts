import { createHash } from 'node:crypto';
import sourceProducts from '../src/data/products.json';
import sourceCollections from '../src/data/collections.json';
import type { IntakeIssue, IntakeRow } from '../src/lib/catalog-intake-csv';
import { searchableProductPhotos } from '../src/lib/product-media';
import { defaultCatalogSku } from '../src/lib/storefront-offer';
import type { StorefrontProduct } from '../src/lib/storefront';
import { getStudioCollection, getStudioPreview } from '../src/lib/studio-listings';

function snapshotId(kind: 'product' | 'variant', slug: string) {
  const bytes = createHash('sha256').update(`naracharm:catalog:${kind}:${slug}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x80;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-');
}

export function stageCatalogSnapshot(rows: readonly IntakeRow[], issues: IntakeIssue[]) {
  const products = new Map((sourceProducts as StorefrontProduct[]).map((product) => [product.slug, product]));
  const usedSkus = new Set([...products.values()].flatMap((product) =>
    (product.variants ?? [product.variant]).flatMap((variant) => variant ? [variant.sku.toLowerCase()] : [])
  ));
  const collectionBySlug = new Map(sourceCollections.map((item) => [item.slug, item]));
  const updatedAt = new Date().toISOString();

  for (const row of rows) {
    if (row.action === 'draft') continue;
    const existing = products.get(row.slug);
    const fail = (message: string) => issues.push({ row: row.row, message });
    if (row.action === 'photo') {
      if (!existing) fail('找不到可补实拍的正式商品。');
      else if (row.photoUrl) products.set(row.slug, {
        ...existing,
        primaryImage: row.photoUrl,
        images: [...new Set([row.photoUrl, ...searchableProductPhotos(existing)])],
        imageKind: 'photo',
        updatedAt,
      });
      continue;
    }
    if (existing) {
      fail('这个网址已有正式商品。请用 photo 补实拍，价格和库存需在商品后台修改。');
      continue;
    }

    const design = getStudioPreview(row.slug);
    const name = row.name ?? design?.name;
    const category = row.category ?? design?.category;
    const collectionSlug = row.collectionSlug ?? design?.collectionSlug ?? null;
    const collection = collectionSlug ? collectionBySlug.get(collectionSlug) ?? getStudioCollection(collectionSlug) : null;
    const sku = row.sku ?? defaultCatalogSku(row.slug);
    const skuKey = sku.toLowerCase();
    const skuTaken = usedSkus.has(skuKey);
    if (!name || !category) fail('新商品需要商品名和品类。');
    if (collectionSlug && !collection) fail('找不到该系列。');
    if (skuTaken) fail('这个 SKU 已被使用。');
    if (!name || !category || (collectionSlug && !collection) || skuTaken) continue;
    usedSkus.add(skuKey);

    // The CSV parser validates all required publish fields before this step.
    const { priceCents, description, materials, photoUrl, stock } = row;
    products.set(row.slug, {
      id: snapshotId('product', row.slug),
      slug: row.slug,
      name,
      subtitle: design?.subtitle ?? null,
      description: description!,
      category,
      heritage: design?.heritage ?? collection?.heritage ?? null,
      materials: materials!,
      basePriceCents: priceCents!,
      compareAtPriceCents: null,
      isFeatured: false,
      craftStory: row.craftStory ?? design?.craftStory ?? null,
      careNotes: row.careNotes ?? null,
      collectionSlug,
      collectionName: collection?.name ?? null,
      primaryImage: photoUrl!,
      images: [photoUrl!],
      imageKind: 'photo',
      stock: stock!,
      variant: { id: snapshotId('variant', row.slug), sku, name: 'Default', unitPriceCents: priceCents!, stock: stock! },
      seoTitle: null,
      seoDescription: null,
      updatedAt,
    });
  }

  return [...products.values()];
}
