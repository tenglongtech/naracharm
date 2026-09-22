// Optimize generated masters for the storefront without changing their content.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('../node_modules/.pnpm/sharp@0.34.5/node_modules/sharp');
async function main() {
 const manifest = JSON.parse(await fs.readFile(path.join(__dirname,'../docs/qa/2026-09-22-image-generation.json'),'utf8'));
 for (const entry of manifest) {
  const target = path.join(__dirname,'../apps/web/public',entry.destination);
  await fs.mkdir(path.dirname(target),{recursive:true});
  await sharp(entry.source).resize({width:1200,withoutEnlargement:true}).webp({quality:86}).toFile(target);
 }
 console.log(`Prepared ${manifest.length} storefront images.`);
}
main().catch(error=>{console.error(error);process.exit(1);});
