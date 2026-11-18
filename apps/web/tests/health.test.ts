import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GET } from '../src/app/api/health/route';

test('API readiness reports HTTP 503 for unavailable databases and identifies pending migrations', async (t) => {
  const previousUrl = process.env.DATABASE_URL;
  t.after(() => {
    if (previousUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousUrl;
  });

  delete process.env.DATABASE_URL;
  const missing = await GET();
  assert.equal(missing.status, 503);
  assert.equal(missing.headers.get('cache-control'), 'no-store');

  process.env.DATABASE_URL = 'postgresql://health:unreachable@127.0.0.1:1/health';
  const offline = await GET();
  assert.equal(offline.status, 503);
  const offlineBody = await offline.json();
  assert.equal(offlineBody.ok, false);
  assert.equal(offlineBody.db, 'down');
  assert.equal(offlineBody.schema, 'unknown');

  const legacyUrl = process.env.NARA_HEALTH_LEGACY_DATABASE_URL;
  await t.test('reachable database pending schema changes', { skip: !legacyUrl }, async () => {
    process.env.DATABASE_URL = legacyUrl!;
    const pending = await GET();
    assert.equal(pending.status, 503);
    const body = await pending.json();
    assert.equal(body.ok, false);
    assert.equal(body.db, 'up');
    assert.equal(body.schema, 'pending');
  });

  const readyUrl = process.env.CHECKOUT_TEST_DATABASE_URL;
  await t.test('ready database and schema', { skip: !readyUrl }, async () => {
    process.env.DATABASE_URL = readyUrl!;
    const ready = await GET();
    assert.equal(ready.status, 200);
    assert.equal(ready.headers.get('cache-control'), 'no-store');
    const body = await ready.json();
    assert.equal(body.service, 'naracharm-api');
    assert.equal(body.ok, true);
    assert.equal(body.db, 'up');
    assert.equal(body.schema, 'ready');
  });
});
