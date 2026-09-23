import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getActiveProducts, getAllCollections } from '../src/lib/storefront';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
test('published products use existing, relevant redesigned images without old gallery cross-links',async()=>{
 const products=await getActiveProducts();
 assert.equal(products.length,28);
 for(const p of products){
  if(['rose-quartz-bracelet','hematite-bracelet-mens'].includes(p.slug)){
   assert.equal(p.primaryImage,null);
   assert.deepEqual(p.images,[]);
   continue;
  }
  assert.deepEqual(p.images,[p.primaryImage]);
  assert.ok(p.primaryImage?.startsWith('/products/redesigned/'));
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
