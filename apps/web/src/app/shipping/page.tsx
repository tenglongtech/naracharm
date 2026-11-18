import { pageMetadata } from '@/lib/page-metadata';
import { OrderPolicyPage } from '@/components/order-policy-page';
import styles from '@/components/order-policy.module.css';
import { siteConfig } from '@/lib/site-config';
import {
  freeShippingFromLabel, shippingCountryCodes, shippingPreparationDays, shippingRegions, shippingTransitDays, standardShippingLabel,
} from '@/lib/store-policies';
import { shippingPolicySchema } from '@/lib/store-policy-schema';

export const metadata = pageMetadata({
  title: 'Shipping and Delivery',
  description: 'Check Nara Charm’s ' + shippingCountryCodes.length + ' shipping destinations, delivery estimates and standard rates. Free standard shipping from ' + freeShippingFromLabel + '.',
  path: '/shipping',
});

export default function ShippingPage() {
  const support = siteConfig.company.supportEmail;

  return (
    <OrderPolicyPage
      path="/shipping"
      title="Shipping & delivery"
      intro="Check where we deliver, how much shipping costs and when to expect your order."
      updated="November 2026"
      schema={shippingPolicySchema()}
    >
      <div className={styles.overview}>
        <section id="standard" aria-labelledby="rates">
          <h2 id="rates">Standard shipping</h2>
          <dl className={styles.metrics}>
            <div><dt>Orders below {freeShippingFromLabel}</dt><dd>{standardShippingLabel}</dd></div>
            <div><dt>Orders of {freeShippingFromLabel} or more</dt><dd>Free</dd></div>
          </dl>
          <p>Rates are in USD and based on your merchandise subtotal before discounts.</p>
        </section>

        <section aria-labelledby="delivery-timing">
          <h2 id="delivery-timing">Delivery estimates</h2>
          <dl className={styles.metrics}>
            <div><dt>Business days to prepare your order</dt><dd>{shippingPreparationDays.min}–{shippingPreparationDays.max}</dd></div>
            <div><dt>Business days in transit</dt><dd>{shippingTransitDays.min}–{shippingTransitDays.max}</dd></div>
          </dl>
          <p>Carrier delays and customs processing can affect delivery.</p>
        </section>
      </div>

      <section className={styles.section} aria-labelledby="destinations">
        <h2 id="destinations">Where we deliver</h2>
        <p>Standard delivery is available to these {shippingCountryCodes.length} destinations.</p>
        <ul className={styles.regions}>
          {shippingRegions.map((region) => (
            <li key={region.name}>
              <h3>{region.name}</h3>
              <ul className={region.name === 'Europe' ? styles.countries : undefined}>
                {region.countries.map((country) => <li key={country.code}>{country.name}</li>)}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <div className={styles.details}>
        <section className={styles.section} aria-labelledby="tracking">
          <h2 id="tracking">Track your order</h2>
          <p>We email tracking details when your order ships. Include your order number if you contact us about a shipment.</p>
          <a href={'mailto:' + support} className={styles.contactLink}>Email order support <span aria-hidden="true">↗</span></a>
        </section>
        <section className={styles.section} aria-labelledby="customs">
          <h2 id="customs">Customs and duties</h2>
          <p>Import taxes, duties or carrier handling fees may apply. Check with your destination’s customs authority for current rules. We declare the actual shipment value.</p>
        </section>
      </div>
    </OrderPolicyPage>
  );
}
