import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import worker from './worker.mjs';

const origin = 'https://naracharm.com';
const endpoint = origin + '/api/inquiries';
const schema = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');

function fixture() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(schema);
  const env = {
    INQUIRIES: {
      prepare(query) {
        return { bind: (...values) => () => {
          const statement = sqlite.prepare(query);
          return query.trimStart().startsWith('SELECT')
            ? { results: statement.all(...values) }
            : { meta: statement.run(...values) };
        } };
      },
      async batch(statements) {
        sqlite.exec('BEGIN');
        try {
          const results = statements.map((statement) => statement());
          sqlite.exec('COMMIT');
          return results;
        } catch (error) {
          sqlite.exec('ROLLBACK');
          throw error;
        }
      },
    },
    INQUIRY_RATE_SECRET: 'test-fixture-secret',
  };
  const records = () => sqlite.prepare('SELECT * FROM inquiries').all();
  return { env, records, sqlite };
}

const details = {
  topic: 'product',
  email: 'visitor@example.invalid',
  piece: 'Jade-tone pendant · 18 in',
  message: 'Could you confirm the length? 谢谢',
};

function submit(env, fields = {}, headers = {}) {
  const body = new URLSearchParams({ ...details, id: crypto.randomUUID(), ...fields });
  return worker.fetch(new Request(endpoint, {
    method: 'POST',
    headers: { Origin: origin, 'CF-Connecting-IP': '192.0.2.10', ...headers },
    body,
  }), env);
}

test('the dashboard view lists the newest unreviewed inquiries and removes a handled record', () => {
  const { sqlite } = fixture();
  const insert = sqlite.prepare(`
    INSERT INTO inquiries (id, received_at, reviewed_at, topic, email, piece, order_number, message)
    VALUES (?, ?, ?, 'product', 'visitor@example.invalid', 'Jade-tone pendant', '', 'Could you share a photo?')
  `);
  insert.run('first', '2026-11-19T10:00:00.000Z', null);
  insert.run('recent', '2026-11-19T13:00:00.000Z', null);
  insert.run('handled', '2026-11-19T14:00:00.000Z', '2026-11-19T15:00:00.000Z');
  const pending = sqlite.prepare('SELECT id, piece FROM pending_inquiries LIMIT 50');
  assert.deepEqual(pending.all().map(({ id, piece }) => [id, piece]), [
    ['recent', 'Jade-tone pendant'], ['first', 'Jade-tone pendant'],
  ]);

  sqlite.prepare('UPDATE inquiries SET reviewed_at = ? WHERE id = ?').run('2026-11-19T16:00:00.000Z', 'recent');
  assert.deepEqual(pending.all().map(({ id }) => id), ['first']);
});

test('accepts a valid inquiry and records the reply address and product context once', async () => {
  const { env, records } = fixture();
  const id = crypto.randomUUID();
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = await submit(env, { id, order: 'ORDER-19' });
    assert.equal(result.status, 201);
    assert.deepEqual(await result.json(), { reference: id });
    assert.equal(result.headers.get('cache-control'), 'no-store');
  }
  assert.equal(records().length, 1);
  const [record] = records();
  for (const [key, value] of Object.entries(details)) assert.equal(record[key], value);
  assert.equal(record.order_number, 'ORDER-19');
  assert.equal(Object.values(record).includes('192.0.2.10'), false);
  assert.equal((await submit(env, { id, message: 'A different message' })).status, 409);
});

test('rejects bad topics, empty messages, oversized payloads and other origins without storing data', async () => {
  const { env, records } = fixture();
  for (const fields of [{ topic: 'unknown' }, { message: '   ' }, { email: 'wrong' }, { website: 'spam' }]) {
    assert.equal((await submit(env, fields)).status, 400);
  }
  assert.equal((await submit(env, { message: '界'.repeat(3000) })).status, 413);
  assert.equal((await submit(env, {}, { Origin: 'https://other.example' })).status, 403);
  assert.equal((await worker.fetch(new Request(endpoint), env)).status, 405);
  assert.deepEqual(records(), []);
});

test('limits repeated submissions and returns a service error when D1 is unavailable', async () => {
  const { env, records, sqlite } = fixture();
  for (let i = 0; i < 6; i++) assert.equal((await submit(env)).status, 201);
  assert.equal((await submit(env)).status, 429);
  assert.equal(records().length, 6);
  assert.equal((await submit(env, {}, { 'CF-Connecting-IP': '192.0.2.20' })).status, 201);
  sqlite.exec('DROP TABLE inquiries');
  assert.equal((await submit(env)).status, 503);
  assert.equal((await submit({})).status, 503);
});
