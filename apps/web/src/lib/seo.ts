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

type EntityReference = { '@type': 'Thing'; name: string; sameAs: string };

const knowledgeEntities: readonly { pattern: RegExp; entity: EntityReference }[] = [
  { pattern: /\btibetan[\s-]+silver\b/i, entity: { '@type': 'Thing', name: 'Tibetan silver', sameAs: 'https://en.wikipedia.org/wiki/Tibetan_silver' } },
  { pattern: /\b(?:925|sterling)[\s-]+silver\b/i, entity: { '@type': 'Thing', name: 'Sterling silver', sameAs: 'https://en.wikipedia.org/wiki/Sterling_silver' } },
  { pattern: /\bfiligree\b/i, entity: { '@type': 'Thing', name: 'Filigree', sameAs: 'https://en.wikipedia.org/wiki/Filigree' } },
  { pattern: /\bturquoise\b/i, entity: { '@type': 'Thing', name: 'Turquoise', sameAs: 'https://en.wikipedia.org/wiki/Turquoise' } },
  { pattern: /\bhowlite\b/i, entity: { '@type': 'Thing', name: 'Howlite', sameAs: 'https://en.wikipedia.org/wiki/Howlite' } },
  { pattern: /\bamethyst\b/i, entity: { '@type': 'Thing', name: 'Amethyst', sameAs: 'https://en.wikipedia.org/wiki/Amethyst' } },
  { pattern: /\brose[\s-]+quartz\b/i, entity: { '@type': 'Thing', name: 'Rose quartz', sameAs: 'https://en.wikipedia.org/wiki/Quartz#Rose_quartz' } },
  { pattern: /\bcitrine\b/i, entity: { '@type': 'Thing', name: 'Citrine', sameAs: 'https://en.wikipedia.org/wiki/Citrine' } },
  { pattern: /\bobsidian\b/i, entity: { '@type': 'Thing', name: 'Obsidian', sameAs: 'https://en.wikipedia.org/wiki/Obsidian' } },
  { pattern: /\bhematite\b/i, entity: { '@type': 'Thing', name: 'Hematite', sameAs: 'https://en.wikipedia.org/wiki/Hematite' } },
  { pattern: /\bunakite\b/i, entity: { '@type': 'Thing', name: 'Unakite', sameAs: 'https://en.wikipedia.org/wiki/Unakite' } },
  { pattern: /\bjade\b/i, entity: { '@type': 'Thing', name: 'Jade', sameAs: 'https://en.wikipedia.org/wiki/Jade' } },
  { pattern: /\bsilk\b/i, entity: { '@type': 'Thing', name: 'Thai silk', sameAs: 'https://en.wikipedia.org/wiki/Thai_silk' } },
  { pattern: /\bcinnabar\b/i, entity: { '@type': 'Thing', name: 'Cinnabar', sameAs: 'https://en.wikipedia.org/wiki/Cinnabar' } },
];

export function extractKnowledgeEntities(text: string): EntityReference[] {
  return knowledgeEntities
    .filter(({ pattern }) => pattern.test(text))
    .map(({ entity }) => entity);
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
  const entities = extractKnowledgeEntities([product.name, product.description, ...(product.materials ?? [])].filter(Boolean).join(' '));
  const common = {
    description: product.description || product.subtitle || undefined,
    brand: { '@type': 'Brand', name: siteConfig.brand },
    category: product.category,
    material: product.materials?.join(', '),
    ...(entities.length ? { isSimilarTo: entities } : {}),
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
