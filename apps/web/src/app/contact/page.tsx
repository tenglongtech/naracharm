import { pageMetadata } from '@/lib/page-metadata';
import { Suspense } from 'react';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { ContactComposer } from '@/components/contact-composer';
import { siteConfig } from '@/lib/site-config';

export const metadata = pageMetadata({
  title: 'Contact Nara Charm',
  description: 'Ask Nara Charm about an order, the fit or materials of a piece, a studio design or a wholesale inquiry.',
  path: '/contact',
});

export default function ContactPage() {
  const { contactEmail, supportEmail } = siteConfig.company;
  return (
    <>
      <SiteHeader />
      <main id="main" data-inquiry-mode={siteConfig.inquiryFormEnabled ? 'online' : 'email'} className="mx-auto max-w-2xl px-5 py-12 md:py-18">
        <h1 className="font-display text-5xl tracking-tight md:text-7xl">Get in touch.</h1>
        <p className="mt-4 leading-7 text-muted">Ask about a piece, tell us what you would like to see from the studio, or get help with an order.</p>
        {!siteConfig.inquiryFormEnabled && <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-brand">
          <a href={`mailto:${contactEmail}`} className="underline underline-offset-4">{contactEmail}</a>
          {supportEmail !== contactEmail && <a href={`mailto:${supportEmail}`} className="underline underline-offset-4">{supportEmail}</a>}
        </div>}
        <Suspense fallback={<p className="mt-5 text-sm text-muted">Loading inquiry form…</p>}>
          <ContactComposer email={contactEmail} supportEmail={supportEmail} submitOnline={siteConfig.inquiryFormEnabled} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
