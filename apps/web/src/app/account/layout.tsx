import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { CustomerAccountShell } from '@/components/customer-account-shell';

export const metadata: Metadata = { title: 'Your account', robots: { index: false, follow: false } };

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto min-h-[52vh] max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <CustomerAccountShell>{children}</CustomerAccountShell>
      </main>
      <SiteFooter />
    </>
  );
}
