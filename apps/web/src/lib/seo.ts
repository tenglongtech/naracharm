import { siteConfig } from './site-config';
import type { StorefrontProduct } from './storefront';
import { searchableProductPhotos } from './product-media';

export function absoluteUrl(path: string) {
  return new URL(path, `${siteConfig.url.replace(/\/$/, '')}/`).href;
}

export const storeOrganization = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  '@id': absoluteUrl('/#organization'),
  name: siteConfig.brand,
  url: siteConfig.url,
};

export const shippingServiceId = absoluteUrl('/shipping#standard');
export const merchantReturnPolicyId = absoluteUrl('/returns#eligible-returns');

export function serializeJsonLd(schema: object) {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}

export function productSchema(product: StorefrontProduct) {
  const images = searchableProductPhotos(product).map(absoluteUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.subtitle || undefined,
    ...(images.length ? { image: images } : {}),
    sku: product.variant?.sku ?? product.slug,
    brand: { '@type': 'Brand', name: siteConfig.brand },
    category: product.category,
    material: product.materials?.join(', '),
    offers: {
      '@type': 'Offer',
      price: (product.basePriceCents / 100).toFixed(2),
      priceCurrency: 'USD',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: absoluteUrl(`/products/${product.slug}`),
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': storeOrganization['@id'] },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        hasShippingService: { '@id': shippingServiceId },
      },
      hasMerchantReturnPolicy: { '@id': merchantReturnPolicyId },
    },
  };
}
