import { pageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import Image from '@/components/storefront-image';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { getArticleBySlug, getArticlesByCategory, isPublishedGuide } from '@/lib/blog-data';
import { editorialArt } from '@/lib/editorial-art';
import { JOURNAL_TOPICS } from '@/lib/journal-topics';
import { absoluteUrl, serializeJsonLd } from '@/lib/seo';
import styles from './journal-index.module.css';

const lead = getArticleBySlug('how-to-layer-necklaces-and-bracelets');
const leadArt = lead && editorialArt(lead);

const startingGuides = [
  { slug: 'bracelet-size-guide-how-to-measure', label: 'Measure your wrist' },
  { slug: 'everyday-jewelry-care-storage', label: 'Care for everyday jewelry' },
  { slug: 'choose-a-meaningful-jewelry-gift', label: 'Choose a jewelry gift' },
].filter(({ slug }) => {
  const article = getArticleBySlug(slug);
  return article && isPublishedGuide(article);
});

export const metadata = pageMetadata({
  title: 'The Nara Journal | Jewelry Guides and Ideas',
  description: 'Find practical jewelry guides for checking fit, layering pieces, caring for stone and cord, and choosing gifts.',
  path: '/blog',
  image: leadArt ? { url: leadArt.src, alt: leadArt.alt } : undefined,
});

export default function BlogPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'The Nara Journal',
    url: absoluteUrl('/blog'),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: JOURNAL_TOPICS.map(({ slug, title }, index) => ({
        '@type': 'ListItem', position: index + 1, name: title, url: absoluteUrl(`/blog/topic/${slug}`),
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      <SiteHeader />
      <main id="main" className={styles.index}>
        <header className={styles.hero}>
          <div className={`${styles.shell} ${styles.spread}`}>
            <div className={styles.intro}>
              <h1>The Nara <em>Journal.</em></h1>
              <p>Practical guides to fit, care and wearing jewelry, with a closer look at the materials and motifs behind each piece.</p>
              <a className={styles.topicJump} href="#journal-topics">Browse topics <span aria-hidden="true">↓</span></a>
              <nav aria-label="Common jewelry questions" className={styles.quickLinks}>
                <ul>
                  {startingGuides.map(({ slug, label }) => (
                    <li key={slug}><Link href={`/blog/${slug}`}>{label} <span aria-hidden="true">↗</span></Link></li>
                  ))}
                </ul>
              </nav>
            </div>
            {lead && isPublishedGuide(lead) && (
              <article className={styles.lead}>
                <Link href={`/blog/${lead.slug}`}>
                  {leadArt && (
                    <div className={styles.leadImage}>
                      <Image src={leadArt.src} alt="" fill preload sizes="(max-width: 799px) 90vw, (max-width: 1439px) 50vw, 728px" />
                      <span>Editorial illustration</span>
                    </div>
                  )}
                  <div className={styles.leadCopy}>
                    <p>{lead.category} <span aria-hidden="true">·</span> {lead.readingTime}</p>
                    <h2>{lead.title}</h2>
                    <span aria-hidden="true">↗</span>
                  </div>
                </Link>
              </article>
            )}
          </div>
        </header>

        <section id="journal-topics" className={`${styles.shell} ${styles.topics}`} aria-labelledby="topics-title" tabIndex={-1}>
          <h2 id="topics-title">Browse by topic</h2>
          <ul className={styles.topicList}>
            {JOURNAL_TOPICS.map((topic) => {
              const guides = getArticlesByCategory(topic.category);
              const featured = guides.find(({ slug }) => slug === topic.featured && slug !== lead?.slug);
              return (
                <li key={topic.slug} className={styles.topic} style={{ backgroundColor: topic.backdrop }}>
                  <Link href={`/blog/topic/${topic.slug}`} className={styles.topicLink}>
                    <div className={styles.topicImage}>
                      <Image src={topic.cover.src} alt="" fill sizes="(max-width: 479px) 31vw, (max-width: 1439px) 16vw, 175px" />
                    </div>
                    <div className={styles.topicCopy}>
                      <h3>{topic.title}</h3>
                      <p>{topic.description}</p>
                      <span>{guides.length} {guides.length === 1 ? 'guide' : 'guides'}</span>
                    </div>
                    <span aria-hidden="true">↗</span>
                  </Link>
                  {featured && <Link href={`/blog/${featured.slug}`} className={styles.topicGuide}>{featured.title} <span aria-hidden="true">↗</span></Link>}
                </li>
              );
            })}
          </ul>
          <p className={styles.topicCaption}>Topic images are editorial illustrations.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
