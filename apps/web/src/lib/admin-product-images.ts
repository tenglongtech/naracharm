'use server';

import { asc, and, eq } from 'drizzle-orm';
import { products, productImages } from '@jewelry/db';
import { db as connection, type DB } from './db';
import { requireAdmin } from './auth';
import { productPhotoUrl } from './product-media';
import { saveProductImage } from './product-image-write';

const db: DB = connection;

export async function getProductImages(productId: string) {
  await requireAdmin();
  return db.select().from(productImages).where(eq(productImages.productId, productId))
    .orderBy(asc(productImages.sortOrder), asc(productImages.id));
}

export async function addProductImage(
  productId: string,
  source: string,
  altText: string | undefined,
  photo = false,
) {
  await requireAdmin();
  const url = photo ? productPhotoUrl(source) : source.trim();
  if (!url || (!photo && !/^\/products\/[a-z0-9_-]+\.(?:jpe?g|png|webp|gif)$/i.test(url))) {
    throw new Error('图片地址不可用');
  }

  return db.transaction(async (tx) => {
    const [product] = await tx.select({ id: products.id }).from(products).where(eq(products.id, productId)).for('update');
    if (!product) throw new Error('找不到商品');
    return saveProductImage(tx, productId, url, { altText, photo });
  });
}

export async function deleteProductImage(imageId: string) {
  await requireAdmin();
  await db.transaction(async (tx) => {
    const [image] = await tx.select({ productId: productImages.productId }).from(productImages).where(eq(productImages.id, imageId));
    if (!image) return;
    await tx.select({ id: products.id }).from(products).where(eq(products.id, image.productId)).for('update');
    await tx.delete(productImages).where(eq(productImages.id, imageId));
  });
}

export async function setPrimaryImage(imageId: string, productId: string) {
  await requireAdmin();
  await db.transaction(async (tx) => {
    await tx.select({ id: products.id }).from(products).where(eq(products.id, productId)).for('update');
    const scope = and(eq(productImages.id, imageId), eq(productImages.productId, productId));
    const [image] = await tx.select({ id: productImages.id }).from(productImages).where(scope).for('update');
    if (!image) throw new Error('找不到此商品的图片');
    await tx.update(productImages).set({ isPrimary: false }).where(eq(productImages.productId, productId));
    await tx.update(productImages).set({ isPrimary: true }).where(scope);
  });
}
