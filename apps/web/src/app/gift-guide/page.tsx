import { pageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import Image from '@/components/storefront-image';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { Breadcrumb } from '@/components/breadcrumb';
import { ProductTile } from '@/components/product-tile';
import { getActiveProducts } from '@/lib/storefront';
import { productCard } from '@/lib/catalog';
import { giftSelections } from '@/lib/gift-selections';
import { absoluteUrl, serializeJsonLd } from '@/lib/seo';
import styles from '../buying-guides.module.css';

const hero = {
  image: '/editorial/nara-gift-still-life.webp',
  alt: 'Illustrative gift styling with a pale green lotus pendant, cream note and warm red ribbon',
};
const path = '/gift-guide';
const description = 'Shop in-stock jewelry gifts by price. Compare bracelets, pendants, earrings and phone charms, and check fit and delivery before ordering.';

export const metadata = pageMetadata({
  title: 'Jewelry Gift Guide | Bracelets, Pendants & Charms',
  description,
  path,
  image: { url: hero.image, alt: hero.alt, width: 1536, height: 1024 },
});

const recipientChoices = [
  { title: 'Bracelets', slug: 'bracelets', note: 'Use a bracelet they already wear or their wrist measurement to compare the listed fit range.' },
  { title: 'Necklaces', slug: 'necklaces', note: 'Look at their usual neckline and compare the length of a necklace they reach for often.' },
  { title: 'Earrings', slug: 'earrings', note: 'Choose the kind of fastening they like and compare the drop with earrings they already wear.' },
  { title: 'Phone charms', slug: 'phone-charms', note: 'Check whether their phone case has a compatible attachment point.' },
];

export default async function GiftGuidePage() {
  const budgets = giftSelections(await getActiveProducts());
  const picks = budgets.flatMap(({ picks }) => picks);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Nara Charm Jewelry Gift Guide',
    description,
    url: absoluteUrl(path),
    ...(picks.length ? {
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: picks.length,
        itemListElement: picks.map(({ slug, name }, index) => ({
          '@type': 'ListItem', position: index + 1, name, url: absoluteUrl(`/products/${slug}`),
        })),
      },
    } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      <SiteHeader />
      <main id="main" className={styles.guide}>
        <header className={styles.hero}>
          <div className={styles.shell}>
            <Breadcrumb items={[{ label: 'Gift guide' }]} />
            <div className={styles.spread}>
              <div className={styles.heroCopy}>
                <h1>Jewelry gifts. <em>Chosen well.</em></h1>
                <p>Start with a color or a shape they already wear. Check the fit, then find a piece in your budget.</p>
                <Link href="#gift-budget" className={styles.primaryLink}>Browse by price <span aria-hidden="true">↓</span></Link>
              </div>
              <figure className={styles.heroImage}>
                <Image src={hero.image} alt={hero.alt} fill preload sizes="(max-width: 799px) 89vw, (max-width: 1439px) 50vw, 660px" />
                <figcaption>Illustrative gift styling</figcaption>
              </figure>
            </div>
          </div>
        </header>

        <nav aria-label="Gift planning" className={styles.jumpBar}>
          <ul className={styles.shell}>
            <li><Link href="/size-guide">Check jewelry fit <span aria-hidden="true">↗</span></Link></li>
            <li><Link href="/shipping">Delivery estimates <span aria-hidden="true">↗</span></Link></li>
            <li><Link href="/blog/choose-a-meaningful-jewelry-gift">Gift advice <span aria-hidden="true">↗</span></Link></li>
          </ul>
        </nav>

        <section id="gift-budget" className={`${styles.shell} ${styles.section}`} aria-labelledby="gift-budget-heading">
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="gift-budget-heading">Gifts by price</h2>
              <p>In-stock picks in USD. Shipping is separate.</p>
            </div>
            <Link href="/shop" className={styles.textLink}>See all jewelry <span aria-hidden="true">↗</span></Link>
          </div>
          {budgets.length > 0 ? (
            <>
              <nav aria-label="Gift budgets" className={styles.budgetLinks}>
                {budgets.map(({ id, label }) => <Link key={id} href={`#${id}`}>{label} <span aria-hidden="true">↓</span></Link>)}
              </nav>
              {budgets.map(({ id, label, description: note, picks }) => (
                <section key={id} id={id} className={styles.budget} aria-labelledby={`${id}-title`}>
                  <h3 id={`${id}-title`}>{label}</h3>
                  <p>{note}</p>
                  <div className={styles.products}>
                    {picks.map((product) => <ProductTile key={product.slug} product={productCard(product)} heading="h4" />)}
                  </div>
                </section>
              ))}
            </>
          ) : <p className={styles.empty}>For availability and help finding a gift, <Link href="/contact" className={styles.textLink}>contact us</Link>.</p>}
        </section>

        <section className={styles.choicePanel} aria-labelledby="gift-choice-heading">
          <div className={`${styles.shell} ${styles.section}`}>
            <div className={styles.sectionHeading}>
              <h2 id="gift-choice-heading">Choose by what they wear</h2>
            </div>
            <div className={styles.choiceGrid}>
              {recipientChoices.map(({ title, slug, note }) => (
                <div key={slug}>
                  <h3><Link href={`/collections/${slug}`}>{title} <span aria-hidden="true">↗</span></Link></h3>
                  <p>{note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
