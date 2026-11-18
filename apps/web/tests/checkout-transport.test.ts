import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readCheckoutResponse } from '../src/lib/checkout-browser';

test('the checkout deadline aborts a response whose body stalls', async (context) => {
  let bodyAborted = false;
  context.mock.method(globalThis, 'fetch', async (_input: RequestInfo | URL, init: RequestInit) => {
    const signal = init.signal!;
    return new Response(new ReadableStream({
      start(stream) {
        stream.enqueue(new TextEncoder().encode('{"unfinished":'));
        signal.addEventListener('abort', () => {
          bodyAborted = true;
          stream.error(signal.reason);
        }, { once: true });
      },
    }), { headers: { 'Content-Type': 'application/json' } });
  });

  await assert.rejects(readCheckoutResponse('/api/checkout?config=1', {}, 30), /Your cart is saved/);
  assert.equal(bodyAborted, true);
});

test('changing confirmation requests cancels the earlier read and preserves its credential policy', async (context) => {
  const pending = new AbortController();
  const abortReason = new Error('confirmation requested again');
  context.mock.method(globalThis, 'fetch', (_input: RequestInfo | URL, init: RequestInit) => {
    assert.equal(init.credentials, 'same-origin');
    const signal = init.signal!;
    return new Promise<Response>((_, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    });
  });

  const result = readCheckoutResponse('/api/checkout?session_id=cs_test_example', {
    signal: pending.signal, credentials: 'same-origin',
  });
  pending.abort(abortReason);
  await assert.rejects(result, (error: Error) => error.cause === abortReason);
});
