import { LegalPage } from '@/components/legal-page';

/** /shipping - 运输政策 */
export default function ShippingPage() {
  return (
    <LegalPage
      title="Shipping"
      updated="June 2026"
      intro="Every Nara Charm piece is handmade and shipped worldwide from our studio. Here is what to expect."
      sections={[
        {
          heading: 'Processing Time',
          body: [
            'Each piece is made to order by hand. Please allow 1–3 business days for crafting before shipment.',
            'During launches and holidays, processing may take up to 5 business days. We will always notify you of any delay.',
          ],
        },
        {
          heading: 'Shipping Methods & Times',
          body: [
            'Standard International (4PX / tracked): 7–15 business days to most destinations. Free on orders over $120.',
            'Express (DHL / FedEx): 3–5 business days. Available at checkout for an additional fee, recommended for orders over $150.',
            'All shipments include a tracking number, emailed to you once your order ships.',
          ],
        },
        {
          heading: 'Shipping Rates',
          body: [
            'Orders under $120: a flat rate based on your region ($4.90–$8.90) is shown at checkout.',
            'Orders of $120 and above: free standard shipping worldwide.',
          ],
        },
        {
          heading: 'Customs & Duties',
          body: [
            'Orders to the United States: items valued under $800 are generally free of import duties (de minimis).',
            'Orders to the EU and UK: VAT and any customs fees may apply and are the responsibility of the recipient.',
            'We declare the true value of all shipments. We cannot mark orders as gifts.',
          ],
        },
        {
          heading: 'Where We Ship',
          body: [
            'We ship worldwide. If your country is not available at checkout, contact us at hello@naracharm.com and we will do our best to help.',
          ],
        },
      ]}
    />
  );
}
