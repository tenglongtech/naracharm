/**
 * 种子脚本: 把示例产品数据导入本地数据库
 *
 * 用法: 在 apps/web 目录下
 *   set -a && source .env.local && set +a && npx tsx ../../scripts/seed.ts
 *
 * 导入内容:
 * - 2 个系列 (Crystal Collection, Phone Charms)
 * - 8 个产品 + 变体 + 库存 + 图片
 * - 1 个管理员用户 (开发用)
 *
 * 注意: 重复运行会跳过已存在的 (基于 slug 幂等)
 */
import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import {
  collections,
  products,
  productVariants,
  inventory,
  productImages,
} from '../packages/db/schema';

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle({ client, schema: {
  collections,
  products,
  productVariants,
  inventory,
  productImages,
} });

// ─── 系列数据 ────────────────────────────────────────────────────────────
const COLLECTIONS_DATA = [
  {
    slug: 'crystal',
    name: 'Crystal Collection',
    heritage: 'tibetan',
    description: 'Natural stones, each carrying a meaning older than memory.',
    isFeatured: true,
    sortOrder: 1,
  },
  {
    slug: 'charms',
    name: 'Phone Charms',
    heritage: 'fusion',
    description: 'Small charms of stone and cord, that follow you everywhere.',
    isFeatured: true,
    sortOrder: 2,
  },
];

// ─── 产品数据 (价格单位:分) ──────────────────────────────────────────────
const PRODUCTS_DATA = [
  {
    slug: 'amethyst-peace-bracelet',
    name: 'Amethyst Peace Bracelet',
    subtitle: 'Natural amethyst · the stone of calm',
    collectionSlug: 'crystal',
    category: 'bracelet' as const,
    heritage: 'tibetan',
    materials: ['Natural amethyst beads (8mm)', 'Miao silver accent beads', 'Elastic cord'],
    basePriceCents: 3800,
    compareAtPriceCents: 5200,
    status: 'active' as const,
    isFeatured: true,
    craftStory: 'Amethyst has been worn for calm across cultures for thousands of years...',
    shortDesc: 'Natural amethyst beads hand-strung with Miao silver accents.',
    primaryImage: '/products/p01.jpg',
    images: ['/products/p01.jpg', '/products/p07.jpg', '/products/p13.jpg'],
    stock: 24,
    skuPrefix: 'AMETHYST',
  },
  {
    slug: 'strawberry-quartz-bracelet',
    name: 'Strawberry Quartz Bracelet',
    subtitle: 'Strawberry quartz · the stone of joy',
    collectionSlug: 'crystal',
    category: 'bracelet' as const,
    heritage: 'tibetan',
    materials: ['Natural strawberry quartz (8mm)', 'Miao silver beads', 'Elastic cord'],
    basePriceCents: 4200,
    compareAtPriceCents: null,
    status: 'active' as const,
    isFeatured: true,
    craftStory: 'Strawberry quartz catches the light like a summer berry...',
    shortDesc: 'Strawberry quartz beads with a warm, glowing red.',
    primaryImage: '/products/p02.jpg',
    images: ['/products/p02.jpg', '/products/p08.jpg', '/products/p14.jpg'],
    stock: 18,
    skuPrefix: 'STRAWBERRY',
  },
  {
    slug: 'rose-quartz-bracelet',
    name: 'Rose Quartz Bracelet',
    subtitle: 'Rose quartz · the stone of love',
    collectionSlug: 'crystal',
    category: 'bracelet' as const,
    heritage: 'tibetan',
    materials: ['Natural rose quartz (8mm)', 'Miao silver beads', 'Elastic cord'],
    basePriceCents: 3600,
    compareAtPriceCents: 4800,
    status: 'active' as const,
    isFeatured: false,
    craftStory: 'Rose quartz is the oldest love charm known...',
    shortDesc: 'Rose quartz — the stone of unconditional love.',
    primaryImage: '/products/p03.jpg',
    images: ['/products/p03.jpg', '/products/p10.jpg'],
    stock: 30,
    skuPrefix: 'ROSEQ',
  },
  {
    slug: 'obsidian-guard-charm',
    name: 'Obsidian Guard Phone Charm',
    subtitle: 'Black obsidian · the protective stone',
    collectionSlug: 'charms',
    category: 'phone-charm' as const,
    heritage: 'mongol',
    materials: ['Natural black obsidian beads', 'Hand-braided waxed cord', 'Miao silver accent'],
    basePriceCents: 2800,
    compareAtPriceCents: null,
    status: 'active' as const,
    isFeatured: true,
    craftStory: 'Black obsidian has been used as a protective stone since the Stone Age...',
    shortDesc: 'A phone charm of black obsidian and hand-braided cord.',
    primaryImage: '/products/p04.jpg',
    images: ['/products/p04.jpg', '/products/p11.jpg', '/products/p17.jpg'],
    stock: 40,
    skuPrefix: 'OBSIDIAN',
  },
  {
    slug: 'mixed-crystal-bracelet',
    name: 'Mixed Crystal Bracelet',
    subtitle: 'A blend of natural crystals',
    collectionSlug: 'crystal',
    category: 'bracelet' as const,
    heritage: 'fusion',
    materials: ['Amethyst, rose quartz, accent crystals', 'Miao silver beads', 'Elastic cord'],
    basePriceCents: 4500,
    compareAtPriceCents: null,
    status: 'active' as const,
    isFeatured: false,
    craftStory: 'Some pieces are about the conversation between many stones...',
    shortDesc: 'A blend of natural crystals hand-combined for balance.',
    primaryImage: '/products/p06.jpg',
    images: ['/products/p06.jpg', '/products/p12.jpg'],
    stock: 15,
    skuPrefix: 'MIXED',
  },
  {
    slug: 'lotus-jade-bracelet',
    name: 'Lotus Jade Bracelet',
    subtitle: 'Jade-green beads · the stone of wisdom',
    collectionSlug: 'crystal',
    category: 'bracelet' as const,
    heritage: 'han',
    materials: ['Jade-tone stone beads (8mm)', 'Miao silver lotus accent', 'Elastic cord'],
    basePriceCents: 4800,
    compareAtPriceCents: 6400,
    status: 'active' as const,
    isFeatured: true,
    craftStory: 'In the East, jade has been treasured above gold for thousands of years...',
    shortDesc: 'Jade-green beads with a silver lotus accent.',
    primaryImage: '/products/p09.jpg',
    images: ['/products/p09.jpg', '/products/p16.jpg'],
    stock: 20,
    skuPrefix: 'LOTUSJADE',
  },
  {
    slug: 'cinnabar-cord-charm',
    name: 'Cinnabar Cord Phone Charm',
    subtitle: 'Red beads · the color of blessing',
    collectionSlug: 'charms',
    category: 'phone-charm' as const,
    heritage: 'southwest',
    materials: ['Red stone beads', 'Hand-braided waxed cord', 'Miao silver accent'],
    basePriceCents: 2600,
    compareAtPriceCents: null,
    status: 'active' as const,
    isFeatured: false,
    craftStory: 'Across Asia, red is the color of blessing and good fortune...',
    shortDesc: 'A phone charm of warm red beads and hand-braided cord.',
    primaryImage: '/products/p15.jpg',
    images: ['/products/p15.jpg', '/products/p20.jpg'],
    stock: 35,
    skuPrefix: 'CINNABAR',
  },
  {
    slug: 'turquoise-sky-bracelet',
    name: 'Turquoise Sky Bracelet',
    subtitle: 'Turquoise · a piece of open sky',
    collectionSlug: 'crystal',
    category: 'bracelet' as const,
    heritage: 'tibetan',
    materials: ['Natural turquoise beads (8mm)', 'Miao silver beads', 'Elastic cord'],
    basePriceCents: 4400,
    compareAtPriceCents: 5800,
    status: 'active' as const,
    isFeatured: true,
    craftStory: 'In Tibet, turquoise is a piece of the sky that fell and stayed...',
    shortDesc: 'Turquoise beads — the color of an open sky.',
    primaryImage: '/products/p19.jpg',
    images: ['/products/p19.jpg', '/products/p21.jpg'],
    stock: 12,
    skuPrefix: 'TURQ',
  },
];

async function seed() {
  console.log('🌱 开始导入种子数据...\n');

  // 1. 系列
  console.log('导入系列...');
  const collectionMap: Record<string, string> = {};
  for (const c of COLLECTIONS_DATA) {
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

  // 2. 产品 + 变体 + 库存 + 图片
  console.log('\n导入产品...');
  for (const p of PRODUCTS_DATA) {
    const existing = await db.query.products.findFirst({ where: (prods, { eq }) => eq(prods.slug, p.slug) });
    if (existing) {
      console.log(`  [跳过] ${p.name} (已存在)`);
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
      craftStory: p.craftStory,
    }).returning();

    // 默认变体
    const [variant] = await db.insert(productVariants).values({
      productId: product.id,
      sku: `${p.skuPrefix}-DEFAULT`,
      name: 'Default',
      priceCents: p.basePriceCents,
      weightGrams: 12,
    }).returning();

    // 库存
    await db.insert(inventory).values({
      variantId: variant.id,
      quantity: p.stock,
      reserved: 0,
    });

    // 图片
    for (let i = 0; i < p.images.length; i++) {
      await db.insert(productImages).values({
        productId: product.id,
        url: p.images[i],
        altText: p.name,
        sortOrder: i,
        isPrimary: i === 0,
      });
    }

    console.log(`  [新增] ${p.name} (库存 ${p.stock})`);
  }

  console.log('\n✅ 种子数据导入完成!');
  console.log(`   系列: ${COLLECTIONS_DATA.length} 个`);
  console.log(`   产品: ${PRODUCTS_DATA.length} 个 (含变体/库存/图片)`);

  await client.end();
}

seed().catch((err) => {
  console.error('❌ 导入失败:', err);
  process.exit(1);
});
