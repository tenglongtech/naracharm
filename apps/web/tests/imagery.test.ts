import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getActiveProducts, getAllCollections } from '../src/lib/storefront';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
test('every published product has its own existing redesigned image with no old gallery cross-links',async()=>{
 const products=await getActiveProducts();
 assert.equal(products.length,28);
 assert.equal(new Set(products.map(p=>p.primaryImage)).size,28);
 for(const p of products){
  assert.equal(p.primaryImage,`/products/redesigned/${p.slug}.webp`);
  assert.deepEqual(p.images,[p.primaryImage]);
  assert.ok(existsSync(resolve('public',p.primaryImage!.slice(1))));
 }
});
test('six published designs have prices inside the range but never fabricated stock',async()=>{
 const products=await getActiveProducts();
 const concepts=products.filter(p=>p.availability==='preview');
 assert.equal(concepts.length,6);
 for(const p of concepts){assert.equal(p.stock,0);assert.ok(p.basePriceCents>=2600&&p.basePriceCents<=11800);}
 const collections=await getAllCollections();
 assert.equal(collections.find(c=>c.slug==='studio-edit')?.productCount,6);
});
