/** Keep local preview configuration out of production search metadata. */
export function resolveSiteUrl(configured: string | undefined, environment: string | undefined) {
  const fallback = 'https://naracharm.com';
  try {
    const url = new URL(configured || fallback);
    if (!['http:', 'https:'].includes(url.protocol)) return fallback;
    const local = url.hostname === 'localhost' || url.hostname.endsWith('.localhost') || url.hostname === '127.0.0.1' || url.hostname === '[::1]';
    return environment === 'production' && local ? fallback : url.origin;
  } catch { return fallback; }
}
