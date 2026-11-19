import { pageMetadata } from '@/lib/page-metadata';
import { LegalPage } from '@/components/legal-page';
import { siteConfig } from '@/lib/site-config';
import Link from 'next/link';

export const metadata = pageMetadata({
  title: 'Privacy Policy',
  description: 'How Nara Charm handles information you share when contacting us or using this website.',
  path: '/privacy',
});

/** /privacy - 隐私政策 */
export default function PrivacyPage() {
  const c = siteConfig.company;
  const privacyContact = siteConfig.inquiryFormEnabled
    ? <Link href="/contact?topic=privacy" className="text-brand underline">Submit a privacy request</Link>
    : `For privacy-related questions or requests, contact us at ${c.privacyEmail}.`;
  return (
    <LegalPage
      title="Privacy Policy"
      updated={siteConfig.inquiryFormEnabled ? 'November 2026' : 'June 2026'}
      intro="This policy explains what information we collect, why, and how we protect it."
      sections={[
        {
          heading: 'Data Controller',
          body: [
            `The data controller responsible for your personal data is ${c.name}, ${c.address}.`,
            privacyContact,
          ],
        },
        {
          heading: 'Information We Collect',
          body: [
            siteConfig.checkoutEnabled
              ? 'When you place an order or create an account, we collect your name, email, shipping address, and payment details (processed securely by Stripe; we never store your full card number).'
              : 'The website currently has no payment form.',
            siteConfig.inquiryFormEnabled
              ? 'When you submit an inquiry, we store your reply email address, the topic, your message and any product or order reference you provide. We use an hourly identifier derived from your connection to limit repeated submissions.'
              : 'When you contact us, we receive the information you include in your email.',
          ],
        },
        {
          heading: 'How We Use Your Information',
          body: [
            'To review and respond to inquiries, including requests about products and existing orders.',
            'To process and ship your orders, and to contact you about them.',
            'To send you updates and offers, only if you have subscribed. You can unsubscribe at any time.',
            'To improve our products, website, and customer service.',
          ],
        },
        {
          heading: 'Data Sharing',
          body: [
            ...(siteConfig.inquiryFormEnabled ? ['Cloudflare hosts our inquiry form and stores submitted inquiry information.'] : []),
            'We use service providers to operate this site, respond to inquiries and fulfill orders. We never sell your personal information.',
          ],
        },
        {
          heading: 'Your Rights (GDPR & CCPA)',
          body: [
            'You have the right to access, correct, export, or delete the personal data we hold about you.',
            siteConfig.inquiryFormEnabled ? privacyContact : `To exercise any of these rights, email ${c.privacyEmail} and we will respond within 30 days.`,
          ],
        },
        {
          heading: 'Cookies and Browser Storage',
          body: [
            siteConfig.checkoutEnabled
              ? 'We use browser storage for your cart and preferences. Account and checkout features use session cookies where needed.'
              : 'The website saves your preferences and selected pieces in your browser.',
          ],
        },
        {
          heading: 'Contact',
          body: [privacyContact],
        },
      ]}
    />
  );
}
