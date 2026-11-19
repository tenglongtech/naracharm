import type { StorefrontVariant } from './storefront-offer';

type ProductMedia = {
  primaryImage: string | null;
  images: string[];
  imageKind?: 'illustration' | 'photo';
};

type ProductPhotoRow = { url: string; isProductPhoto: boolean; isPrimary: boolean; sortOrder: number };
type PhotoVariant = Pick<StorefrontVariant, 'photoUrls'>;
type PhotoProduct = ProductMedia & { availability?: 'preview'; variant?: PhotoVariant; variants?: PhotoVariant[] };

export function productPhotoUrl(value: string): string | undefined {
  const source = value.trim();
  if (source.length > 2_000) return undefined;
  if (/^\/products\/photos\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.(?:jpe?g|png|webp|gif)$/i.test(source)) return source;
  try {
    const url = new URL(source);
    if (url.protocol === 'https:' && !url.username && !url.password && !url.hash && !url.search
      && /[a-z]\.[a-z]{2,}$/i.test(url.hostname) && !url.hostname.endsWith('.localhost')
      && url.pathname !== '/') {
      return url.href;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function selectProductPhotos(rows: readonly ProductPhotoRow[]) {
  const urls = rows.filter((row) => row.isProductPhoto)
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder || a.url.localeCompare(b.url))
    .map((row) => productPhotoUrl(row.url))
    .filter((url): url is string => Boolean(url));
  const images = [...new Set(urls)];
  if (images.length === 0) return undefined;
  return { primaryImage: images[0], images, imageKind: 'photo' as const };
}

export function searchableProductPhotos(product: ProductMedia & { availability?: 'preview' }): string[] {
  if (product.availability === 'preview' || product.imageKind !== 'photo' || !product.primaryImage) return [];
  const primary = productPhotoUrl(product.primaryImage);
  if (!primary) return [];
  return [...new Set([primary, ...product.images.map(productPhotoUrl)])].filter((url): url is string => Boolean(url));
}

export function searchableVariantPhotos(product: PhotoProduct, variant?: PhotoVariant): string[] {
  if (product.availability === 'preview') return [];
  const assigned = variant?.photoUrls?.map(productPhotoUrl).filter((photo): photo is string => Boolean(photo));
  return assigned?.length ? [...new Set(assigned)] : searchableProductPhotos(product);
}

export function productIndexPhotos(product: PhotoProduct): string[] {
  const variants = product.variants?.length ? product.variants : [product.variant];
  return [...new Set(variants.flatMap((variant) => searchableVariantPhotos(product, variant)))];
}

export function variantProductMedia(product: PhotoProduct, variant?: PhotoVariant): ProductMedia {
  const photos = searchableVariantPhotos(product, variant);
  if (photos.length) return { primaryImage: photos[0], images: photos, imageKind: 'photo' };
  return { primaryImage: product.primaryImage, images: product.images, imageKind: product.imageKind };
}

export function withProductMedia<T extends ProductMedia>(product: T, illustration?: ProductMedia): T {
  const photos = searchableProductPhotos(product);
  if (photos.length) return { ...product, primaryImage: photos[0], images: photos };
  return illustration ? { ...product, ...illustration } : product;
}

export function isExternalProductImage(url: string) {
  return /^https?:\/\//i.test(url);
}
