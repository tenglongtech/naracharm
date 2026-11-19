import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join, relative, sep } from 'node:path';

const originalFolders = ['editorial', 'products'];
const widths = [96, 192, 320, 384, 480, 640, 768, 960, 1200, 1536];
const editorialWidths = [...widths, 800, 1320].sort((a, b) => a - b);
const outputSettings = { quality: 83, effort: 3 };
const photoFormats = {
  '.jpg': 'jpeg', '.jpeg': 'jpeg', '.png': 'png', '.webp': 'webp',
  '.gif': 'gif', '.bmp': 'bmp', '.tif': 'tiff', '.tiff': 'tiff',
};

async function checkCatalogPhotos(stagedWeb, publicDir, sharp, site) {
  const products = JSON.parse(await readFile(join(stagedWeb, 'src/data/products.json'), 'utf8'));
  const photos = new Map();
  for (const product of products) {
    if (product.availability === 'preview') continue;
    const shared = product.imageKind === 'photo' && product.primaryImage ? [product.primaryImage, ...product.images] : [];
    const variants = product.variants ?? [product.variant];
    const verified = [...shared, ...variants.flatMap((variant) => variant?.photoUrls ?? [])];
    for (const image of new Set(verified)) {
      const url = new URL(image, site);
      const source = url.origin === site ? decodeURIComponent(url.pathname) : url.href;
      const productsUsingPhoto = photos.get(source) ?? new Set();
      productsUsingPhoto.add(product.slug);
      photos.set(source, productsUsingPhoto);
    }
  }

  const photoGroups = new Map();
  for (const [pathname, listingSlugs] of photos) {
    if (!pathname.startsWith('/')) {
      photoGroups.set(pathname, listingSlugs);
      continue;
    }
    const owner = [...listingSlugs].join(', ');
    if (pathname.includes('\\') || pathname.split('/').includes('..')) {
      throw new Error(`Invalid catalog photo path: ${pathname} (${owner})`);
    }
    const source = join(publicDir, pathname.slice(1));
    let bytes;
    let info;
    try {
      bytes = await readFile(source);
      info = await sharp(bytes).metadata();
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
    const fingerprint = createHash('sha256').update(bytes).digest('hex');
    const productsUsingPhoto = photoGroups.get(fingerprint) ?? new Set();
    for (const slug of listingSlugs) productsUsingPhoto.add(slug);
    photoGroups.set(fingerprint, productsUsingPhoto);
  }
  for (const owners of photoGroups.values()) {
    if (owners.size < 2) continue;
    const labels = [...owners].sort().slice(0, 8).join(', ');
    const rest = owners.size > 8 ? ` and ${owners.size - 8} more` : '';
    console.warn(`The same confirmed catalog photo is assigned to multiple pieces: ${labels}${rest}. Check that it shows each piece.`);
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

const shareSize = { width: 1200, height: 630 };

async function renderProductShare(image, output, sharp, brand, illustrationLabel) {
  const panel = await sharp({ create: { width: 570, height: shareSize.height, channels: 3, background: '#dfe7dc' } }).png().toBuffer();
  const { data: product, info } = await image.clone().autoOrient()
    .resize({ width: 486, height: 550, fit: 'inside' }).png().toBuffer({ resolveWithObject: true });
  const layers = [
    { input: panel, left: 630, top: 0 },
    { input: product, left: Math.round(915 - info.width / 2), top: Math.round((shareSize.height - info.height) / 2) },
    { input: brand, left: 86, top: illustrationLabel ? 263 : 291 },
  ];
  if (illustrationLabel) layers.push({ input: illustrationLabel, left: 90, top: 360 });

  const bytes = await sharp({ create: { ...shareSize, channels: 3, background: '#f5eee3' } })
    .composite(layers).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  const name = `share-${createHash('sha256').update(bytes).digest('hex').slice(0, 20)}.jpg`;
  await writeFile(join(output, name), bytes);
  return { url: '/image/' + name, ...shareSize };
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
  const shareEncodings = new Map();
  let shareLabels;

  async function shareImage(image, key, isIllustration) {
    shareLabels ??= Promise.all([
      sharp({ text: { text: '<span foreground="#304637">Nara Charm</span>', font: 'Serif 64', rgba: true } }).png().toBuffer(),
      sharp({ text: { text: '<span foreground="#6c5041">Design illustration</span>', font: 'Sans 27', rgba: true } }).png().toBuffer(),
    ]);
    const [brand, label] = await shareLabels;
    const shareKey = key + (isIllustration ? ':illustration' : ':photo');
    if (!shareEncodings.has(shareKey)) {
      shareEncodings.set(shareKey, renderProductShare(image, output, sharp, brand, isIllustration ? label : undefined));
    }
    return shareEncodings.get(shareKey);
  }

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
    const sourcePath = relative(publicDir, source).split(sep).join('/');
    const targetWidths = sourcePath.startsWith('editorial/') ? editorialWidths : widths;
    const candidates = [...targetWidths.filter((width) => width < maxWidth), maxWidth];
    const sourceHash = createHash('sha256').update(master).update(candidates.join(',')).digest('hex');
    let encoding = encodings.get(sourceHash);
    if (!encoding) {
      encoding = encodeVariants(image, candidates);
      encodings.set(sourceHash, encoding);
    }
    const productSource = /^products\/(redesigned|studio|photos)\//.exec(sourcePath);
    const sourceHeight = metadata.autoOrient?.height ?? metadata.height;
    if (productSource && sourceHeight && sourceHeight >= sourceWidth) {
      const [responsive, share] = await Promise.all([encoding, shareImage(image, sourceHash, productSource[1] !== 'photos')]);
      records.set('/' + sourcePath, { ...responsive, share });
    } else {
      records.set('/' + sourcePath, await encoding);
    }
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
