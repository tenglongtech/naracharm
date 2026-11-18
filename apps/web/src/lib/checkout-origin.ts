import { siteConfig } from './site-config';

export function checkoutStorefrontOrigin() {
  const configured = process.env.CHECKOUT_STOREFRONT_ORIGIN;
  if (!configured) return siteConfig.url;
  const url = new URL(configured);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) {
    throw new Error('CHECKOUT_STOREFRONT_ORIGIN must use HTTPS or a loopback development address');
  }
  return url.origin;
}

export function allowedStorefrontOrigins() {
  const authOrigin = process.env.BETTER_AUTH_URL ? new URL(process.env.BETTER_AUTH_URL).origin : undefined;
  return [...new Set([
    siteConfig.url, checkoutStorefrontOrigin(),
    ...(authOrigin ? [authOrigin] : []),
    ...(siteConfig.url === 'https://naracharm.com' ? ['https://www.naracharm.com'] : []),
    ...(process.env.NODE_ENV !== 'production'
      ? ['http://localhost:37000', 'http://localhost:37001', 'http://localhost', 'http://naracharm.test', 'https://naracharm.test']
      : []),
  ])];
}

export function storefrontHeaders(request: Request) {
  const headers = new Headers({ 'Cache-Control': 'no-store', Vary: 'Origin' });
  const origin = request.headers.get('origin');
  if (origin && (allowedStorefrontOrigins().includes(origin) || origin === new URL(request.url).origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
  }
  return headers;
}

export function unsupportedOrigin(request: Request, headers: Headers) {
  return Boolean(request.headers.get('origin') && !headers.has('Access-Control-Allow-Origin'));
}

export function storefrontPreflight(request: Request) {
  const headers = storefrontHeaders(request);
  return new Response(null, { headers, status: unsupportedOrigin(request, headers) ? 403 : 204 });
}
