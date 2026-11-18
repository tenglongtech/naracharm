import { fileURLToPath } from 'node:url';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import postgres from 'postgres';

async function migrateRelease(url) {
  if (!url) throw new Error('DATABASE_URL is required to migrate the API database.');

  const migrationsFolder = fileURLToPath(new URL('../drizzle/', import.meta.url));
  const migrations = readMigrationFiles({ migrationsFolder });
  const sql = postgres(url, {
    max: 1,
    connect_timeout: 8,
    connection: { search_path: 'public', lock_timeout: 5000, statement_timeout: 60000 },
    onnotice: () => {},
  });

  try {
    return await sql.begin(async (tx) => {
      const [lock] = await tx`SELECT pg_try_advisory_xact_lock(1782056058350) AS acquired`;
      if (!lock.acquired) throw new Error('Another API database migration is in progress.');

      const [database] = await tx`
        SELECT to_regclass('drizzle.__drizzle_migrations') IS NOT NULL AS journal,
          (to_regclass('public.products') IS NOT NULL
           OR to_regclass('public.orders') IS NOT NULL
           OR to_regclass('public."user"') IS NOT NULL
           OR to_regtype('public.product_status') IS NOT NULL) AS populated`;
      const applied = database.journal
        ? await tx`SELECT hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at, id`
        : [];

      if (applied.length === 0 && database.populated) {
        throw new Error('Existing commerce tables have no recorded Drizzle migrations. Reconcile the database migration history before releasing.');
      }

      if (applied.some((entry, index) => entry.hash !== migrations[index]?.hash || Number(entry.created_at) !== migrations[index]?.folderMillis)) {
        throw new Error('The database migration history differs from this release. Reconcile the migration history before releasing.');
      }

      const pending = migrations.slice(applied.length);
      if (pending.length === 0) return 0;

      if (!database.journal) {
        await tx`CREATE SCHEMA IF NOT EXISTS drizzle`;
        await tx`CREATE TABLE drizzle.__drizzle_migrations (
          id serial PRIMARY KEY,
          hash text NOT NULL,
          created_at bigint
        )`;
      }

      for (const migration of pending) {
        for (const statement of migration.sql) if (statement.trim()) await tx.unsafe(statement);
        await tx`INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES (${migration.hash}, ${migration.folderMillis})`;
      }
      return pending.length;
    });
  } finally {
    await sql.end({ timeout: 1 });
  }
}

try {
  const count = await migrateRelease(process.env.DATABASE_URL);
  console.log(`API schema ready. Applied ${count} migration(s).`);
} catch (error) {
  console.error('API schema migration failed.', error.message);
  process.exitCode = 1;
}
