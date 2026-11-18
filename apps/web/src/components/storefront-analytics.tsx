'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

export function StorefrontAnalytics() {
  const path = usePathname();
  if (path.startsWith('/admin') || path === '/order-status' || path === '/checkout/success') return null;
  return <Script id="plausible-init" strategy="afterInteractive" data-domain="naracharm.com" src="https://analytics.naralab.org/js/script.js" />;
}
