import { neon } from '@neondatabase/serverless';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const products = await sql`SELECT slug, name, status FROM products ORDER BY created_at DESC`;
  const reviews = await sql`SELECT COUNT(*) as c FROM product_reviews`;
  const comments = await sql`SELECT COUNT(*) as c FROM blog_comments`;
  const orders = await sql`SELECT COUNT(*) as c FROM orders`;
  console.log('=== 生产库产品 ===');
  for (const p of products) console.log(p.status, p.slug);
  console.log('评价数:', reviews[0].c, '| 评论数:', comments[0].c, '| 订单数:', orders[0].c);
  process.exit(0);
}
main();
