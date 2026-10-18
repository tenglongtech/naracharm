import * as fs from 'fs';
import * as path from 'path';

/**
 * 自动生成 Google Merchant Center (GMC) 免费商品 Listing XML Feed
 * 规范：RSS 2.0 + Google Product Feed Namespace (http://base.google.com/ns/1.0)
 * 产物路径：apps/web/public/google-feed.xml
 */

interface ProductData {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  description?: string;
  category: string;
  heritage?: string;
  materials?: string[];
  basePriceCents: number;
  compareAtPriceCents?: number | null;
  primaryImage?: string;
  images?: string[];
  stock: number;
  seoTitle?: string;
  seoDescription?: string;
  availability?: string;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getProductType(category: string): string {
  switch (category) {
    case 'bracelet':
      return 'Apparel &amp; Accessories &gt; Jewelry &gt; Bracelets';
    case 'necklace':
      return 'Apparel &amp; Accessories &gt; Jewelry &gt; Necklaces';
    case 'earrings':
      return 'Apparel &amp; Accessories &gt; Jewelry &gt; Earrings';
    case 'phone-charm':
      return 'Electronics Accessories &gt; Mobile Phone Accessories &gt; Phone Charms';
    default:
      return 'Apparel &amp; Accessories &gt; Jewelry';
  }
}

function generateGoogleFeed() {
  const rootDir = path.resolve(__dirname, '..');
  const productsPath = path.join(rootDir, 'apps/web/src/data/products.json');
  const outputPath = path.join(rootDir, 'apps/web/public/google-feed.xml');

  if (!fs.existsSync(productsPath)) {
    console.error('Error: products.json not found at', productsPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(productsPath, 'utf8');
  const products: ProductData[] = JSON.parse(raw);
  const siteUrl = 'https://naracharm.com';

  const itemsXml = products
    .filter((p) => p.availability !== 'preview') // 仅导出正式可购单品
    .map((p) => {
      const title = escapeXml(p.seoTitle || p.name);
      const desc = escapeXml(p.seoDescription || p.description || p.subtitle || p.name);
      const link = `${siteUrl}/products/${p.slug}`;
      const imgLink = p.primaryImage ? (p.primaryImage.startsWith('http') ? p.primaryImage : `${siteUrl}${p.primaryImage}`) : `${siteUrl}/products/p01.jpg`;
      const price = `${(p.basePriceCents / 100).toFixed(2)} USD`;
      const availability = p.stock > 0 ? 'in_stock' : 'out_of_stock';
      const materials = p.materials?.length ? escapeXml(p.materials.join(', ')) : '925 silver, natural gemstones';
      const isFreeShipping = p.basePriceCents >= 12000;
      const shippingCost = isFreeShipping ? '0.00 USD' : '9.99 USD';
      const productType = getProductType(p.category);

      let extraImagesXml = '';
      if (p.images && p.images.length > 1) {
        extraImagesXml = p.images
          .slice(1, 6)
          .map((img) => `<g:additional_image_link>${img.startsWith('http') ? img : `${siteUrl}${img}`}</g:additional_image_link>`)
          .join('\n        ');
      }

      return `    <item>
      <g:id>${escapeXml(p.slug)}</g:id>
      <g:title>${title}</g:title>
      <g:description>${desc}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imgLink}</g:image_link>
      ${extraImagesXml ? `${extraImagesXml}\n      ` : ''}<g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:brand>Nara Charm</g:brand>
      <g:google_product_category>188</g:google_product_category>
      <g:product_type>${productType}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:material>${materials}</g:material>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Standard Tracked Delivery</g:service>
        <g:price>${shippingCost}</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>CA</g:country>
        <g:service>Standard Tracked Delivery</g:service>
        <g:price>${shippingCost}</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>GB</g:country>
        <g:service>Standard Tracked Delivery</g:service>
        <g:price>${shippingCost}</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>AU</g:country>
        <g:service>Standard Tracked Delivery</g:service>
        <g:price>${shippingCost}</g:price>
      </g:shipping>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Nara Charm - Handmade Heritage &amp; Healing Jewelry</title>
    <link>${siteUrl}</link>
    <description>Handmade beaded bracelets, natural stone necklaces, Tibetan silver jewelry &amp; boho phone charms carrying living cultural stories.</description>
${itemsXml}
  </channel>
</rss>
`;

  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`Successfully generated Google Merchant Center Feed at: ${outputPath}`);
}

generateGoogleFeed();
