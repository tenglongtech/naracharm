import { siteConfig } from './site-config';
import type { StorefrontProduct } from './storefront';
import { productIndexPhotos, searchableVariantPhotos } from './product-media';
import { productOfferPath, variantOption, variantTitle } from './storefront-offer';

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

function offer(path: string, cents: number, stock: number) {
  return {
    '@type': 'Offer',
    price: (cents / 100).toFixed(2),
    priceCurrency: 'USD',
    availability: stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    url: absoluteUrl(path),
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': storeOrganization['@id'] },
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      hasShippingService: { '@id': shippingServiceId },
    },
    hasMerchantReturnPolicy: { '@id': merchantReturnPolicyId },
  };
}

export function productSchema(product: StorefrontProduct) {
  const images = productIndexPhotos(product).map(absoluteUrl);
  const basePath = productOfferPath(product.slug);
  const common = {
    description: product.description || product.subtitle || undefined,
    brand: { '@type': 'Brand', name: siteConfig.brand },
    category: product.category,
    material: product.materials?.join(', '),
  };
  if (product.variants && product.variants.length > 1) {
    const option = variantOption(product.variants);
    return {
      '@context': 'https://schema.org',
      '@type': 'ProductGroup' as const,
      name: product.name,
      ...common,
      ...(images.length ? { image: images } : {}),
      productGroupID: product.id,
      url: absoluteUrl(basePath),
      hasVariant: product.variants.map((variant) => {
        const variantImages = searchableVariantPhotos(product, variant).map(absoluteUrl);
        return {
          '@type': 'Product',
          ...common,
          ...(variantImages.length ? { image: variantImages } : {}),
          name: variantTitle(product.name, variant),
          sku: variant.sku,
          additionalProperty: {
            '@type': 'PropertyValue', name: option, value: option === 'SKU' ? variant.sku : variant.name,
          },
          offers: offer(productOfferPath(product.slug, variant.sku), variant.unitPriceCents, variant.stock),
        };
      }),
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product' as const,
    name: product.name,
    ...common,
    ...(images.length ? { image: images } : {}),
    sku: product.variant?.sku ?? product.slug,
    offers: offer(basePath, product.basePriceCents, product.stock),
  };
}

export function catalogProductSchema(product: StorefrontProduct) {
  const schema = productSchema(product);
  if (schema['@type'] === 'ProductGroup') {
    return { ...schema, hasVariant: schema.hasVariant.map(({ offers, ...variant }) => variant) };
  }
  const { offers, ...details } = schema;
  return details;
}
