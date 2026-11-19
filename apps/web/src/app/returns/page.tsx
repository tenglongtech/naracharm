import { pageMetadata } from '@/lib/page-metadata';
import { OrderPolicyPage } from '@/components/order-policy-page';
import styles from '@/components/order-policy.module.css';
import { siteConfig } from '@/lib/site-config';
import { DAMAGE_REPORT_DAYS, REFUND_PROCESSING_DAYS, RETURN_WINDOW_DAYS } from '@/lib/store-policies';
import { returnsPolicySchema } from '@/lib/store-policy-schema';

export const metadata = pageMetadata({
  title: 'Returns & Exchanges',
  description: 'See how to request a return within ' + RETURN_WINDOW_DAYS + ' days for eligible jewelry, report damage and check refund and shipping terms.',
  path: '/returns',
});

export default function ReturnsPage() {
  const { contactEmail, returnAddress } = siteConfig.company;
  const returnContact = siteConfig.inquiryFormEnabled ? '/contact?topic=returns' : 'mailto:' + contactEmail + '?subject=Nara%20Charm%20return%20request';

  return (
    <OrderPolicyPage
      path="/returns"
      title="Returns & exchanges"
      intro="Check whether your piece is eligible and what to include in a return request."
      updated="June 2026"
      schema={returnsPolicySchema()}
    >
      <div className={styles.overview}>
        <section aria-labelledby="eligible-returns">
          <h2 id="eligible-returns">Eligible returns</h2>
          <dl className={styles.metrics}>
            <div><dt>From delivery to request an eligible return</dt><dd>{RETURN_WINDOW_DAYS} days</dd></div>
            <div><dt>To report damage on arrival</dt><dd>{DAMAGE_REPORT_DAYS} days</dd></div>
          </dl>
          <p>Unworn, undamaged items are eligible for a refund of the product price, subject to the exceptions below.</p>
        </section>
        <section aria-labelledby="return-request">
          <h2 id="return-request">Request a return</h2>
          <ol className={styles.steps}>
            <li>Contact us with your order number and the reason for your return.</li>
            <li>Wait for the return address in {returnAddress} and mailing instructions.</li>
            <li>After we receive and inspect your item, we issue the refund to your original payment method within {REFUND_PROCESSING_DAYS} business days.</li>
          </ol>
          <a href={returnContact} className={styles.contactLink}>Request a return <span aria-hidden="true">↗</span></a>
        </section>
      </div>

      <div className={styles.details}>
        <section className={styles.section} aria-labelledby="return-exceptions">
          <h2 id="return-exceptions">Exceptions and shipping</h2>
          <ul className={styles.bullets}>
            <li>For hygiene reasons, earrings can only be returned if defective under this store policy.</li>
            <li>Custom or personalized pieces are final sale under this store policy.</li>
            <li>For standard returns, you pay return postage. We cover shipping if the item is defective or we made a mistake. Original shipping charges are refunded in those cases.</li>
          </ul>
          <p>Any statutory consumer rights that apply to your purchase remain available.</p>
        </section>
        <section className={styles.section} aria-labelledby="damage">
          <h2 id="damage">Damage or defects</h2>
          <p>If your piece arrives damaged or defective, contact us within {DAMAGE_REPORT_DAYS} days and keep a photo of the damage. We can arrange a free replacement or a full refund, including shipping.</p>
        </section>
      </div>

      <section className={styles.section} aria-labelledby="exchanges">
        <h2 id="exchanges">Exchanges</h2>
        <p>To change the size or color of an eligible item, you can return it for a refund and order the other option. Contact us if you need help holding stock.</p>
      </section>
    </OrderPolicyPage>
  );
}
