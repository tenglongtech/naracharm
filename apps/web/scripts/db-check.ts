import { db } from '../src/lib/db';
import { products, productReviews, blogComments, orders } from '@jewelry/db';

async function main() {
  const [p, r, c, o] = await Promise.all([
    db.select().from(products),
    db.select().from(productReviews),
    db.select().from(blogComments),
    db.select().from(orders),
  ]);
  console.log('Products:', p.length, '(active:', p.filter(x=>x.status==='active').length + ')');
  console.log('Reviews:', r.length);
  console.log('Comments:', c.length);
  console.log('Orders:', o.length);
  process.exit(0);
}
main();
