/**
 * 种子脚本: 导入5个新产品 (SEO 覆盖面扩充)
 * 用法: cd apps/web && set -a && source .env.local && set +a && npx tsx ../../scripts/seed-more-products-2.ts
 */
import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import {
  collections, products, productVariants, inventory, productImages,
} from '../packages/db/schema';

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle({ client, schema: { collections, products, productVariants, inventory, productImages } });

const NEW_PRODUCTS = [
  {
    slug: 'amethyst-earrings-silver',
    name: 'Amethyst Drop Earrings',
    subtitle: 'Purple amethyst · sterling silver',
    collectionSlug: 'crystal',
    category: 'earrings' as const,
    heritage: 'tibetan',
    materials: ['Natural amethyst drops', 'Sterling silver earwire', 'Silver accent bead'],
    basePriceCents: 5400,
    isFeatured: true,
    shortDesc: 'Amethyst drop earrings with sterling silver — deep purple crystals for calm and clarity.',
  },
  {
    slug: 'citrine-bracelet-abundance',
    name: 'Citrine Abundance Bracelet',
    subtitle: 'Golden citrine · the merchant\'s stone',
    collectionSlug: 'crystal',
    category: 'bracelet' as const,
    heritage: 'fusion',
    materials: ['Natural citrine beads (8mm)', 'Silver accent beads', 'Elastic cord'],
    basePriceCents: 4800,
    isFeatured: true,
    shortDesc: 'Golden citrine beads hand-strung for abundance and joy — the merchant\'s stone.',
  },
  {
    slug: 'howlite-turquoise-bracelet',
    name: 'Howlite Turquoise Bracelet',
    subtitle: 'White howlite · turquoise-dyed',
    collectionSlug: 'charms',
    category: 'bracelet' as const,
    heritage: 'southwest',
    materials: ['Turquoise-dyed howlite beads (8mm)', 'Silver accent beads', 'Elastic cord'],
    basePriceCents: 3400,
    isFeatured: false,
    shortDesc: 'Turquoise-dyed howlite beads with silver accents — the look of turquoise at an accessible price.',
  },
  {
    slug: 'hematite-bracelet-mens',
    name: 'Hematite Men\'s Bracelet',
    subtitle: 'Black hematite · the grounding stone',
    collectionSlug: 'mongolian-steppe',
    category: 'bracelet' as const,
    heritage: 'mongol',
    materials: ['Natural hematite beads (10mm)', 'Waxed cord', 'Silver accent'],
    basePriceCents: 3800,
    isFeatured: false,
    shortDesc: 'Matte black hematite beads on waxed cord — the grounding stone for focus and protection.',
  },
  {
    slug: 'unakite-bracelet-balance',
    name: 'Unakite Balance Bracelet',
    subtitle: 'Green & pink · the stone of balance',
    collectionSlug: 'crystal',
    category: 'bracelet' as const,
    heritage: 'fusion',
    materials: ['Natural unakite beads (8mm)', 'Silver accent beads', 'Elastic cord'],
    basePriceCents: 4200,
    isFeatured: false,
    shortDesc: 'Green and pink unakite beads — the stone of emotional balance and patience.',
  },
];

async function seed() {
  console.log('🌱 导入5个SEO扩展产品...\n');
  const allCollections = await db.query.collections.findMany();
  const collectionMap: Record<string, string> = {};
  for (const c of allCollections) collectionMap[c.slug] = c.id;

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
      status: 'active' as const,
      isFeatured: p.isFeatured,
      seoTitle: p.name,
      seoDescription: p.shortDesc,
    }).returning();
    console.log(`  [新增] ${product.name}`);

    const [variant] = await db.insert(productVariants).values({
      productId: product.id,
      sku: p.slug.toUpperCase().replace(/-/g, '_') + '_STD',
      name: 'Standard',
      priceCents: p.basePriceCents,
      weightGrams: p.category === 'earrings' ? 8 : 12,
    }).returning();

    await db.insert(inventory).values({ variantId: variant.id, quantity: 40 });
    await db.insert(productImages).values({
      productId: product.id, url: '/products/placeholder-01.svg',
      altText: p.name, sortOrder: 0, isPrimary: true,
    });
  }

  console.log('\n✅ 5个SEO产品导入完成!');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
