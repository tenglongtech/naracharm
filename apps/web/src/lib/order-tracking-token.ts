import { createHmac, timingSafeEqual } from 'node:crypto';
import { checkoutStorefrontOrigin } from './checkout-origin';

const lifetimeSeconds = 180 * 24 * 60 * 60;
const idPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;
const signaturePattern = /^[A-Za-z0-9_-]{43}$/;

function signingSecret() {
  const key = process.env.ORDER_TRACKING_SECRET || process.env.BETTER_AUTH_SECRET;
  return key && key.length >= 32 ? key : undefined;
}

function signature(key: string, payload: string) {
  return createHmac('sha256', key).update('nara-order-tracking/v1/' + payload).digest();
}

export function orderTrackingToken(orderId: string, issuedAt = new Date()) {
  const key = signingSecret();
  if (!key || !idPattern.test(orderId) || !Number.isFinite(issuedAt.getTime())) return undefined;
  const expires = Math.floor(issuedAt.getTime() / 1_000) + lifetimeSeconds;
  const payload = orderId + '.' + expires;
  return payload + '.' + signature(key, payload).toString('base64url');
}

export function orderIdForTrackingToken(token: string, now = new Date()) {
  const key = signingSecret();
  if (!key || token.length > 100) return undefined;
  const [id, expires, encoded, extra] = token.split('.');
  if (extra !== undefined || !idPattern.test(id) || !/^\d{1,13}$/.test(expires ?? '') || !signaturePattern.test(encoded ?? '')) return undefined;
  if (Number(expires) <= Math.floor(now.getTime() / 1_000)) return undefined;
  const supplied = Buffer.from(encoded, 'base64url');
  if (supplied.toString('base64url') !== encoded) return undefined;
  return timingSafeEqual(supplied, signature(key, id + '.' + expires)) ? id : undefined;
}

export function orderTrackingUrl(orderId: string, issuedAt?: Date) {
  const token = orderTrackingToken(orderId, issuedAt);
  if (!token) return undefined;
  const url = new URL('/order-status', checkoutStorefrontOrigin());
  url.hash = token;
  return url.href;
}
