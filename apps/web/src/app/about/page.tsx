import { pageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import Image from '@/components/storefront-image';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { getStoryBySlug } from '@/lib/stories-data';
import { absoluteUrl, serializeJsonLd, storeOrganization } from '@/lib/seo';
import styles from '../brand-pages.module.css';

const path = '/about';
const title = 'About Nara Charm';
const description = 'Meet Nara Charm, a heritage-inspired jewelry studio. Explore the wirework, knots, stone colors and textile details behind our collections.';
const hero = {
  image: '/editorial/nara-brand-portrait.webp',
  alt: 'Illustrative styling portrait with a red stone bracelet, pale pendant and ivory linen',
};

export const metadata = pageMetadata({
  title, description,
  path,
  image: { url: hero.image, alt: hero.alt, width: 1536, height: 1024 },
});

const references = [
  { title: 'Tibetan amulet forms', detail: 'Dark outlines and small blue-green accents.', collection: 'plateau-palette' },
  { title: 'Thai textile folds', detail: 'Edges that brighten where fabric turns.', collection: 'river-silk' },
  { title: 'Han lotus forms', detail: 'Petal outlines, pale greens and open space.', collection: 'jade-and-paper' },
  { title: 'Mongolian cordwork', detail: 'Braids and fastenings with a visible crossing.', collection: 'steppe-lines' },
  { title: 'Miao-inspired wirework', detail: 'Fine lines and the shapes they leave empty.', collection: 'ink-silver' },
];

const relatedStories = [
  { slug: 'silver-that-remembers', image: '/editorial/nara-amulet-study.webp' },
  { slug: 'jade-that-listens', image: '/editorial/nara-jade-study.webp' },
  { slug: 'silk-that-holds-the-light', image: '/editorial/nara-silk-loop-study.webp' },
].flatMap(({ slug, image }) => {
  const story = getStoryBySlug(slug);
  return story ? [{ story, image }] : [];
});

export default function AboutPage() {
  const schema = {
    '@context': 'https://schema.org', '@type': 'AboutPage', name: title, description,
    url: absoluteUrl(path), mainEntity: { '@id': storeOrganization['@id'] },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      <SiteHeader />
      <main id="main" className={styles.page}>
        <header className={styles.aboutHero}>
          <div className={styles.heroCopy}>
            <h1>The Nara Charm <em>studio.</em></h1>
            <p>We design heritage-inspired jewelry around the details that stay with you. A folded cord, an open silver line, a glint of color where stone catches the light.</p>
            <div className={styles.actionRow}>
              <Link href="/collections" className={styles.primaryLink}>Explore collections <span aria-hidden="true">↗</span></Link>
              <Link href="/our-craft" className={styles.textLink}>Our design notes <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
          <figure className={styles.aboutPortrait}>
            <Image src={hero.image} alt={hero.alt} fill preload sizes="(max-width: 819px) 100vw, 60vw" />
            <figcaption>AI styling illustration</figcaption>
          </figure>
        </header>

        <section className={`${styles.shell} ${styles.section} ${styles.aboutOrigins}`} aria-labelledby="design-origins-title">
          <div className={styles.originCopy}>
            <h2 id="design-origins-title">Where the designs begin</h2>
            <p>We start with a detail we can see or feel. The turn in a braid can become a fastening. The gap in an open wire shape can be as memorable as the line itself.</p>
            <p>Our studio notes describe the references behind those choices. For jewelry in the shop, look to the individual product page for its materials and fit.</p>
          </div>
          <ul className={styles.referenceList}>
            {references.map(({ title: reference, detail, collection }) => (
              <li key={collection}>
                <Link href={`/collections/${collection}`}>
                  <span><strong>{reference}</strong><small>{detail}</small></span>
                  <span aria-hidden="true">↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.storyPanel} aria-labelledby="brand-stories-title">
          <div className={`${styles.shell} ${styles.section}`}>
            <div className={styles.sectionHead}>
              <h2 id="brand-stories-title">Stories behind the details</h2>
              <Link href="/stories" className={styles.textLink}>All design stories <span aria-hidden="true">↗</span></Link>
            </div>
            <div className={styles.storyGrid}>
              {relatedStories.map(({ story, image }) => (
                <article key={story.slug}>
                  <Link href={`/stories/${story.slug}`}>
                    <div className={styles.storyImage}>
                      <Image src={image} alt="" fill sizes="(max-width: 639px) 90vw, (max-width: 1439px) 30vw, 420px" />
                    </div>
                    <div className={styles.storyCopy}>
                      <h3>{story.title}</h3>
                      <p>{story.excerpt}</p>
                      <span aria-hidden="true">↗</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
            <p className={styles.studyCaption}>Illustrated design studies</p>
          </div>
        </section>

        <section className={`${styles.shell} ${styles.section} ${styles.visit}`} aria-labelledby="brand-visit-title">
          <div>
            <h2 id="brand-visit-title">From the studio to the shop</h2>
            <p>See the sketches and material studies behind new designs, or browse the current jewelry catalog.</p>
          </div>
          <div className={styles.actionRow}>
            <Link href="/shop" className={styles.primaryLink}>Shop jewelry <span aria-hidden="true">↗</span></Link>
            <Link href="/studio" className={styles.textLink}>Visit the studio <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
