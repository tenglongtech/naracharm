/**
 * 种子脚本: 导入6个附加产品
 * 用法: cd apps/web && set -a && source .env.local && set +a && npx tsx ../../scripts/seed-more-products.ts
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

const NEW_PRODUCTS = [
  {
    slug: 'lapis-lazuli-bracelet',
    name: 'Lapis Lazuli Bracelet',
    subtitle: 'Royal blue · the stone of truth',
    collectionSlug: 'crystal',
    category: 'bracelet' as const,
    heritage: 'fusion',
    materials: ['Natural lapis lazuli beads (8mm)', 'Silver accent beads', 'Elastic cord'],
    basePriceCents: 4600,
    status: 'active' as const,
    isFeatured: true,
    shortDesc: 'Deep royal blue lapis lazuli beads with silver accents — the stone of truth and inner power.',
    primaryImage: '/products/placeholder-01.svg',
  },
  {
    slug: 'malachite-drop-earrings',
    name: 'Malachite Drop Earrings',
    subtitle: 'Deep green · the stone of transformation',
    collectionSlug: 'southwest-filigree',
    category: 'earrings' as const,
    heritage: 'southwest',
    materials: ['Natural malachite drops', 'Sterling silver earwire', 'Silver accent bead'],
    basePriceCents: 5800,
    status: 'active' as const,
    isFeatured: true,
    shortDesc: 'Malachite drop earrings with sterling silver earwires — deep green bands of natural beauty.',
    primaryImage: '/products/placeholder-01.svg',
  },
  {
    slug: 'tibetan-silver-pendant-necklace',
    name: 'Tibetan Silver Pendant Necklace',
    subtitle: 'Sacred silver · the amulet of protection',
    collectionSlug: 'tibetan-silver',
    category: 'necklace' as const,
    heritage: 'tibetan',
    materials: ['925 silver pendant', 'Braided cord', 'Natural stone accent'],
    basePriceCents: 7200,
    status: 'active' as const,
    isFeatured: true,
    shortDesc: 'A Tibetan-inspired silver pendant on braided cord — a daily amulet of protection and blessing.',
    primaryImage: '/products/placeholder-01.svg',
  },
  {
    slug: 'tiger-eye-phone-charm',
    name: 'Tiger Eye Phone Charm',
    subtitle: 'Gold-brown · the stone of courage',
    collectionSlug: 'charms',
    category: 'phone-charm' as const,
    heritage: 'mongol',
    materials: ['Natural tiger eye beads', 'Waxed cord', 'Silver accent'],
    basePriceCents: 2800,
    status: 'active' as const,
    isFeatured: false,
    shortDesc: 'A tiger eye phone charm for courage and focused intention — gold-brown shimmer on braided cord.',
    primaryImage: '/products/placeholder-01.svg',
  },
  {
    slug: 'red-coral-knot-bracelet',
    name: 'Red Coral Knot Bracelet',
    subtitle: 'Warm red · the color of blessing',
    collectionSlug: 'caravan-fusion',
    category: 'bracelet' as const,
    heritage: 'fusion',
    materials: ['Red coral beads', 'Hand-tied cord', 'Brass accent'],
    basePriceCents: 4800,
    status: 'active' as const,
    isFeatured: true,
    shortDesc: 'A warm red coral knot bracelet with brass accents — hand-tied for blessing and protection.',
    primaryImage: '/products/placeholder-01.svg',
  },
  {
    slug: 'moonstone-ring',
    name: 'Moonstone Ring',
    subtitle: 'White moon · the stone of new beginnings',
    collectionSlug: 'crystal',
    category: 'bracelet' as const,
    heritage: 'fusion',
    materials: ['Natural moonstone', 'Silver-plated band', 'Adjustable sizing'],
    basePriceCents: 3600,
    status: 'active' as const,
    isFeatured: false,
    shortDesc: 'A natural moonstone ring with an adjustable silver-plated band — the stone of inner growth and intuition.',
    primaryImage: '/products/placeholder-01.svg',
  },
];

async function seed() {
  console.log('🌱 导入6个附加产品...\n');

  // Get existing collections
  const allCollections = await db.query.collections.findMany();
  const collectionMap: Record<string, string> = {};
  for (const c of allCollections) collectionMap[c.slug] = c.id;

  console.log('导入产品...');
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
      status: p.status,
      isFeatured: p.isFeatured,
      seoTitle: p.name,
      seoDescription: p.shortDesc,
    }).returning();

    console.log(`  [新增] ${product.name}`);

    const variantName = p.category === 'bracelet' ? 'Standard (17cm)' : p.category === 'necklace' ? '18 in' : 'One size';
    const [variant] = await db.insert(productVariants).values({
      productId: product.id,
      sku: p.slug.toUpperCase().replace(/-/g, '_') + '_STD',
      name: variantName,
      priceCents: p.basePriceCents,
      weightGrams: p.category === 'earrings' ? 8 : 12,
    }).returning();

    await db.insert(inventory).values({
      variantId: variant.id,
      quantity: 40,
    });

    await db.insert(productImages).values({
      productId: product.id,
      url: p.primaryImage,
      altText: p.name,
      sortOrder: 0,
      isPrimary: true,
    });
  }

  console.log('\n✅ 附加产品导入完成!');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
