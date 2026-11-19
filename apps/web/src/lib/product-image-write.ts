import { and, eq } from 'drizzle-orm';
import { productImages, productVariants, variantImages } from '@jewelry/db';
import type { CatalogTransaction } from './product-maintenance';

/** The caller locks the product so all changes to its primary image are serialized. */
export async function saveProductImage(
  tx: CatalogTransaction, productId: string, url: string,
  { altText, photo, makePrimary = false }: { altText?: string; photo: boolean; makePrimary?: boolean },
) {
  const existing = await tx.select().from(productImages).where(eq(productImages.productId, productId));
  const primary = makePrimary || existing.length === 0 || (photo && !existing.some((image) => image.isProductPhoto));
  const duplicate = existing.find((image) => image.url === url);
  if (duplicate && (!photo || duplicate.isProductPhoto) && (!makePrimary || duplicate.isPrimary)) return duplicate;

  if (primary) await tx.update(productImages).set({ isPrimary: false }).where(eq(productImages.productId, productId));
  const caption = altText?.trim().slice(0, 240);
  if (duplicate) {
    const [updated] = await tx.update(productImages).set({ isProductPhoto: photo || duplicate.isProductPhoto, isPrimary: primary || duplicate.isPrimary, altText: caption || duplicate.altText })
      .where(eq(productImages.id, duplicate.id)).returning();
    return updated;
  }
  const [created] = await tx.insert(productImages).values({
    productId, url, altText: caption || null, isPrimary: primary, isProductPhoto: photo,
    sortOrder: Math.max(-1, ...existing.map((image) => image.sortOrder)) + 1,
  }).returning();
  return created;
}

/** The caller locks the product before changing a SKU's photo order. */
export async function saveVariantPhoto(tx: CatalogTransaction, productId: string, variantId: string, url: string, altText?: string) {
  const [variant] = await tx.select({ id: productVariants.id }).from(productVariants)
    .where(and(eq(productVariants.productId, productId), eq(productVariants.id, variantId)));
  if (!variant) throw new Error('找不到此商品的规格');

  const existing = await tx.select().from(variantImages).where(eq(variantImages.variantId, variantId));
  const duplicate = existing.find((image) => image.url === url);
  if (duplicate?.isProductPhoto) return duplicate;

  const isPrimary = !existing.some((image) => image.isProductPhoto);
  const caption = altText?.trim().slice(0, 240) || null;
  if (duplicate) {
    const [updated] = await tx.update(variantImages)
      .set({ isPrimary, isProductPhoto: true, altText: caption ?? duplicate.altText })
      .where(eq(variantImages.id, duplicate.id)).returning();
    return updated;
  }
  const [created] = await tx.insert(variantImages).values({
    variantId, url, altText: caption, isPrimary, isProductPhoto: true,
    sortOrder: Math.max(-1, ...existing.map((image) => image.sortOrder)) + 1,
  }).returning();
  return created;
}
