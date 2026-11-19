const maxBody = 24 * 1024;
const limit = 6;
const topics = new Set(['product', 'studio', 'order', 'returns', 'wholesale', 'stockists', 'privacy', 'other']);
const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const emailAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

function json(status, body, headers = {}) {
  return Response.json(body, { status, headers: {
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  } });
}

async function readFields(request) {
  if (Number(request.headers.get('Content-Length')) > maxBody) return null;
  const reader = request.body?.getReader();
  if (!reader) return new URLSearchParams();
  const decoder = new TextDecoder();
  let length = 0;
  let body = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return new URLSearchParams(body + decoder.decode());
    length += value.byteLength;
    if (length > maxBody) {
      await reader.cancel();
      return null;
    }
    body += decoder.decode(value, { stream: true });
  }
}

async function clientKey(secret, bucket, ip) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const hash = await crypto.subtle.sign('HMAC', key, encoder.encode(bucket + ':' + ip));
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/inquiries') return env.ASSETS.fetch(request);
    if (request.method !== 'POST') return json(405, { error: 'method' }, { Allow: 'POST' });
    if (request.headers.get('Origin') !== url.origin || (env.INQUIRY_ORIGIN && env.INQUIRY_ORIGIN !== url.origin)) {
      return json(403, { error: 'origin' });
    }
    if (request.headers.get('Content-Type')?.split(';', 1)[0] !== 'application/x-www-form-urlencoded') {
      return json(415, { error: 'content-type' });
    }

    let form;
    try {
      form = await readFields(request);
    } catch {
      return json(400, { error: 'invalid' });
    }
    if (!form) return json(413, { error: 'size' });

    const field = (name) => form.get(name)?.trim() ?? '';
    const id = field('id');
    const topic = field('topic');
    const email = field('email');
    const piece = field('piece');
    const order = field('order');
    const message = field('message');
    if (!uuidV4.test(id) || !topics.has(topic) || !emailAddress.test(email) || email.length > 254 ||
        piece.length > 140 || order.length > 60 || !message || message.length > 1400 || field('website')) {
      return json(400, { error: 'invalid' });
    }

    const db = env.INQUIRIES;
    const ip = request.headers.get('CF-Connecting-IP');
    if (!db || !env.INQUIRY_RATE_SECRET || !ip) return json(503, { error: 'unavailable' });
    try {
      const hour = 3600;
      const timestamp = Math.floor(Date.now() / 1000);
      const bucket = Math.floor(timestamp / hour);
      const client = await clientKey(env.INQUIRY_RATE_SECRET, bucket, ip);

      // D1 runs the batch in one transaction. A retry does not use another submission slot.
      const results = await db.batch([
        db.prepare('DELETE FROM inquiry_rate WHERE bucket < ?').bind(bucket),
        db.prepare(`
          INSERT INTO inquiry_rate (bucket, client_key, submissions)
          SELECT ?, ?, 1 WHERE NOT EXISTS (SELECT 1 FROM inquiries WHERE id = ?)
          ON CONFLICT (bucket, client_key) DO UPDATE SET submissions = submissions + 1
          WHERE submissions <= ?
        `).bind(bucket, client, id, limit),
        db.prepare(`
          INSERT INTO inquiries (id, topic, email, piece, order_number, message)
          SELECT ?, ?, ?, ?, ?, ?
          WHERE EXISTS (SELECT 1 FROM inquiry_rate WHERE bucket = ? AND client_key = ? AND submissions <= ?)
          ON CONFLICT (id) DO NOTHING
        `).bind(id, topic, email, piece, order, message, bucket, client, limit),
        db.prepare(`
          SELECT (topic = ? AND email = ? AND piece = ? AND order_number = ? AND message = ?) AS matches
          FROM inquiries WHERE id = ?
        `).bind(topic, email, piece, order, message, id),
      ]);
      const stored = results[3].results[0];
      if (stored?.matches === 1) return json(201, { reference: id });
      if (stored) return json(409, { error: 'conflict' });
      return json(429, { error: 'limit' }, { 'Retry-After': String(hour - timestamp % hour) });
    } catch {
      return json(503, { error: 'unavailable' });
    }
  },
};
