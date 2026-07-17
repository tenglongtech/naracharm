/**
 * 种子脚本: 导入10个计划产品
 * 用法: cd apps/web && set -a && source .env.local && set +a && npx tsx ../../scripts/seed-products.ts
 */
import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import {
  collections, products, productVariants, inventory, productImages,
} from '../packages/db/schema';
import { eq } from 'drizzle-orm';

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle({ client, schema: { collections, products, productVariants, inventory, productImages } });

const NEW_COLLECTIONS = [
  { slug: 'tibetan-silver', name: 'Tibetan Silver', heritage: 'tibetan', description: 'Silver amulets and prayer symbols from the Tibetan plateau.', isFeatured: true, sortOrder: 3 },
  { slug: 'mongolian-steppe', name: 'Mongolian Steppe', heritage: 'mongol', description: 'Knots and cords inspired by the endless steppe.', isFeatured: true, sortOrder: 4 },
  { slug: 'southwest-filigree', name: 'Southwest Filigree', heritage: 'southwest', description: 'Intricate Miao silver filigree from the mountains of Southwest China.', isFeatured: true, sortOrder: 5 },
  { slug: 'han-jade', name: 'Han Jade', heritage: 'han', description: 'Jade and lotus motifs from the Han literati tradition.', isFeatured: true, sortOrder: 6 },
  { slug: 'tai-silk', name: 'Thai Silk', heritage: 'tai', description: 'Silk cords and charms from the tropical north of Thailand.', isFeatured: true, sortOrder: 7 },
  { slug: 'caravan-fusion', name: 'Caravan Fusion', heritage: 'fusion', description: 'Where cultures meet — fusion pieces born from the ancient caravan roads.', isFeatured: true, sortOrder: 8 },
];

const NEW_PRODUCTS = [
  { slug: 'tibetan-amulet-925-bracelet', name: 'Tibetan Amulet 925 Bracelet', subtitle: 'A sacred amulet on braided cord', collectionSlug: 'tibetan-silver', category: 'bracelet' as const, heritage: 'tibetan', materials: ['925 silver amulet charm', 'Braided cord', 'Natural stone accent beads'], basePriceCents: 5800, compareAtPriceCents: null, status: 'active' as const, isFeatured: true, shortDesc: 'A Tibetan-inspired amulet bracelet with 925 silver and braided cord.', primaryImage: '/products/placeholder-01.svg', images: ['/products/placeholder-01.svg'] },
  { slug: 'mongolian-road-knot-cord', name: 'Mongolian Road Knot Cord', subtitle: 'The knot that counts home', collectionSlug: 'mongolian-steppe', category: 'bracelet' as const, heritage: 'mongol', materials: ['Waxed cotton cord', 'Silver accent bead', 'Adjustable knot closure'], basePriceCents: 4200, compareAtPriceCents: null, status: 'active' as const, isFeatured: true, shortDesc: 'A Mongolian road knot cord bracelet — hand-braided for protection.', primaryImage: '/products/placeholder-01.svg', images: ['/products/placeholder-01.svg'] },
  { slug: 'miao-filigree-drop-earrings', name: 'Miao Filigree Drop Earrings', subtitle: '300-year-old silver craft', collectionSlug: 'southwest-filigree', category: 'earrings' as const, heritage: 'southwest', materials: ['Miao silver (traditional alloy)', 'Filigree wirework', 'Sterling silver hooks'], basePriceCents: 6800, compareAtPriceCents: null, status: 'active' as const, isFeatured: true, shortDesc: 'Miao filigree drop earrings — handmade using 300-year-old techniques.', primaryImage: '/products/placeholder-01.svg', images: ['/products/placeholder-01.svg'] },
  { slug: 'han-jade-lotus-pendant', name: 'Han Jade Lotus Pendant', subtitle: 'Jade — the stone of wisdom', collectionSlug: 'han-jade', category: 'necklace' as const, heritage: 'han', materials: ['Jade-tone stone pendant', 'Waxed cord necklace', 'Silver accent bead'], basePriceCents: 9600, compareAtPriceCents: null, status: 'active' as const, isFeatured: true, shortDesc: 'A Han-style lotus pendant in jade-green on a waxed cord.', primaryImage: '/products/placeholder-01.svg', images: ['/products/placeholder-01.svg'] },
  { slug: 'tai-silk-cord-phone-charm', name: 'Thai Silk Cord Phone Charm', subtitle: 'Silk that holds the light', collectionSlug: 'tai-silk', category: 'phone-charm' as const, heritage: 'tai', materials: ['Silk cord', 'Stone charm bead', 'Silver accent'], basePriceCents: 3200, compareAtPriceCents: null, status: 'active' as const, isFeatured: true, shortDesc: 'A phone charm with Thai silk cord and natural stone.', primaryImage: '/products/placeholder-01.svg', images: ['/products/placeholder-01.svg'] },
  { slug: 'hadas-knot-red-cord', name: 'Hada Knot Red Cord', subtitle: 'A blessing in red', collectionSlug: 'tibetan-silver', category: 'bracelet' as const, heritage: 'tibetan', materials: ['Red cord', 'Brass accent beads', 'Adjustable knot'], basePriceCents: 3800, compareAtPriceCents: null, status: 'active' as const, isFeatured: false, shortDesc: 'A red Hada knot cord — symbol of blessing and protection.', primaryImage: '/products/placeholder-01.svg', images: ['/products/placeholder-01.svg'] },
  { slug: 'obsidian-guardian-charm', name: 'Obsidian Guardian Charm', subtitle: 'The protective stone', collectionSlug: 'mongolian-steppe', category: 'phone-charm' as const, heritage: 'mongol', materials: ['Natural black obsidian', 'Waxed cord', 'Silver accent bead'], basePriceCents: 2800, compareAtPriceCents: null, status: 'active' as const, isFeatured: false, shortDesc: 'An obsidian phone charm for protection and grounding.', primaryImage: '/products/placeholder-01.svg', images: ['/products/placeholder-01.svg'] },
  { slug: 'caravan-fusion-necklace', name: 'Caravan Fusion Necklace', subtitle: 'Where cultures meet', collectionSlug: 'caravan-fusion', category: 'necklace' as const, heritage: 'fusion', materials: ['Mixed stone beads', 'Silver accents', 'Waxed cord'], basePriceCents: 11800, compareAtPriceCents: null, status: 'active' as const, isFeatured: true, shortDesc: 'A fusion necklace born from the ancient caravan routes.', primaryImage: '/products/placeholder-01.svg', images: ['/products/placeholder-01.svg'] },
  { slug: 'amethyst-calm-bracelet', name: 'Amethyst Calm Bracelet', subtitle: 'Deep purple · the stone of calm', collectionSlug: 'crystal', category: 'bracelet' as const, heritage: 'tibetan', materials: ['Natural amethyst beads (8mm)', 'Silver accent beads', 'Elastic cord'], basePriceCents: 4400, compareAtPriceCents: null, status: 'active' as const, isFeatured: false, shortDesc: 'Deep amethyst beads hand-strung for calm and clarity.', primaryImage: '/products/placeholder-01.svg', images: ['/products/placeholder-01.svg'] },
  { slug: 'rose-quartz-tenderness-bracelet', name: 'Rose Quartz Tenderness Bracelet', subtitle: 'Soft pink · the stone of love', collectionSlug: 'crystal', category: 'bracelet' as const, heritage: 'tibetan', materials: ['Natural rose quartz beads (8mm)', 'Silver accent beads', 'Elastic cord'], basePriceCents: 4400, compareAtPriceCents: null, status: 'active' as const, isFeatured: false, shortDesc: 'Soft pink rose quartz beads for tenderness and self-love.', primaryImage: '/products/placeholder-01.svg', images: ['/products/placeholder-01.svg'] },
];

async function seed() {
  console.log('🌱 导入新产品 + 系列...\n');

  // 1. Collections
  console.log('导入系列...');
  const collectionMap: Record<string, string> = {};
  for (const c of NEW_COLLECTIONS) {
    const existing = await db.query.collections.findFirst({ where: (cols, { eq }) => eq(cols.slug, c.slug) });
    if (existing) {
      console.log(`  [跳过] ${c.name} (已存在)`);
      collectionMap[c.slug] = existing.id;
      continue;
    }
    const [created] = await db.insert(collections).values(c).returning();
    console.log(`  [新增] ${created.name}`);
    collectionMap[c.slug] = created.id;
  }

  // 2. Products
  console.log('\n导入产品...');
  for (const p of NEW_PRODUCTS) {
    const existing = await db.query.products.findFirst({ where: (prods, { eq }) => eq(prods.slug, p.slug) });
    if (existing) {
      console.log(`  [跳过] ${p.name}`);
      continue;
    }
    const [product] = await db.insert(products).values({
      slug: p.slug,
      name: p.name,
      subtitle: p.subtitle,
      description: p.shortDesc,
      category: p.category,
      collectionId: collectionMap[p.collectionSlug],
      heritage: p.heritage,
      materials: p.materials,
      basePriceCents: p.basePriceCents,
      compareAtPriceCents: p.compareAtPriceCents,
      status: p.status,
      isFeatured: p.isFeatured,
      seoTitle: p.name,
      seoDescription: p.shortDesc,
    }).returning();

    console.log(`  [新增] ${product.name}`);

    // Variant
    const variantName = p.category === 'bracelet' ? 'Standard (17cm)' : p.category === 'necklace' ? '18 in' : 'One size';
    const [variant] = await db.insert(productVariants).values({
      productId: product.id,
      sku: p.slug.toUpperCase().replace(/-/g, '_') + '_STD',
      name: variantName,
      priceCents: p.basePriceCents,
      weightGrams: p.category === 'earrings' ? 8 : p.category === 'necklace' ? 25 : 12,
    }).returning();

    // Inventory
    await db.insert(inventory).values({
      variantId: variant.id,
      quantity: 50,
      reserved: 0,
      allowBackorder: false,
      lowStockThreshold: 5,
    });

    // Images
    for (let i = 0; i < p.images.length; i++) {
      await db.insert(productImages).values({
        productId: product.id,
        url: p.images[i],
        altText: `${p.name} view ${i + 1}`,
        sortOrder: i,
        isPrimary: i === 0,
      });
    }
  }

  console.log('\n✅ 完成!');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
