import { LegalPage } from '@/components/legal-page';

/** /terms - 服务条款 */
export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="June 2026"
      intro="These terms govern your use of the Nara Charm website and your purchases from us."
      sections={[
        {
          heading: 'Using This Site',
          body: [
            'By using naracharm.com, you agree to these terms. You may not use the site for any unlawful purpose or in a way that harms us or others.',
          ],
        },
        {
          heading: 'Products & Pricing',
          body: [
            'All jewelry is handmade, which means slight variations in color, texture, and dimensions are natural and part of what makes each piece unique.',
            'We make every effort to display accurate colors and details, but screens vary and we cannot guarantee an exact match.',
            'Prices are listed in USD and may change at any time. The price at checkout is the price you pay.',
            'We reserve the right to limit quantities or refuse an order.',
          ],
        },
        {
          heading: 'Orders & Payment',
          body: [
            'When you place an order, you receive an email confirmation. An order is not accepted until we send a shipping confirmation.',
            'Payment is processed securely by Stripe. We accept major credit cards, Apple Pay, Google Pay, and PayPal.',
          ],
        },
        {
          heading: 'Shipping & Returns',
          body: [
            'Shipping and return policies are detailed on our Shipping and Returns pages and form part of these terms.',
          ],
        },
        {
          heading: 'Intellectual Property',
          body: [
            'All content on this site — including the Nara Charm name, logo, product designs, photos, and text — is our property and protected by law. You may not copy or reuse it without permission.',
          ],
        },
        {
          heading: 'Limitation of Liability',
          body: [
            'Our jewelry is for decorative wear. We are not liable for allergic reactions; please review the materials listed on each product page. Our liability is limited to the value of your order.',
          ],
        },
        {
          heading: 'Contact',
          body: ['Questions about these terms? Email hello@naracharm.com.'],
        },
      ]}
    />
  );
}
