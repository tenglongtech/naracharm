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

    // 新增产品的评价
    { slug: 'tibetan-amulet-925-bracelet', authorName: 'David K.', rating: 5, title: 'Stunning craftsmanship', text: 'The silver work is incredible. Every detail on this bracelet is hand-chased with such precision. It feels like wearing a piece of art.', isVerifiedPurchase: true },
    { slug: 'tibetan-amulet-925-bracelet', authorName: 'Priya M.', rating: 4, title: 'Beautiful piece', text: 'Really beautiful bracelet. The amulet design is unique and the quality is excellent. Fits perfectly.', isVerifiedPurchase: false },
    { slug: 'mongolian-road-knot-cord', authorName: 'Liam T.', rating: 5, title: 'Love the adjustable knot', text: 'The sliding knot makes it so easy to adjust. I wear it every day and it hasn\'t frayed at all. Simple, elegant, and meaningful.', isVerifiedPurchase: true },
    { slug: 'mongolian-road-knot-cord', authorName: 'Sofia R.', rating: 4, title: 'Simple and elegant', text: 'Love the simplicity of this bracelet. The knot is well-made and the cord is comfortable. Perfect for daily wear.', isVerifiedPurchase: false },
    { slug: 'miao-filigree-drop-earrings', authorName: 'Zoe L.', rating: 5, title: 'So delicate!', text: 'These earrings are even more beautiful in person. The filigree work is so intricate and delicate. They catch the light beautifully.', isVerifiedPurchase: true },
    { slug: 'miao-filigree-drop-earrings', authorName: 'Nora W.', rating: 5, title: 'Get compliments everywhere', text: 'I\'ve received so many compliments on these earrings. The craftsmanship is stunning and they go with everything.', isVerifiedPurchase: true },
    { slug: 'han-jade-lotus-pendant', authorName: 'Wei C.', rating: 5, title: 'The jade is gorgeous', text: 'The jade has such a beautiful deep green color. The lotus pendant design is elegant and meaningful. I wear it every day.', isVerifiedPurchase: true },
    { slug: 'han-jade-lotus-pendant', authorName: 'Kate M.', rating: 4, title: 'Beautiful pendant', text: 'Lovely pendant with a nice weight to it. The jade has beautiful natural variations. The silk cord is comfortable.', isVerifiedPurchase: false },
    { slug: 'tai-silk-cord-phone-charm', authorName: 'Yuna H.', rating: 5, title: 'Perfect phone accessory', text: 'This silk phone charm is gorgeous. The colors are vibrant and the silk feels so luxurious. Perfect for dressing up my phone.', isVerifiedPurchase: true },
    { slug: 'tai-silk-cord-phone-charm', authorName: 'Aria P.', rating: 5, title: 'The silk is so soft!', text: 'I love how soft the silk is! The colors are even prettier in person. It dangles beautifully from my phone case.', isVerifiedPurchase: true },
    { slug: 'hadas-knot-red-cord', authorName: 'Tenzin D.', rating: 5, title: 'My lucky bracelet', text: 'I wear this red cord every day. The knot is beautifully tied and the meaning behind it is so special. Feels like my lucky charm.', isVerifiedPurchase: true },
    { slug: 'obsidian-guardian-charm', authorName: 'Mike R.', rating: 4, title: 'Good quality', text: 'Solid phone charm. The obsidian beads have a nice polish and the cord seems durable. Great for protection on the go.', isVerifiedPurchase: true },
    { slug: 'caravan-fusion-necklace', authorName: 'Elena S.', rating: 5, title: 'Stunning fusion piece', text: 'This necklace is a true conversation starter. The mix of turquoise, red agate, and silver is stunning. Feels like wearing a piece of history.', isVerifiedPurchase: true },
    { slug: 'caravan-fusion-necklace', authorName: 'Hannah J.', rating: 5, title: 'Got so many compliments', text: 'Wore this to a dinner party and got so many compliments. The colors are vibrant and the design is unique. Love it!', isVerifiedPurchase: false },
    { slug: 'amethyst-calm-bracelet', authorName: 'Clara D.', rating: 5, title: 'Perfect amethyst', text: 'The amethyst beads are a beautiful deep purple. The bracelet is well-made and comfortable. Exactly what I wanted.', isVerifiedPurchase: true },
    { slug: 'rose-quartz-tenderness-bracelet', authorName: 'Isabella M.', rating: 5, title: 'Soft and beautiful', text: 'The soft pink of this rose quartz is absolutely lovely. It goes with everything and the tenderness of the name matches the energy perfectly.', isVerifiedPurchase: true },

    // 追加评价 — 热销产品 + 新产品
    { slug: 'amethyst-peace-bracelet', authorName: 'Grace W.', rating: 5, title: 'Perfect gift', text: 'Bought this for my best friend\'s birthday and she absolutely adores it. The purple is even richer in person. She hasn\'t taken it off since!', isVerifiedPurchase: true },
    { slug: 'amethyst-peace-bracelet', authorName: 'Daniel L.', rating: 4, title: 'Lovely color', text: 'The amethyst has a beautiful deep lavender hue. Very comfortable to wear and the silver accents are well-finished. Great value for the quality.', isVerifiedPurchase: true },
    { slug: 'rose-quartz-bracelet', authorName: 'Karen M.', rating: 5, title: 'Bought as a set with my daughter', text: 'We each got one and wear them every day. The soft pink is so feminine and the quality is wonderful. Such a sweet mother-daughter bonding piece.', isVerifiedPurchase: true },
    { slug: 'turquoise-sky-bracelet', authorName: 'Jessica H.', rating: 5, title: 'The blue is incredible', text: 'The turquoise has the most amazing robin\'s egg blue color I\'ve ever seen. The matrix patterns are so unique — no two beads are the same. Stunning quality!', isVerifiedPurchase: true },
    { slug: 'obsidian-guard-charm', authorName: 'Tom R.', rating: 5, title: 'My third one', text: 'This is my third obsidian guard charm — I keep buying them as gifts for friends. Everyone loves them. The deep black shine and compact size are perfect.', isVerifiedPurchase: true },
    { slug: 'obsidian-guard-charm', authorName: 'Julia S.', rating: 4, title: 'Nice quality', text: 'Well-made phone charm with a nice weight to it. The obsidian beads are polished beautifully. Would have liked it just slightly larger, but still very happy.', isVerifiedPurchase: true },
    { slug: 'mixed-crystal-bracelet', authorName: 'Amy T.', rating: 5, title: 'Daily wear for months', text: 'I\'ve been wearing this every single day for months and it still looks brand new. The mix of crystals goes with every outfit. Best purchase I\'ve made!', isVerifiedPurchase: true },
    { slug: 'lotus-jade-bracelet', authorName: 'Anika D.', rating: 5, title: 'Elegant and meaningful gift', text: 'Gave this to my sister for her birthday and she cried! The jade is such a rich green and the lotus symbolizes so much. A truly special gift.', isVerifiedPurchase: true },
    { slug: 'tibetan-amulet-925-bracelet', authorName: 'Ryan K.', rating: 5, title: 'Worth every penny', text: 'The 925 silver amulet is even more detailed than the photos show. Hand-chased patterns are incredible. Feels substantial and authentic. Highly recommend!', isVerifiedPurchase: true },
    { slug: 'miao-filigree-drop-earrings', authorName: 'Catherine B.', rating: 5, title: 'Delicate and beautiful', text: 'The filigree work is so intricate — you can tell these are handmade with care. They catch the light perfectly and go with both casual and formal outfits.', isVerifiedPurchase: true },
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

    // 追加博客评论
    { slug: 'labradorite-meaning-magic-stone', authorName: 'Zara N.', text: 'Just bought a labradorite bracelet after reading this. Amazing energy!' },
    { slug: 'aventurine-meaning-luck-opportunity', authorName: 'Owen P.', text: 'Perfect timing for this article. I needed some luck!' },
    { slug: 'crystal-bracelet-stacking-guide', authorName: 'Mia S.', text: 'Can you stack 3 bracelets of different sizes?' },
    { slug: 'summer-jewelry-styling-crystals', authorName: 'Elena V.', text: 'Love the summer tips! My turquoise has been perfect for beach days.' },
    { slug: 'black-onyx-meaning-strength-protection', authorName: 'Nina D.', text: 'Exactly what I needed to read. Onyx is my new go-to stone.' },
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
