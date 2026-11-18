import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join, relative, sep } from 'node:path';

const originalFolders = ['editorial', 'products'];
const widths = [96, 192, 320, 384, 480, 640, 768, 960, 1200, 1536];
const outputSettings = { quality: 83, effort: 3 };
const photoFormats = {
  '.jpg': 'jpeg', '.jpeg': 'jpeg', '.png': 'png', '.webp': 'webp',
  '.gif': 'gif', '.bmp': 'bmp', '.tif': 'tiff', '.tiff': 'tiff',
};

async function checkCatalogPhotos(stagedWeb, publicDir, sharp, site) {
  const products = JSON.parse(await readFile(join(stagedWeb, 'src/data/products.json'), 'utf8'));
  const photos = new Map();
  for (const product of products) {
    if (product.imageKind !== 'photo' || product.availability === 'preview' || !product.primaryImage) continue;
    for (const image of new Set([product.primaryImage, ...product.images])) {
      const url = new URL(image, site);
      if (url.origin !== site) continue;
      const pathname = decodeURIComponent(url.pathname);
      const productsUsingPhoto = photos.get(pathname) ?? new Set();
      productsUsingPhoto.add(product.slug);
      photos.set(pathname, productsUsingPhoto);
    }
  }

  for (const [pathname, listingSlugs] of photos) {
    const owner = [...listingSlugs].join(', ');
    if (pathname.includes('\\') || pathname.split('/').includes('..')) {
      throw new Error(`Invalid catalog photo path: ${pathname} (${owner})`);
    }
    const source = join(publicDir, pathname.slice(1));
    let info;
    try {
      info = await sharp(source).metadata();
    } catch (error) {
      throw new Error(`Missing or unreadable catalog photo ${pathname} (${owner}).`, { cause: error });
    }
    const format = photoFormats[extname(pathname).toLowerCase()];
    if (!format || info.format !== format) {
      throw new Error(`Catalog photo ${pathname} is not a matching ${format ?? 'supported image'} file (${owner}).`);
    }
    const { width, height } = info.autoOrient ?? info;
    if (width < 500 || height < 500) {
      console.warn(`Catalog photo ${pathname} is ${width} × ${height}. Provide at least 500 × 500 for Merchant Center (${owner}).`);
    }
    if (info.pages > 1 && format === 'gif') {
      console.warn(`Catalog photo ${pathname} is animated. Merchant Center requires a static GIF (${owner}).`);
    }
  }
}

async function findImages(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) return findImages(path);
    return entry.isFile() && /\.(?:jpe?g|png|webp)$/i.test(entry.name) ? [path] : [];
  }))).flat();
}

export async function buildStaticImages(stagedWeb, sharp, siteUrl = 'https://naracharm.com') {
  const publicDir = join(stagedWeb, 'public');
  await checkCatalogPhotos(stagedWeb, publicDir, sharp, new URL(siteUrl).origin);
  const output = join(publicDir, 'image');
  const files = (await Promise.all(originalFolders.map((folder) => findImages(join(publicDir, folder))))).flat().sort();
  await mkdir(output, { recursive: true });

  const records = new Map();
  const encodings = new Map();
  const encoded = new Set();

  async function encodeVariants(image, candidates) {
    const variants = [];
    const fingerprint = createHash('sha256');
    for (const width of candidates) {
      const bytes = await image.clone().autoOrient().resize({ width }).webp(outputSettings).toBuffer();
      fingerprint.update(bytes);
      variants.push({ width, bytes });
    }
    const key = fingerprint.digest('hex').slice(0, 20);
    if (!encoded.has(key)) {
      encoded.add(key);
      await Promise.all(variants.map(({ width, bytes }) => writeFile(join(output, `${key}-${width}.webp`), bytes)));
    }
    return { key, widths: candidates };
  }

  async function encode(source) {
    const master = await readFile(source);
    const image = sharp(master);
    const metadata = await image.metadata();
    if (metadata.pages > 1) return;

    const sourceWidth = metadata.autoOrient?.width ?? metadata.width;
    if (!sourceWidth || sourceWidth <= widths[0]) return;
    const maxWidth = Math.min(sourceWidth, widths.at(-1));
    const candidates = [...widths.filter((width) => width < maxWidth), maxWidth];
    const sourceHash = createHash('sha256').update(master).digest('hex');
    let encoding = encodings.get(sourceHash);
    if (!encoding) {
      encoding = encodeVariants(image, candidates);
      encodings.set(sourceHash, encoding);
    }
    records.set('/' + relative(publicDir, source).split(sep).join('/'), await encoding);
  }

  // Keep a bounded number of master images in memory while encoding variants.
  for (let index = 0; index < files.length; index += 4) {
    await Promise.all(files.slice(index, index + 4).map(encode));
  }

  const variants = Object.fromEntries(files.map((source) => '/' + relative(publicDir, source).split(sep).join('/'))
    .filter((source) => records.has(source)).map((source) => [source, records.get(source)]));
  await writeFile(join(stagedWeb, 'src/data/static-image-variants.json'), JSON.stringify(variants));
  console.log(`Built responsive sizes for ${records.size} storefront images.`);
}
