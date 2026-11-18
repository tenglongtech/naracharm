import type { Metadata } from 'next';
import type { StorefrontProduct } from './storefront';
import { siteConfig } from './site-config';

type ShareImage = { url: string; alt: string; width?: number; height?: number };
type PublicPage = {
  path: string;
  title: string;
  description: string;
  image?: ShareImage;
  article?: { publishedTime?: string; modifiedTime?: string; authors?: string[] };
};

const brandImage = {
  url: '/opengraph-image',
  alt: 'Nara Charm — Jewelry with Spirit',
  width: 1200,
  height: 630,
};

export function pageMetadata({ path, title, description, image = brandImage, article }: PublicPage): Metadata {
  const card = { title, description, images: [image] };
  const social = { ...card, siteName: siteConfig.brand, locale: 'en_US', url: path };

  return {
    title: path === '/' ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: article
      ? { ...social, type: 'article', ...article }
      : { ...social, type: 'website' },
    twitter: { ...card, card: 'summary_large_image' },
  };
}

export function productShareImage(product?: Pick<StorefrontProduct, 'name' | 'primaryImage' | 'imageKind'>): ShareImage | undefined {
  return product?.primaryImage ? {
    url: product.primaryImage,
    alt: product.imageKind === 'illustration' ? `${product.name} design illustration` : product.name,
  } : undefined;
}
