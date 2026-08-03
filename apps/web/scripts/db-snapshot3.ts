import postgres from 'postgres';
import { writeFileSync, mkdirSync } from 'node:fs';

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const tables = ['products','collections','product_variants','inventory','product_images','product_reviews','blog_comments','customers','orders','order_lines'];
  const out: Record<string, unknown> = {};
  for (const t of tables) {
    try {
      const rows = await sql`SELECT * FROM ${sql(t)}`;
      out[t] = rows;
      console.log(`${t}: ${rows.length} rows`);
    } catch (e: any) {
      console.log(`${t}: ERROR ${e.message}`);
    }
  }
  mkdirSync('/Users/matt/dev/首饰跨境电商/backups', { recursive: true });
  writeFileSync('/Users/matt/dev/首饰跨境电商/backups/neon-snapshot-20260803.json', JSON.stringify(out, null, 2));
  console.log('\n✅ 快照已保存到 backups/neon-snapshot-20260803.json');
  await sql.end();
  process.exit(0);
}
main();
