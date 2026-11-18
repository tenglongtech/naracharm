import type { StorefrontProduct } from './storefront';
import { searchableProductPhotos } from './product-media';

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

const productTypes: Record<StorefrontProduct['category'], string> = {
  bracelet: 'Apparel & Accessories > Jewelry > Bracelets',
  necklace: 'Apparel & Accessories > Jewelry > Necklaces',
  earrings: 'Apparel & Accessories > Jewelry > Earrings',
  'phone-charm': 'Electronics Accessories > Mobile Phone Accessories > Phone Charms',
};

export function renderGoogleFeed(products: readonly StorefrontProduct[], siteUrl: string, brand = 'Nara Charm'): string {
  const absolute = (value: string) => escapeXml(new URL(value, siteUrl).href);
  const items = products.flatMap((product) => {
    const [primaryImage, ...images] = searchableProductPhotos(product);
    if (!primaryImage || product.basePriceCents <= 0) return [];
    const description = product.description || product.seoDescription || product.subtitle || product.name;
    const descriptionXml = product.descriptionSource === 'trained_algorithmic_media'
      ? `<g:structured_description><g:digital_source_type>trained_algorithmic_media</g:digital_source_type><g:content>${escapeXml(description)}</g:content></g:structured_description>`
      : `<g:description>${escapeXml(description)}</g:description>`;
    return [`    <item>
      <g:id>${escapeXml(product.slug)}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      ${descriptionXml}
      <g:link>${absolute('/products/' + product.slug)}</g:link>
      <g:image_link>${absolute(primaryImage)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${product.stock > 0 ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${(product.basePriceCents / 100).toFixed(2)} USD</g:price>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:product_type>${escapeXml(productTypes[product.category])}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>${
        product.materials?.length ? '\n      <g:material>' + escapeXml(product.materials.join(', ')) + '</g:material>' : ''
      }${
        images.slice(0, 10).map((image) => '\n      <g:additional_image_link>' + absolute(image) + '</g:additional_image_link>').join('')
      }
    </item>`];
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${escapeXml(brand)} Jewelry</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>Bracelets, necklaces, earrings and phone charms from ${escapeXml(brand)}.</description>
${items.join('\n')}
  </channel>
</rss>
`;
}
