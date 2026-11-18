import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OPTIONS as preflight } from '../src/app/api/auth/[...all]/route';

test('separate storefront and auth origins can negotiate a credentialed request', async () => {
  const original = process.env.CHECKOUT_STOREFRONT_ORIGIN;
  process.env.CHECKOUT_STOREFRONT_ORIGIN = 'https://preview.naracharm.com';
  try {
    function request(origin: string) {
      return new Request('https://api.naracharm.com/api/auth/sign-in/email', {
        method: 'OPTIONS',
        headers: { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' },
      });
    }
    const allowed = await preflight(request('https://preview.naracharm.com'));
    assert.equal(allowed.status, 204);
    assert.equal(allowed.headers.get('Access-Control-Allow-Origin'), 'https://preview.naracharm.com');
    assert.equal(allowed.headers.get('Access-Control-Allow-Credentials'), 'true');
    assert.match(allowed.headers.get('Vary') ?? '', /origin/i);
    const blocked = await preflight(request('https://unrelated.example'));
    assert.equal(blocked.status, 403);
    assert.equal(blocked.headers.has('Access-Control-Allow-Origin'), false);
  } finally {
    if (original === undefined) delete process.env.CHECKOUT_STOREFRONT_ORIGIN;
    else process.env.CHECKOUT_STOREFRONT_ORIGIN = original;
  }
});

test('the configured auth origin is trusted when the server sees an internal proxy URL', async () => {
  const original = process.env.BETTER_AUTH_URL;
  process.env.BETTER_AUTH_URL = 'https://api.naracharm.com';
  try {
    const response = await preflight(new Request('http://localhost:37001/api/auth/sign-in/email', {
      method: 'OPTIONS', headers: { Origin: 'https://api.naracharm.com', 'Access-Control-Request-Method': 'POST' },
    }));
    assert.equal(response.status, 204);
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://api.naracharm.com');
  } finally {
    if (original === undefined) delete process.env.BETTER_AUTH_URL;
    else process.env.BETTER_AUTH_URL = original;
  }
});
