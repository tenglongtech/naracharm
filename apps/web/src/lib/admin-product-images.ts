'use server';

import { asc, and, eq } from 'drizzle-orm';
import { products, productImages, productVariants, variantImages } from '@jewelry/db';
import { z } from 'zod';
import { db as connection, type DB } from './db';
import { requireAdmin } from './auth';
import { productPhotoUrl } from './product-media';
import { saveProductImage, saveVariantPhoto } from './product-image-write';

const db: DB = connection;

export async function getProductImages(productId: string) {
  await requireAdmin();
  const [shared, assigned, variants] = await Promise.all([
    db.select().from(productImages).where(eq(productImages.productId, productId))
      .orderBy(asc(productImages.sortOrder), asc(productImages.id)),
    db.select({ image: variantImages }).from(variantImages)
      .innerJoin(productVariants, eq(productVariants.id, variantImages.variantId))
      .where(eq(productVariants.productId, productId))
      .orderBy(asc(productVariants.createdAt), asc(variantImages.sortOrder), asc(variantImages.id)),
    db.select({ id: productVariants.id, name: productVariants.name, sku: productVariants.sku })
      .from(productVariants).where(eq(productVariants.productId, productId))
      .orderBy(asc(productVariants.createdAt), asc(productVariants.id)),
  ]);
  return { images: [...shared.map((image) => ({ ...image, variantId: null })), ...assigned.map(({ image }) => image)], variants };
}

export async function addProductImage(
  productId: string,
  source: string,
  altText: string | undefined,
  photo = false,
  variantId?: string,
) {
  await requireAdmin();
  if (variantId && (!photo || !z.uuid().safeParse(variantId).success)) throw new Error('请选择适用规格');
  const url = photo ? productPhotoUrl(source) : source.trim();
  if (!url || (!photo && !/^\/products\/[a-z0-9_-]+\.(?:jpe?g|png|webp|gif)$/i.test(url))) {
    throw new Error('图片地址不可用');
  }

  return db.transaction(async (tx) => {
    const [product] = await tx.select({ id: products.id }).from(products).where(eq(products.id, productId)).for('update');
    if (!product) throw new Error('找不到商品');
    if (variantId) return saveVariantPhoto(tx, productId, variantId, url, altText);
    return saveProductImage(tx, productId, url, { altText, photo });
  });
}

export async function deleteProductImage(imageId: string, variantId?: string) {
  await requireAdmin();
  await db.transaction(async (tx) => {
    if (variantId) {
      const [variant] = await tx.select({ productId: productVariants.productId }).from(productVariants)
        .where(eq(productVariants.id, variantId));
      if (!variant) return;
      await tx.select({ id: products.id }).from(products).where(eq(products.id, variant.productId)).for('update');
      await tx.delete(variantImages).where(and(eq(variantImages.id, imageId), eq(variantImages.variantId, variantId)));
      return;
    }
    const [image] = await tx.select({ productId: productImages.productId }).from(productImages).where(eq(productImages.id, imageId));
    if (!image) return;
    await tx.select({ id: products.id }).from(products).where(eq(products.id, image.productId)).for('update');
    await tx.delete(productImages).where(eq(productImages.id, imageId));
  });
}

export async function setPrimaryImage(imageId: string, productId: string, variantId?: string) {
  await requireAdmin();
  await db.transaction(async (tx) => {
    await tx.select({ id: products.id }).from(products).where(eq(products.id, productId)).for('update');
    if (variantId) {
      const imageScope = and(eq(variantImages.id, imageId), eq(variantImages.variantId, variantId), eq(variantImages.isProductPhoto, true));
      const [image] = await tx.select({ id: variantImages.id }).from(variantImages)
        .innerJoin(productVariants, eq(productVariants.id, variantImages.variantId))
        .where(and(imageScope, eq(productVariants.productId, productId)));
      if (!image) throw new Error('找不到此规格的实拍');
      await tx.update(variantImages).set({ isPrimary: false }).where(eq(variantImages.variantId, variantId));
      await tx.update(variantImages).set({ isPrimary: true }).where(imageScope);
      return;
    }
    const scope = and(eq(productImages.id, imageId), eq(productImages.productId, productId));
    const [image] = await tx.select({ id: productImages.id }).from(productImages).where(scope).for('update');
    if (!image) throw new Error('找不到此商品的图片');
    await tx.update(productImages).set({ isPrimary: false }).where(eq(productImages.productId, productId));
    await tx.update(productImages).set({ isPrimary: true }).where(scope);
  });
}
