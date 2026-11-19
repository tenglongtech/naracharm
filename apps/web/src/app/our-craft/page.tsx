import { pageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import Image from '@/components/storefront-image';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { Breadcrumb } from '@/components/breadcrumb';
import { absoluteUrl, serializeJsonLd } from '@/lib/seo';
import styles from '../brand-pages.module.css';

const path = '/our-craft';
const title = 'Our Craft & Jewelry Design Notes';
const description = 'Explore three jewelry design studies in wirework, braided fastenings and layered forms, with guides to comparing materials, finishes and fit.';
const hero = {
  image: '/editorial/nara-craft-materials.webp',
  alt: 'Illustrative material study of braided cord, silver-colored wire and a pale green disc on textured paper',
};

export const metadata = pageMetadata({
  title, description,
  path,
  image: { url: hero.image, alt: hero.alt, width: 1536, height: 1024 },
});

const studies = [
  {
    title: 'The space between wires',
    collection: { slug: 'ink-silver', name: 'Ink & Silver' },
    image: '/products/studio/ink-window-drops.webp',
    alt: 'Illustration of two long openwork earrings with a silver curl at the bottom of each frame',
    caption: 'Ink Window Drops',
    detail: 'A small silver-colored curl sits low inside a tall frame. An open center keeps the outline legible as the earring moves, especially against a plain collar.',
    guide: { slug: 'choosing-openwork-earrings', name: 'Choose openwork earrings' },
  },
  {
    title: 'The turn of a braid',
    collection: { slug: 'steppe-lines', name: 'Steppe Lines' },
    image: '/products/studio/long-horizon-braid.webp',
    alt: 'Illustration of a flat tobacco-colored braid turning through a green folded closure',
    caption: 'Long Horizon Braid',
    detail: 'Two tobacco-colored bands come together in a moss-green fold. The crossing shows how the two strands meet and where a closure interrupts the line of the bracelet.',
    guide: { slug: 'how-to-read-a-bracelet-closure', name: 'Compare bracelet closures' },
  },
  {
    title: 'Two layers, one shadow',
    collection: { slug: 'jade-and-paper', name: 'Jade & Paper' },
    image: '/products/studio/paper-moon-pendant.webp',
    alt: 'Illustration of a cream pendant with a green crescent along its lower edge',
    caption: 'Paper Moon Pendant',
    detail: 'A narrow celadon crescent curves along the edge of a cream disc. The overlap puts a shadow along one edge so both shapes read clearly on a plain neckline.',
    guide: { slug: 'what-jade-tone-means', name: 'Read a jade-tone listing' },
  },
];

const guides = [
  { name: 'Materials & finishes', href: '/blog/topic/materials', detail: 'Check what the listing says about the component itself, including the earring hook, pendant or cord.' },
  { name: 'Size & fit', href: '/size-guide', detail: 'Compare the listed dimensions and closure with a piece you already wear.' },
  { name: 'Ask about a piece', href: '/contact?topic=product', detail: 'Send the product name and the detail you want to confirm before choosing.' },
];

export default function OurCraftPage() {
  const schema = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description, url: absoluteUrl(path),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: studies.map(({ collection }, index) => ({
        '@type': 'ListItem', position: index + 1, name: collection.name, url: absoluteUrl(`/collections/${collection.slug}`),
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      <SiteHeader />
      <main id="main" className={styles.page}>
        <div className={styles.shell}><Breadcrumb items={[{ label: 'Our craft' }]} /></div>
        <header className={styles.craftHero}>
          <div className={`${styles.shell} ${styles.craftSpread}`}>
            <div className={styles.heroCopy}>
              <h1>Jewelry design <em>in detail.</em></h1>
              <p>Follow an open line, a folded braid and a layered edge through three Nara Charm studio studies.</p>
              <a href="#design-studies" className={styles.textLink}>Explore the studies <span aria-hidden="true">↓</span></a>
            </div>
            <figure className={styles.craftImage}>
              <Image src={hero.image} alt={hero.alt} fill preload sizes="(max-width: 819px) 89vw, (max-width: 1440px) 48vw, 665px" />
              <figcaption>AI material illustration</figcaption>
            </figure>
          </div>
        </header>

        <section id="design-studies" className={`${styles.shell} ${styles.section}`} aria-labelledby="design-studies-title" tabIndex={-1}>
          <div className={styles.sectionHead}>
            <h2 id="design-studies-title">From material to form</h2>
            <Link href="/studio" className={styles.textLink}>Visit the studio <span aria-hidden="true">↗</span></Link>
          </div>
          <div className={styles.studyList}>
            {studies.map(({ title: heading, collection, image, alt, caption, detail, guide }) => (
              <article key={collection.slug} className={styles.study}>
                <figure className={styles.studyFigure}>
                  <div className={styles.studyImage}>
                    <Image src={image} alt={alt} fill sizes="(max-width: 819px) 89vw, (max-width: 1440px) 43vw, 600px" />
                  </div>
                  <figcaption>{caption} · design illustration</figcaption>
                </figure>
                <div className={styles.studyCopy}>
                  <h3>{heading}</h3>
                  <p>{detail}</p>
                  <Link href={`/collections/${collection.slug}`} className={styles.textLink}>Explore {collection.name} <span aria-hidden="true">↗</span></Link>
                  <Link href={`/blog/${guide.slug}`} className={styles.textLink}>{guide.name} <span aria-hidden="true">↗</span></Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.storyPanel} aria-labelledby="choose-details-title">
          <div className={`${styles.shell} ${styles.section}`}>
            <div className={styles.sectionHead}>
              <div>
                <h2 id="choose-details-title">Before you choose a piece</h2>
                <p>Use the product’s own details to check how it will wear and what it’s made of.</p>
              </div>
            </div>
            <div className={styles.guideGrid}>
              {guides.map(({ name, href, detail }) => (
                <article key={href}>
                  <h3><Link href={href}>{name} <span aria-hidden="true">↗</span></Link></h3>
                  <p>{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
