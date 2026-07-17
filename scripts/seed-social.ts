/**
 * 种子脚本: 导入评价 + 评论
 * 用法: cd apps/web && set -a && source .env.local && set +a && npx tsx ../../scripts/seed-social.ts
 */
import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { products, productReviews, blogComments, blogCommentsRelations } from '../packages/db/schema';
import { eq } from 'drizzle-orm';

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle({ client, schema: { products, productReviews, blogComments } });

async function seed() {
  console.log('🌱 导入评价 + 评论...\n');

  // 读数据库已有产品
  const allProducts = await db.query.products.findMany();
  console.log(`数据库有 ${allProducts.length} 个产品`);

  const reviewData: { slug: string; authorName: string; rating: number; title: string; text: string; isVerifiedPurchase: boolean }[] = [
    { slug: 'amethyst-peace-bracelet', authorName: 'Emily C.', rating: 5, title: 'Even more beautiful in person', text: 'The deep purple is stunning. I reach for this bracelet every morning. It goes with everything and the quality is remarkable.', isVerifiedPurchase: true },
    { slug: 'amethyst-peace-bracelet', authorName: 'Maya T.', rating: 4, title: 'Lovely piece', text: 'Bought this for my sister who loves amethyst. She wears it daily and says it brings her calm. The silver accents are a nice touch.', isVerifiedPurchase: true },
    { slug: 'strawberry-quartz-bracelet', authorName: 'Jessica L.', rating: 5, title: 'My new favorite accessory', text: 'The pink is so delicate and pretty. Perfect for layering with other bracelets. I\'ve gotten so many compliments!', isVerifiedPurchase: false },
    { slug: 'strawberry-quartz-bracelet', authorName: 'Lin W.', rating: 5, title: 'Beautiful quality', text: 'The strawberry quartz catches the light beautifully. Fast shipping and came in a lovely little box with a story card.', isVerifiedPurchase: true },
    { slug: 'rose-quartz-bracelet', authorName: 'Emma R.', rating: 5, title: 'A daily reminder of self-love', text: 'Wearing this daily has honestly shifted my mindset. I feel more calm and centered throughout the day. The soft pink is beautiful.', isVerifiedPurchase: true },
    { slug: 'rose-quartz-bracelet', authorName: 'Sophie K.', rating: 4, title: 'Very happy with this purchase', text: 'The rose quartz has a lovely soft color. It fits well and the size is perfect for stacking with other bracelets.', isVerifiedPurchase: false },
    { slug: 'obsidian-guard-charm', authorName: 'Alex P.', rating: 5, title: 'Looks great on my phone!', text: 'Perfect size — not too bulky. The obsidian beads have a beautiful deep black shine. Got so many compliments at work.', isVerifiedPurchase: true },
    { slug: 'mixed-crystal-bracelet', authorName: 'Nina H.', rating: 5, title: 'Love the mix of colors', text: 'This bracelet goes with everything! The mix of crystals means it matches any outfit. Such beautiful quality.', isVerifiedPurchase: true },
    { slug: 'mixed-crystal-bracelet', authorName: 'Rachel D.', rating: 4, title: 'Beautiful and versatile', text: 'The different crystals are well-chosen. It\'s become my everyday bracelet. Would recommend!', isVerifiedPurchase: false },
    { slug: 'lotus-jade-bracelet', authorName: 'Priya S.', rating: 5, title: 'The jade is stunning', text: 'The jade is such a beautiful shade of green. Feels very special and meaningful. The lotus accent is gorgeous.', isVerifiedPurchase: true },
    { slug: 'lotus-jade-bracelet', authorName: 'Yuki M.', rating: 5, title: 'Elegant and meaningful', text: 'I bought this as a gift for my mother and she absolutely loves it. The packaging made it feel extra special.', isVerifiedPurchase: false },
    { slug: 'cinnabar-cord-charm', authorName: 'Mia Z.', rating: 4, title: 'Unique design', text: 'The red beads are gorgeous and the cord is well-made. Looks lovely on my bag. Very unique design, high quality.', isVerifiedPurchase: true },
    { slug: 'turquoise-sky-bracelet', authorName: 'Sarah K.', rating: 5, title: 'A piece of sky on my wrist', text: 'The turquoise has amazing matrix patterns. Really well-made and the color is exactly as pictured — that beautiful robin\'s egg blue.', isVerifiedPurchase: true },
    { slug: 'turquoise-sky-bracelet', authorName: 'Amanda G.', rating: 5, title: 'Absolutely love it', text: 'Bought the turquoise bracelet as a gift and my friend absolutely loved it. The matrix patterns are stunning.', isVerifiedPurchase: true },
  ];

  // 插入评价
  console.log('\n导入评价...');
  let reviewCount = 0;
  for (const r of reviewData) {
    const prod = allProducts.find(p => p.slug === r.slug);
    if (!prod) { console.log(`  [跳过] 产品 ` + r.slug); continue; }
    await db.insert(productReviews).values({
      productId: prod.id,
      authorName: r.authorName,
      rating: r.rating,
      title: r.title,
      text: r.text,
      isFeatured: false,
      isVerifiedPurchase: r.isVerifiedPurchase,
    });
    reviewCount++;
  }
  console.log(`  [完成] 导入 ${reviewCount} 条评价`);

  // 博客评论
  console.log('\n导入博客评论...');
  const blogCommentData = [
    { slug: 'amethyst-meaning-healing-properties', authorName: 'Lily C.', text: 'This was so helpful! I just got my first amethyst bracelet and now I understand the meaning behind it so much better. Thanks for the detailed guide!' },
    { slug: 'rose-quartz-meaning-love-stone', authorName: 'Tessa W.', text: 'I\'ve been wearing rose quartz for a month now and I notice a real difference in how I feel. Whether it\'s the stone or just my intention, it\'s working!' },
    { slug: 'healing-crystals-101-beginners-guide', authorName: 'Marcus J.', text: 'Great beginner\'s guide. Would love to see more about how to choose crystals for specific intentions. The chakra connection section was really eye-opening.' },
    { slug: 'how-to-style-beaded-bracelets', authorName: 'Olivia N.', text: 'The stacking tips are exactly what I needed! I was nervous about mixing too many colors but the color wheel advice was spot on. My stack looks amazing now!' },
    { slug: 'evil-eye-meaning-protection-symbol', authorName: 'Amir K.', text: 'Always wondered about the evil eye meaning. Thanks for explaining both the cultural significance and how it\'s worn today. Super interesting read.' },
  ];
  let commentCount = 0;
  for (const c of blogCommentData) {
    await db.insert(blogComments).values({
      articleSlug: c.slug,
      authorName: c.authorName,
      text: c.text,
      isApproved: true,
    });
    commentCount++;
  }
  console.log(`  [完成] 导入 ${commentCount} 条评论`);

  console.log('\n✅ 社交数据导入完成!');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
