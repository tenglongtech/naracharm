import { eq } from 'drizzle-orm';
import { productImages } from '@jewelry/db';
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
