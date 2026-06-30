import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Nara Charm collects, uses, and protects your personal data. GDPR and CCPA compliant. Your data is never sold.',
  alternates: { canonical: '/privacy' },
};

/** /privacy - 隐私政策 */
export default function PrivacyPage() {
  const c = siteConfig.company;
  return (
    <LegalPage
      title="Privacy Policy"
      updated="June 2026"
      intro="This policy explains what information we collect, why, and how we protect it."
      sections={[
        {
          heading: 'Data Controller',
          body: [
            `The data controller responsible for your personal data is ${c.name}, ${c.address}.`,
            `For any privacy-related questions or requests, contact us at ${c.privacyEmail}.`,
          ],
        },
        {
          heading: 'Information We Collect',
          body: [
            'When you place an order or create an account, we collect your name, email, shipping address, and payment details (processed securely by Stripe; we never store your full card number).',
            'We also collect browsing data (such as pages viewed) through privacy-friendly analytics to improve our store.',
          ],
        },
        {
          heading: 'How We Use Your Information',
          body: [
            'To process and ship your orders, and to contact you about them.',
            'To send you updates and offers, only if you have subscribed. You can unsubscribe at any time.',
            'To improve our products, website, and customer service.',
          ],
        },
        {
          heading: 'Data Sharing',
          body: [
            'We share your data only with the services needed to fulfill your order (payment processor, shipping carrier, email provider). We never sell your personal information.',
          ],
        },
        {
          heading: 'Your Rights (GDPR & CCPA)',
          body: [
            'You have the right to access, correct, export, or delete the personal data we hold about you.',
            `To exercise any of these rights, email ${c.privacyEmail} and we will respond within 30 days.`,
          ],
        },
        {
          heading: 'Cookies',
          body: [
            'We use only essential cookies required for the cart and checkout to function, plus optional analytics cookies you can decline.',
          ],
        },
        {
          heading: 'Contact',
          body: [`Questions about your privacy? Email ${c.privacyEmail}.`],
        },
      ]}
    />
  );
}
