/**
 * 种子脚本 v2 · 占位 SKU (10 个) + 5 个文化系列 + admin 账号引导
 *
 * 用法 (在 apps/web 目录下):
 *   set -a && source .env.local && set +a && npx tsx ../../scripts/seed-placeholders.ts
 *
 * 导入内容:
 * - 5 个系列: Tibetan / Mongolian / Southwest / Han / Tai (+ Fusion 融合款系列)
 * - 10 个产品 (按 STORY_DOCTRINE 五脉络分布) + 变体 + 库存 + 图片
 * - admin 账号: 若不存在则提示用 /register 注册后跑 create-admin.ts
 *
 * 与 scripts/seed.ts 兼容 (基于 slug 幂等, 重复运行安全)
 */
import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, sql } from 'drizzle-orm';
import {
  collections,
  products,
  productVariants,
  inventory,
  productImages,
  users,
} from '../packages/db/schema';

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle({ client, schema: { collections, products, productVariants, inventory, productImages, users } });

// ─── 系列数据 ────────────────────────────────────────────────────────────
const COLLECTIONS_DATA = [
  {
    slug: 'tibetan-silver',
    name: 'Tibetan Silver',
    heritage: 'tibetan',
    description: 'Hand-hammered amulets and turquoise-set pieces, in the workshops of Lhasa.',
    isFeatured: true,
    sortOrder: 1,
  },
  {
    slug: 'mongolian-steppe',
    name: 'Mongolian Steppe',
    heritage: 'mongol',
    description: 'Hand-braided cords, sliding knots, and protective stones for the road.',
    isFeatured: true,
    sortOrder: 2,
  },
  {
    slug: 'southwest-filigree',
    name: 'Southwest Filigree',
    heritage: 'southwest',
    description: 'Miao silversmith filigree — hair-thin silver wires, hand-coiled into living shapes.',
    isFeatured: true,
    sortOrder: 3,
  },
  {
    slug: 'han-jade',
    name: 'Han Jade',
    heritage: 'han',
    description: 'Jade pendants and cord-knot pieces — the quiet, restrained language of the literati.',
    isFeatured: true,
    sortOrder: 4,
  },
  {
    slug: 'tai-silk',
    name: 'Thai Silk',
    heritage: 'tai',
    description: 'Hand-woven silk cords and phone charms, carrying the slow light of the tropics.',
    isFeatured: true,
    sortOrder: 5,
  },
  {
    slug: 'caravan-fusion',
    name: 'Caravan Fusion',
    heritage: 'fusion',
    description: 'Where roots meet — silver, silk, and turquoise from the caravan roads of the Silk Road.',
    isFeatured: true,
    sortOrder: 6,
  },
];

// ─── 产品数据 (价格单位:分) ──────────────────────────────────────────────
type ProductSeed = {
  slug: string;
  name: string;
  subtitle: string;
  shortDesc: string;
  craftStory: string;
  careNotes: string;
  category: 'phone-charm' | 'necklace' | 'bracelet' | 'earrings';
  heritage: string;
  collectionSlug: string;
  materials: string[];
  basePriceCents: number;
  compareAtPriceCents: number | null;
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
  weightGrams: number;
  stock: number;
  skuPrefix: string;
  images: string[];
};

const PRODUCTS_DATA: ProductSeed[] = [
  {
    slug: 'tibetan-amulet-925-bracelet',
    name: 'Tibetan Amulet 925 Bracelet',
    subtitle: 'Hammered silver · turquoise · the sky held still',
    shortDesc: 'A small 925 silver amulet, hand-hammered in the workshops of Lhasa, with a single turquoise stone set at its center. Made to be worn daily, close to the skin.',
    craftStory: `In the workshops of Lhasa, silversmiths have been hammering small amulets like this one for as long as anyone remembers. Each piece is hand-cut, hand-hammered, and set with a single turquoise stone chosen by eye — no two are quite the same. Turquoise is what Tibetans call "the sky, held still" — a piece of fallen heaven, given at birth, carried for protection. You may never walk the plateau. But the day you put this on, you carry a small piece of that sky with you.`,
    careNotes: 'Avoid prolonged water contact. Clean with a soft dry cloth. Store away from direct sunlight to preserve turquoise color.',
    category: 'bracelet',
    heritage: 'tibetan',
    collectionSlug: 'tibetan-silver',
    materials: ['925 silver amulet (12mm)', 'Hand-hammered finish', 'Natural turquoise inlay', 'Elastic cord'],
    basePriceCents: 5800,
    compareAtPriceCents: null,
    isFeatured: true,
    seoTitle: 'Tibetan Silver Amulet Bracelet · Handmade 925 with Turquoise',
    seoDescription: 'A hand-hammered 925 silver amulet with a natural turquoise stone. Inspired by Lhasa silversmiths. Free worldwide shipping over $120.',
    weightGrams: 14,
    stock: 60,
    skuPrefix: 'TIB-AMULET',
    images: ['/products/p01.jpg', '/products/p07.jpg', '/products/p13.jpg'],
  },
  {
    slug: 'mongolian-road-knot-cord',
    name: 'Mongolian Road Knot Cord',
    subtitle: 'Hand-braided cord · the knot that counts the way home',
    shortDesc: 'A single braided cord bracelet in the Mongolian road-knot style. Adjustable, made to be tied once and worn for years.',
    craftStory: `On the steppe, a mother ties a knot for her child before a long journey — one knot for every hundred miles of safe return. This bracelet is braided by hand, knot by knot, in waxed cotton cord, and the closure is a sliding knot: pull to tighten, pull to release. The knot is not a clasp. It is a small act of patience, a quiet count of the days until someone comes home. You may not be going anywhere. But every time you tie this on, you remember someone who was.`,
    careNotes: 'Avoid prolonged water contact. The sliding knot can be retightened by hand if it loosens with wear.',
    category: 'bracelet',
    heritage: 'mongol',
    collectionSlug: 'mongolian-steppe',
    materials: ['Hand-braided waxed cotton cord', 'Sterling silver end bead', 'Adjustable sliding knot'],
    basePriceCents: 4200,
    compareAtPriceCents: 5600,
    isFeatured: true,
    seoTitle: 'Mongolian Knot Bracelet · Hand-Braided Travel Cord',
    seoDescription: 'A hand-braided cord bracelet in the Mongolian steppe tradition. Adjustable sliding knot. Sterling silver end bead. Free worldwide shipping over $120.',
    weightGrams: 8,
    stock: 80,
    skuPrefix: 'MNG-ROAD',
    images: ['/products/p02.jpg', '/products/p08.jpg'],
  },
  {
    slug: 'miao-filigree-drop-earrings',
    name: 'Miao Filigree Drop Earrings',
    subtitle: 'Hand-coiled silver wire · a flower that trembles',
    shortDesc: 'Drop earrings of hand-coiled Miao silver filigree, finished in the workshops of Guizhou. Each wire is thinner than a hair.',
    craftStory: `In the Miao villages of southwest China, a bride wears her entire family history around her neck — and on her ears, in the form of silver filigree. Each wire is drawn by hand, thinner than a hair, then coiled into a flower that trembles when she moves. It takes a silversmith three full years to master. The flower is the oldest of the Miao symbols: a life that holds its shape through every kind of weather. You have weathered your own. Let this be the flower you kept.`,
    careNotes: 'Avoid perfume and lotions on the metal. Store in the provided pouch to prevent tangling.',
    category: 'earrings',
    heritage: 'southwest',
    collectionSlug: 'southwest-filigree',
    materials: ['925 silver filigree wire', 'Sterling silver ear hooks', 'Hand-coiled flower motif'],
    basePriceCents: 6800,
    compareAtPriceCents: null,
    isFeatured: true,
    seoTitle: 'Miao Silver Filigree Drop Earrings · Handmade in Guizhou',
    seoDescription: 'Drop earrings of hand-coiled Miao silver filigree. Each wire is thinner than a hair. Sterling silver ear hooks. Free worldwide shipping over $120.',
    weightGrams: 6,
    stock: 40,
    skuPrefix: 'MIA-FILI',
    images: ['/products/p03.jpg', '/products/p14.jpg', '/products/p18.jpg'],
  },
  {
    slug: 'han-jade-lotus-pendant',
    name: 'Han Jade Lotus Pendant',
    subtitle: 'Jade-green stone · the slow, quiet kind of beauty',
    shortDesc: 'A small jade-tone lotus pendant on a waxed cotton cord. Quiet, restrained, meant to be worn close to the collarbone.',
    craftStory: `In the East, jade has been treasured above gold for thousands of years — not for its flash, but for its quiet. It does not speak; it warms. Worn close to the skin, it slowly takes the shape of the wearer. The lotus is what the literati called the most honest flower: pure, but rooted in mud. The cord is waxed cotton, hand-knotted in the traditional Chinese style, with a sliding closure that does not catch. This is not jewelry that asks to be noticed. It is jewelry that listens.`,
    careNotes: 'Wipe gently with a soft cloth. Avoid contact with perfumes. The cord can be replaced when worn.',
    category: 'necklace',
    heritage: 'han',
    collectionSlug: 'han-jade',
    materials: ['Jade-tone stone pendant (15mm)', 'Hand-knotted waxed cotton cord', 'Sliding closure', 'Sterling silver end caps'],
    basePriceCents: 9600,
    compareAtPriceCents: null,
    isFeatured: true,
    seoTitle: 'Jade Lotus Pendant Necklace · Handmade Chinese Jade',
    seoDescription: 'A small jade-tone lotus pendant on a hand-knotted waxed cord. Quiet, restrained, made to be worn close. Free worldwide shipping over $120.',
    weightGrams: 18,
    stock: 30,
    skuPrefix: 'HAN-LOTUS',
    images: ['/products/p04.jpg', '/products/p15.jpg'],
  },
  {
    slug: 'tai-silk-cord-phone-charm',
    name: 'Thai Silk Cord Phone Charm',
    subtitle: 'Hand-woven silk · the slow light of the tropics',
    shortDesc: 'A small phone charm of hand-woven Thai silk, finished with a tiny silver lotus bead. A hundred times a day, your phone lights up — and so does a small piece of meaning.',
    craftStory: `In the silk villages of northern Thailand, the loom moves slowly, the way the light moves through wet leaves. Each thread of silk catches that light and holds it. This charm is a small piece of that — hand-woven silk, finished with a tiny silver lotus bead that catches the afternoon sun. A phone charm is a small thing. But a hundred times a day, your phone lights up — and now, each time, a small piece of old meaning lights up with it.`,
    careNotes: 'Keep dry. The silk can be refreshed with a light steam if it loses its sheen.',
    category: 'phone-charm',
    heritage: 'tai',
    collectionSlug: 'tai-silk',
    materials: ['Hand-woven Thai silk', '925 silver lotus bead', 'Universal phone strap loop'],
    basePriceCents: 3200,
    compareAtPriceCents: null,
    isFeatured: true,
    seoTitle: 'Thai Silk Phone Charm · Handmade Hand-Woven',
    seoDescription: 'A hand-woven Thai silk phone charm with a tiny silver lotus bead. Slow, meaningful, made to be carried. Free worldwide shipping over $120.',
    weightGrams: 4,
    stock: 100,
    skuPrefix: 'TAI-SILK',
    images: ['/products/p05.jpg', '/products/p16.jpg'],
  },
  {
    slug: 'hadas-knot-red-cord',
    name: 'Hada Knot Red Cord',
    subtitle: 'Red cord · the knot that stays alive',
    shortDesc: 'A red cord bracelet in the Tibetan hada style. The knot never dies — it can grow, it can be passed on.',
    craftStory: `The hada is the white silk scarf offered at every Tibetan greeting. Its knot is the one that never dies. Not because it is tied tightly, but because it is never tied to an end. This bracelet is the same idea, in red — the color of blessing across Asia. You tie it once, and you wear it for a year, or five, or until you pass it on. The knot will hold, even as your wrist changes. It was made to.`,
    careNotes: 'Hand wash gently if needed. Air dry flat. The knot is meant to loosen slightly with wear — re-tie as desired.',
    category: 'bracelet',
    heritage: 'tibetan',
    collectionSlug: 'tibetan-silver',
    materials: ['Hand-braided red waxed cord', 'Sterling silver hada knot bead', 'Adjustable sliding closure'],
    basePriceCents: 3800,
    compareAtPriceCents: null,
    isFeatured: false,
    seoTitle: 'Tibetan Hada Knot Red Cord Bracelet · Handmade',
    seoDescription: 'A red cord bracelet in the Tibetan hada style. The knot never dies — it grows, it can be passed on. Sterling silver accent. Free worldwide shipping over $120.',
    weightGrams: 6,
    stock: 70,
    skuPrefix: 'TIB-HADA',
    images: ['/products/p06.jpg', '/products/p19.jpg'],
  },
  {
    slug: 'obsidian-guardian-charm',
    name: 'Obsidian Guardian Charm',
    subtitle: 'Black obsidian · the stone of quiet protection',
    shortDesc: 'A small phone charm of natural black obsidian on a hand-braided black cord. Worn since the Stone Age to guard against bad days.',
    craftStory: `Black obsidian has been used as a protective stone since the Stone Age. It is volcanic glass — sharp, dark, and quiet. This charm pairs three small obsidian beads on a hand-braided black cord, with a single silver accent to catch the light. It is not a loud protection. It is the kind you feel at the end of a hard day, when you reach into your pocket and remember someone is on your side. Even if that someone is a small piece of cooled lava.`,
    careNotes: 'Avoid hard knocks — obsidian is glass. Clean with a soft dry cloth.',
    category: 'phone-charm',
    heritage: 'mongol',
    collectionSlug: 'mongolian-steppe',
    materials: ['Natural black obsidian beads (8mm)', 'Hand-braided black waxed cord', 'Sterling silver accent bead'],
    basePriceCents: 2800,
    compareAtPriceCents: null,
    isFeatured: false,
    seoTitle: 'Black Obsidian Phone Charm · Handmade Protective Stone',
    seoDescription: 'A phone charm of natural black obsidian on a hand-braided cord. Worn since the Stone Age to guard against bad days. Free worldwide shipping over $120.',
    weightGrams: 5,
    stock: 90,
    skuPrefix: 'MNG-OBS',
    images: ['/products/p09.jpg', '/products/p20.jpg'],
  },
  {
    slug: 'caravan-fusion-necklace',
    name: 'Caravan Fusion Necklace',
    subtitle: 'Tibetan silver · Miao wire · silk cord · the road that connects',
    shortDesc: 'A small fusion pendant: hand-hammered Tibetan silver, Miao filigree wire, on a hand-woven silk cord. Where roots meet on the Silk Road.',
    craftStory: `Silver traveled down from the plateau. Silk traveled west from the lowlands. They met, over centuries, on the caravan roads — a Tibetan trader exchanging a hammered amulet for a Miao coil of wire, somewhere between a mountain pass and a river crossing. This necklace is a small piece of that meeting: hand-hammered Tibetan silver set with a single turquoise, finished with a coil of Miao filigree, on a hand-woven silk cord. It is not any one tradition. It is the moment two of them shook hands, and the handshake held.`,
    careNotes: 'Avoid prolonged water contact. The silk cord can be replaced by your local jeweler when worn.',
    category: 'necklace',
    heritage: 'fusion',
    collectionSlug: 'caravan-fusion',
    materials: ['Hand-hammered Tibetan silver (15mm)', 'Miao filigree wire detail', 'Natural turquoise cabochon', 'Hand-woven silk cord', 'Sterling silver clasp'],
    basePriceCents: 11800,
    compareAtPriceCents: null,
    isFeatured: true,
    seoTitle: 'Tibetan Silver & Miao Filigree Fusion Necklace · Handmade',
    seoDescription: 'A fusion pendant of hand-hammered Tibetan silver and Miao filigree, set with natural turquoise, on a hand-woven silk cord. The Silk Road, in one piece. Free worldwide shipping.',
    weightGrams: 22,
    stock: 18,
    skuPrefix: 'CAR-FUSE',
    images: ['/products/p10.jpg', '/products/p17.jpg', '/products/p21.jpg'],
  },
  {
    slug: 'amethyst-calm-bracelet',
    name: 'Amethyst Calm Bracelet',
    subtitle: 'Natural amethyst · the stone of quiet',
    shortDesc: 'Natural 8mm amethyst beads, hand-strung with small Miao silver accent beads on an elastic cord.',
    craftStory: `Amethyst has been worn for calm across cultures for thousands of years — by Egyptian pharaohs, by Tibetan monks, by grandmothers who did not need a name for what they knew. The color of quiet, at the end of a busy day. This bracelet pairs natural amethyst beads with small Miao silver accents, hand-strung on a comfortable elastic cord. You do not have to believe in the stone to wear it. But there is a kind of meaning that comes from choosing a stone, knowing what it has meant to others, and carrying it with you.`,
    careNotes: 'Avoid prolonged water contact. Clean with a soft cloth. Re-string the elastic when it shows wear.',
    category: 'bracelet',
    heritage: 'tibetan',
    collectionSlug: 'tibetan-silver',
    materials: ['Natural amethyst beads (8mm)', 'Miao silver accent beads', 'Elastic cord'],
    basePriceCents: 4400,
    compareAtPriceCents: null,
    isFeatured: false,
    seoTitle: 'Amethyst Bracelet · Handmade Natural Stone Jewelry',
    seoDescription: 'Natural 8mm amethyst beads hand-strung with Miao silver accents. The stone of quiet. Free worldwide shipping over $120.',
    weightGrams: 12,
    stock: 50,
    skuPrefix: 'TIB-AMET',
    images: ['/products/p11.jpg'],
  },
  {
    slug: 'rose-quartz-tenderness-bracelet',
    name: 'Rose Quartz Tenderness Bracelet',
    subtitle: 'Natural rose quartz · the stone that softens',
    shortDesc: 'Natural 8mm rose quartz beads, hand-strung with small Miao silver accent beads. For the days you need to be a little gentler.',
    craftStory: `Rose quartz is the oldest love charm known — pink stone, soft light, the color of a kindness you do not have to perform. It has been given across cultures for the same reason: not to make someone love you, but to make love easier to receive. This bracelet pairs natural rose quartz with small Miao silver accents, on a comfortable elastic cord. Wear it on the days you need to be a little gentler — with yourself, mostly.`,
    careNotes: 'Avoid prolonged water contact. Rose quartz is a softer stone — keep away from harder jewelry to prevent scratches.',
    category: 'bracelet',
    heritage: 'tibetan',
    collectionSlug: 'tibetan-silver',
    materials: ['Natural rose quartz beads (8mm)', 'Miao silver accent beads', 'Elastic cord'],
    basePriceCents: 4400,
    compareAtPriceCents: null,
    isFeatured: false,
    seoTitle: 'Rose Quartz Bracelet · Handmade Natural Stone Jewelry',
    seoDescription: 'Natural 8mm rose quartz beads hand-strung with Miao silver accents. The stone that softens. Free worldwide shipping over $120.',
    weightGrams: 12,
    stock: 55,
    skuPrefix: 'TIB-ROSE',
    images: ['/products/p12.jpg'],
  },
];

// ─── 辅助:依据 heritage 返回主图色 (与品牌色板一致) ─────────────────────
const HERITAGE_GLYPH: Record<string, string> = {
  tibetan: '🏔',
  mongol: '🐎',
  southwest: '🌿',
  han: '📜',
  tai: '🌊',
  fusion: '✨',
};

// ─── 种子函数 ────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 开始导入占位 SKU 数据 (v2 · 10 个产品 × 5 个系列)\n');

  // 1. 系列
  console.log('─── 1/4 系列 ──────────────────────────────────');
  const collectionMap: Record<string, string> = {};
  for (const c of COLLECTIONS_DATA) {
    const existing = await db.query.collections.findFirst({ where: (cols, { eq }) => eq(cols.slug, c.slug) });
    if (existing) {
      console.log(`  [跳过] ${c.name} (已存在)`);
      collectionMap[c.slug] = existing.id;
      continue;
    }
    const [created] = await db.insert(collections).values(c).returning();
    console.log(`  [新增] ${created.name} ${HERITAGE_GLYPH[c.heritage] || ''}`);
    collectionMap[c.slug] = created.id;
  }

  // 2. 产品
  console.log('\n─── 2/4 产品 + 变体 + 库存 ─────────────────────');
  for (const p of PRODUCTS_DATA) {
    const existing = await db.query.products.findFirst({ where: (prods, { eq }) => eq(prods.slug, p.slug) });
    if (existing) {
      console.log(`  [跳过] ${p.name} (已存在)`);
      continue;
    }

    const collectionId = collectionMap[p.collectionSlug];
    if (!collectionId) {
      console.error(`  ✗ ${p.name} 找不到系列 ${p.collectionSlug}, 跳过`);
      continue;
    }

    const [product] = await db.insert(products).values({
      slug: p.slug,
      name: p.name,
      subtitle: p.subtitle,
      description: p.shortDesc,
      category: p.category,
      collectionId,
      heritage: p.heritage,
      materials: p.materials,
      basePriceCents: p.basePriceCents,
      compareAtPriceCents: p.compareAtPriceCents,
      status: 'active',
      isFeatured: p.isFeatured,
      craftStory: p.craftStory,
      careNotes: p.careNotes,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
    }).returning();

    const [variant] = await db.insert(productVariants).values({
      productId: product.id,
      sku: `${p.skuPrefix}-DEFAULT`,
      name: 'Default',
      priceCents: p.basePriceCents,
      weightGrams: p.weightGrams,
    }).returning();

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

    console.log(`  [新增] ${p.name} · $${(p.basePriceCents / 100).toFixed(0)} · 库存 ${p.stock} · ${p.images.length} 图`);
  }

  // 3. 统计
  console.log('\n─── 3/4 数据统计 ─────────────────────────────');
  const [prodCount] = await db.select({ v: sql<number>`count(*)::int` }).from(products);
  const [colCount] = await db.select({ v: sql<number>`count(*)::int` }).from(collections);
  const [invCount] = await db.select({ v: sql<number>`coalesce(sum(${inventory.quantity}), 0)::int` }).from(inventory);
  console.log(`  系列: ${colCount?.v ?? 0}`);
  console.log(`  产品: ${prodCount?.v ?? 0}`);
  console.log(`  库存总数: ${invCount?.v ?? 0} 件`);

  // 4. admin 账号引导
  console.log('\n─── 4/4 管理员账号 ─────────────────────────────');
  const ADMIN_EMAIL = 'admin@naracharm.local';
  const [existingAdmin] = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL)).limit(1);
  if (existingAdmin) {
    if (existingAdmin.role !== 'admin') {
      await db.update(users).set({ role: 'admin' }).where(eq(users.id, existingAdmin.id));
      console.log(`  ✓ 已将 ${ADMIN_EMAIL} 升级为 admin`);
    } else {
      console.log(`  ✓ ${ADMIN_EMAIL} 已是 admin,跳过`);
    }
  } else {
    console.log(`  ✗ ${ADMIN_EMAIL} 不存在。`);
    console.log(`    步骤 1: 访问 /register 用此邮箱注册 (密码建议 8+ 位)`);
    console.log(`    步骤 2: 跑 pnpm tsx scripts/create-admin.ts 升级为 admin`);
  }

  console.log('\n✅ 种子数据导入完成!\n');
  console.log('下一步:');
  console.log('  • 访问 http://localhost:37000 查看首页');
  console.log('  • 访问 http://localhost:37000/collections 看系列');
  console.log('  • 访问 http://localhost:37000/admin/login 登入后台');
  console.log('');

  await client.end();
}

seed().catch((err) => {
  console.error('❌ 导入失败:', err);
  process.exit(1);
});
