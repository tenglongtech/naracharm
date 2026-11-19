import { spawn } from 'node:child_process';
import { cp, mkdir, mkdtemp, rename, rm, symlink, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { buildStaticImages } from './build-static-images.mjs';

const repo = fileURLToPath(new URL('..', import.meta.url));
const web = join(repo, 'apps/web');
const requireFromWeb = createRequire(join(web, 'package.json'));
const nextCli = requireFromWeb.resolve('next/dist/bin/next');
const nextRequire = createRequire(requireFromWeb.resolve('next/package.json'));
const { loadEnvConfig } = nextRequire('@next/env');

const excludedAppFolders = new Set(['app/api', 'app/admin', 'app/admin-test']);
const workspaceFiles = ['package.json', 'pnpm-workspace.yaml', 'pnpm-lock.yaml'];
const frontendFiles = ['next.config.ts', 'package.json', 'postcss.config.mjs', 'tsconfig.json', 'public'];

async function stageSources(stage) {
  const stagedWeb = join(stage, 'apps/web');
  const stagedDb = join(stage, 'packages/db');
  await Promise.all([mkdir(stagedWeb, { recursive: true }), mkdir(stagedDb, { recursive: true })]);
  const source = join(web, 'src');
  await Promise.all([
    ...workspaceFiles.map((file) => cp(join(repo, file), join(stage, file))),
    ...frontendFiles.map((file) => cp(join(web, file), join(stagedWeb, file), { recursive: true })),
    cp(source, join(stagedWeb, 'src'), {
      recursive: true,
      filter: (path) => !excludedAppFolders.has(relative(source, path).split(sep).join('/')),
    }),
    cp(join(repo, 'packages/db'), stagedDb, {
      recursive: true,
      filter: (path) => !relative(join(repo, 'packages/db'), path).split(sep).includes('node_modules'),
    }),
    symlink(join(repo, 'node_modules'), join(stage, 'node_modules'), 'junction'),
    symlink(join(web, 'node_modules'), join(stagedWeb, 'node_modules'), 'junction'),
    symlink(join(repo, 'packages/db/node_modules'), join(stagedDb, 'node_modules'), 'junction'),
  ]);
  return stagedWeb;
}

function run(command, args, options, label) {
  return new Promise((done, fail) => {
    const child = spawn(command, args, { ...options, stdio: 'inherit' });
    child.once('error', fail);
    child.once('exit', (code, signal) => {
      if (code === 0) done();
      else fail(new Error(label + ' ended with ' + (signal ?? code)));
    });
  });
}

function publicOrigin(value, name) {
  const url = new URL(value);
  const looksLocal = url.hostname === 'localhost' || url.hostname.endsWith('.localhost') || url.hostname === '127.0.0.1' || url.hostname === '[::1]';
  if (looksLocal || url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(name + ' must be a public HTTPS origin.');
  }
  return url.origin;
}

async function installExport(generated) {
  const target = join(web, 'out');
  const stagingParent = join(web, '.next');
  await mkdir(stagingParent, { recursive: true });
  const directory = await mkdtemp(join(stagingParent, 'static-output-'));
  const ready = join(directory, 'ready');
  const backup = join(directory, 'previous');
  let keepBackup = false;
  try {
    await cp(generated, ready, { recursive: true });
    try {
      await rename(target, backup);
      keepBackup = true;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    try {
      await rename(ready, target);
      keepBackup = false;
    } catch (error) {
      if (keepBackup) {
        try {
          await rename(backup, target);
          keepBackup = false;
        } catch {
          console.error(`The previous static export is available at ${backup}`);
        }
      }
      throw error;
    }
  } finally {
    if (!keepBackup) await rm(directory, { recursive: true, force: true });
  }
}

let stage;
try {
  const { values } = parseArgs({
    options: {
      archive: { type: 'string' },
      'refresh-catalog': { type: 'boolean' },
      'catalog-intake': { type: 'string' },
      'previous-sitemap': { type: 'string' },
    },
  });
  const archive = values.archive ? resolve(values.archive) : undefined;
  const refreshCatalog = values['refresh-catalog'];
  const catalogIntake = values['catalog-intake'];
  const previousSitemap = values['previous-sitemap'];
  if ((values.archive !== undefined || refreshCatalog) && !archive?.endsWith('.zip')) {
    throw new Error('Usage: pnpm package:static <archive.zip> or pnpm package:catalog <archive.zip>');
  }
  if (previousSitemap && !archive) throw new Error('--previous-sitemap requires an archive path.');
  if (catalogIntake && (!archive || refreshCatalog)) {
    throw new Error('--catalog-intake requires package:static and an archive path.');
  }
  if (catalogIntake && process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === 'true') {
    throw new Error('Offline catalog intake requires checkout to be paused.');
  }
  const exportDatabaseUrl = process.env.STOREFRONT_EXPORT_DATABASE_URL?.trim();
  if (refreshCatalog && !exportDatabaseUrl) {
    throw new Error('STOREFRONT_EXPORT_DATABASE_URL is required to package the current catalog.');
  }

  if (!archive) loadEnvConfig(web, false);
  const env = { ...process.env, NODE_ENV: 'production', BUILD_TARGET: 'static' };
  delete env.STOREFRONT_EXPORT_DATABASE_URL;
  if (archive) {
    delete env.DATABASE_URL;
    env.NEXT_PUBLIC_SITE_URL = publicOrigin(env.NEXT_PUBLIC_SITE_URL || 'https://naracharm.com', 'NEXT_PUBLIC_SITE_URL');
    env.NEXT_PUBLIC_API_URL = publicOrigin(env.NEXT_PUBLIC_API_URL || 'https://api.naracharm.com', 'NEXT_PUBLIC_API_URL');
    env.NEXT_PUBLIC_INQUIRY_FORM_ENABLED ??= String(env.NEXT_PUBLIC_SITE_URL === 'https://naracharm.com');
  }
  stage = await mkdtemp(join(tmpdir(), 'naracharm-static-'));
  const stagedWeb = await stageSources(stage);
  if (catalogIntake) {
    const scriptsDir = join(stagedWeb, 'scripts');
    await mkdir(scriptsDir);
    await Promise.all(['catalog-offline.ts', 'catalog-snapshot.ts'].map((script) =>
      cp(join(web, 'scripts', script), join(scriptsDir, script))
    ));
    const candidate = join(stagedWeb, 'src/data/catalog-candidate.json');
    await run(process.execPath, ['--import', 'tsx', join(scriptsDir, 'catalog-offline.ts'), 'snapshot', resolve(catalogIntake), candidate], {
      cwd: stagedWeb, env,
    }, 'Offline catalog intake');
    await rename(candidate, join(stagedWeb, 'src/data/products.json'));
  } else if (refreshCatalog) {
    await run(process.execPath, ['--import', 'tsx', join(web, 'scripts/export-storefront.ts')], {
      cwd: stagedWeb,
      env: {
        ...env,
        DATABASE_URL: exportDatabaseUrl,
        STOREFRONT_DATA_DIR: join(stagedWeb, 'src/data'),
        STOREFRONT_REQUIRE_PUBLISHED_PHOTOS: 'true',
      },
    }, 'Catalog snapshot export');
  }
  await buildStaticImages(stagedWeb, requireFromWeb('sharp'), env.NEXT_PUBLIC_SITE_URL || undefined);
  await run(process.execPath, [nextCli, 'build', '--webpack'], { cwd: stagedWeb, env }, 'Static storefront build');
  const generated = join(stagedWeb, 'out');
  if (env.NEXT_PUBLIC_INQUIRY_FORM_ENABLED === 'true') {
    await Promise.all([
      cp(join(repo, 'cloudflare/inquiries/worker.mjs'), join(generated, '_worker.js')),
      writeFile(join(generated, '_routes.json'), JSON.stringify({ version: 1, include: ['/api/inquiries'], exclude: [] }) + '\n'),
    ]);
  }
  if (archive) {
    await run('python3', [
      join(repo, 'scripts/audit-static-storefront.py'), generated,
      '--site-url', env.NEXT_PUBLIC_SITE_URL, '--api-origin', env.NEXT_PUBLIC_API_URL, '--archive', archive,
      ...(previousSitemap ? ['--previous-sitemap', resolve(previousSitemap)] : []),
    ], { env }, 'Storefront release audit');
  } else {
    await installExport(generated);
    console.log('Static storefront exported to ' + join(web, 'out'));
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (stage) await rm(stage, { recursive: true, force: true });
}
