import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addToLocalCart, clearLocalCart, getLocalCart, updateLocalLineQuantity, type CartAddInput } from '../src/lib/cart-local';
import { checkoutRequest } from '../src/lib/checkout-request';

const piece = {
  productId: '057c5647-fda3-4723-a85d-c9847321f550',
  productSlug: 'woven-cord', productName: 'Woven cord',
  variantId: '69aa5c99-c004-405f-9562-42c1a961440b',
  variantName: 'Standard', sku: 'WOVEN-001', unitPriceCents: 3200,
  image: null, heritage: null, stock: 140,
} satisfies CartAddInput;

test('adding the genuine SKU reconciles a legacy cart row and respects the checkout quantity limit', (t) => {
  const storage = new Map<string, string>();
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  } } });
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
    else Reflect.deleteProperty(globalThis, 'window');
  });

  const { lineId } = addToLocalCart({ ...piece, variantId: piece.productId, sku: piece.productSlug, quantity: 80 }).lines[0];
  const { lines } = addToLocalCart({ ...piece, quantity: 30 });
  assert.equal(lines.length, 1);
  assert.equal(lines[0].lineId, lineId);
  assert.equal(lines[0].sku, piece.sku);
  assert.equal(lines[0].variantId, piece.variantId);
  assert.equal(lines[0].quantity, 99);
  assert.equal(lines[0].lineTotalCents, 99 * piece.unitPriceCents);
  assert.equal(updateLocalLineQuantity(lineId, 130).lines[0].quantity, 99);
  assert.ok(checkoutRequest.safeParse({ checkoutId: '2eef0954-da47-4ddb-91fb-ca82459917fb', email: 'cart@example.test', lines }).success);
});

test('a blocked storage write keeps the current cart available through checkout navigation', (t) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  let stored: string | null = null;
  let blocked = false;
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: {
    getItem: () => stored,
    setItem: (_key: string, value: string) => {
      if (blocked) throw new Error('Storage cannot be written');
      stored = value;
    },
  } } });
  t.after(() => {
    blocked = false;
    clearLocalCart();
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
    else Reflect.deleteProperty(globalThis, 'window');
  });

  const [{ lineId }] = addToLocalCart(piece).lines;
  blocked = true;
  addToLocalCart(piece);
  assert.equal(getLocalCart().lines[0].quantity, 2);
  assert.equal(updateLocalLineQuantity(lineId, 4).totalCents, 12_800);
  assert.equal(getLocalCart().shippingCents, 0);

  blocked = false;
  assert.equal(updateLocalLineQuantity(lineId, 3).shippingCents, 690);
  assert.equal(JSON.parse(stored ?? '[]')[0]?.quantity, 3);

  blocked = true;
  clearLocalCart();
  assert.equal(getLocalCart().itemCount, 0);
});
