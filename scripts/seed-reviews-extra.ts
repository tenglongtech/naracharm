/**
 * 种子脚本: 生产库追加评价 (新5产品 + 补评论)
 * 用法: cd apps/web && set -a && source /tmp/.env.prod && set +a && npx tsx ../../scripts/seed-reviews-extra.ts
 */
import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { products, productReviews, blogComments } from '../packages/db/schema';
import { eq } from 'drizzle-orm';

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle({ client, schema: { products, productReviews, blogComments } });

const EXTRA_REVIEWS: { slug: string; authorName: string; rating: number; title: string; text: string; isVerifiedPurchase: boolean }[] = [
  // 新5产品
  { slug: 'amethyst-earrings-silver', authorName: 'Grace L.', rating: 5, title: 'Gorgeous amethyst earrings', text: 'The purple drops are so rich and vibrant. They catch the light beautifully and the silver is high quality. I get compliments every time I wear them.', isVerifiedPurchase: true },
  { slug: 'amethyst-earrings-silver', authorName: 'Hannah B.', rating: 5, title: 'Perfect gift for my mom', text: 'Bought these for my mother\'s birthday and she adored them. Elegant, well-made, and the amethyst is a beautiful deep color.', isVerifiedPurchase: false },
  { slug: 'citrine-bracelet-abundance', authorName: 'Tom W.', rating: 5, title: 'Love the golden glow', text: 'The citrine has a warm, sunny glow that brightens any outfit. Wearing it as my prosperity reminder. Great quality beads.', isVerifiedPurchase: true },
  { slug: 'citrine-bracelet-abundance', authorName: 'Isabelle F.', rating: 4, title: 'Beautiful and bright', text: 'Lovely citrine bracelet, the golden color is exactly as pictured. Sizing is comfortable and it layers well.', isVerifiedPurchase: false },
  { slug: 'howlite-turquoise-bracelet', authorName: 'Kevin C.', rating: 4, title: 'Nice value', text: 'Great turquoise look at an accessible price. The color is even and the beads are smooth. Perfect everyday bracelet.', isVerifiedPurchase: true },
  { slug: 'hematite-bracelet-mens', authorName: 'James R.', rating: 5, title: 'Solid and grounding', text: 'Matte black hematite looks great on men. It\'s substantial but not flashy. I wear it daily for grounding and focus.', isVerifiedPurchase: true },
  { slug: 'unakite-bracelet-balance', authorName: 'Olivia T.', rating: 5, title: 'Unique and beautiful', text: 'The green and pink mix is so unique. Everyone asks about it. Feels calming and grounding to wear.', isVerifiedPurchase: true },
];

async function seed() {
  console.log('🌱 追加评价...\n');
  const allProducts = await db.query.products.findMany();

  let count = 0;
  for (const r of EXTRA_REVIEWS) {
    const prod = allProducts.find(p => p.slug === r.slug);
    if (!prod) { console.log(`  [跳过] 无产品 ${r.slug}`); continue; }
    await db.insert(productReviews).values({
      productId: prod.id, authorName: r.authorName, rating: r.rating,
      title: r.title, text: r.text, isFeatured: false,
      isVerifiedPurchase: r.isVerifiedPurchase,
    });
    count++;
  }
  console.log(`  [完成] 新增 ${count} 条评价`);

  console.log('\n导入补充评论...');
  const extraComments = [
    { slug: 'crystal-birthstones-by-month-guide', authorName: 'Nina V.', text: 'Found my birthstone! I\'m an October baby so opal and tourmaline — had no idea. Great comprehensive guide.' },
    { slug: 'chakra-jewelry-beginners-guide', authorName: 'Leo M.', text: 'This cleared up so much about chakra jewelry. The 7 chakras explanation with stones was super helpful for a beginner.' },
    { slug: 'how-to-tell-if-crystals-are-real', authorName: 'Ava K.', text: 'The temperature test is a game changer. I tested my whole collection! Two turned out to be glass. Thank you!' },
    { slug: 'amethyst-for-sleep-guide', authorName: 'Chris D.', text: 'Put amethyst under my pillow after reading this and I\'ve been sleeping better all week. Whether it\'s the stone or the habit, it works.' },
  ];
  let cc = 0;
  for (const c of extraComments) {
    await db.insert(blogComments).values({
      articleSlug: c.slug, authorName: c.authorName, text: c.text, isApproved: true,
    });
    cc++;
  }
  console.log(`  [完成] 新增 ${cc} 条评论`);
  console.log('\n✅ 完成!');
  process.exit(0);
}
seed().catch((err) => { console.error(err); process.exit(1); });
