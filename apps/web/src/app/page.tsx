import { pageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import Image from '@/components/storefront-image';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { ProductTile } from '@/components/product-tile';
import { getActiveProducts, getAllCollections } from '@/lib/storefront';
import { productCard } from '@/lib/catalog';
import { getArticleBySlug } from '@/lib/blog-data';
import { editorialArt } from '@/lib/editorial-art';
import { COLLECTION_EDITORIALS } from '@/lib/collection-editorials';
import { CATEGORIES } from '@/lib/categories';
import { siteConfig } from '@/lib/site-config';
import { STUDIO_SERIES } from '@/lib/studio-designs';
import collectionStyles from './collection-tones.module.css';
import styles from './home.module.css';

const campaignImage = '/editorial/nara-worn-close.webp';
const campaignAlt = 'Red stone beads, a hammered silver pendant and a green drop earring worn with an ivory linen top';

export const metadata = pageMetadata({
  title: 'Nara Charm | Heritage-Inspired Jewelry & Phone Charms',
  description: 'Shop Nara Charm bracelets, pendants, earrings and phone charms. Explore craft-inspired designs and practical guides to fit, materials and care.',
  path: '/',
  image: { url: campaignImage, width: 1536, height: 1024, alt: campaignAlt },
});

const homeGuides = ['how-to-layer-necklaces-and-bracelets', 'choosing-openwork-earrings', 'everyday-jewelry-care-storage'];
const featuredPieces = ['caravan-fusion-necklace', 'tibetan-amulet-925-bracelet', 'amethyst-earrings-silver', 'tai-silk-cord-phone-charm'];
const studioNotes: Record<string, string> = {
  'ink-silver': 'Open wire silhouettes',
  'steppe-lines': 'Folded, braided and knotted cord',
  'jade-and-paper': 'Celadon and softly cut curves',
};
const studioEdits = STUDIO_SERIES.filter(({ slug }) => slug in studioNotes);

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true">{diagonal ? '↗' : '→'}</span>;
}

export default async function HomePage() {
  const [catalog, collections] = await Promise.all([getActiveProducts(), getAllCollections()]);
  const products = catalog.filter((product) => product.availability !== 'preview' && product.stock > 0);
  const collectionSlugs = new Set(collections.map(({ slug }) => slug));
  const collectionFeatures = COLLECTION_EDITORIALS.filter(({ slug }) => collectionSlugs.has(slug));
  const markedFeatured = products.filter((product) => product.isFeatured);
  const curated = featuredPieces.flatMap((slug) => markedFeatured.filter((product) => product.slug === slug));
  const featured = [...new Set([...curated, ...markedFeatured, ...products])].slice(0, 4);
  const [leadArticle, ...otherArticles] = homeGuides.map(getArticleBySlug).filter((article) => article !== undefined);
  const leadArt = leadArticle && editorialArt(leadArticle);
  const website = { '@context': 'https://schema.org', '@type': 'WebSite', name: siteConfig.brand, url: siteConfig.url };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <SiteHeader />
      <main id="main" className={styles.home}>
        <section className={styles.hero} aria-labelledby="home-title">
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Heritage-inspired jewelry</p>
            <h1 id="home-title" className={styles.heroTitle}>Rooted in craft. <em>Worn close.</em></h1>
            <p className={styles.heroDescription}>Carved stone, worked silver and woven cord. Jewelry inspired by the craft traditions of Asia.</p>
            <div className={styles.heroLinks}>
              <Link href="/shop" className={styles.primaryLink}>Shop jewelry <Arrow /></Link>
              <Link prefetch={false} href="/studio" className={styles.textLink}>Explore the studio <Arrow diagonal /></Link>
            </div>
          </div>
          <figure className={styles.campaign}>
            <Image src={campaignImage} alt={campaignAlt} fill preload sizes="(max-width: 899px) 100vw, 60vw" className={styles.campaignImage} />
            <figcaption>AI styling illustration</figcaption>
          </figure>
        </section>

        {collectionFeatures.length > 0 && <section className={`${styles.shell} ${styles.section} ${styles.collections}`} aria-labelledby="home-collections">
          <div className={styles.sectionHeading}>
            <h2 id="home-collections">Collections</h2>
            <Link prefetch={false} href="/collections" className={styles.textLink}>All collections <Arrow diagonal /></Link>
          </div>
          <ul className={styles.collectionGrid}>
            {collectionFeatures.map(({ slug, title, note, image, tone }, index) => (
              <li key={slug}>
                <Link prefetch={false} href={`/collections/${slug}`} className={`${styles.collectionLink} ${collectionStyles.tone}`} data-tone={tone}>
                  <div className={styles.collectionImage}>
                    <Image src={image} alt="" fill sizes={collectionFeatures.length === 1
                      ? '(max-width: 1440px) 90vw, 1280px'
                      : index === 0
                        ? '(max-width: 767px) 92vw, (max-width: 1440px) 51vw, 724px'
                        : '(max-width: 767px) 41vw, (max-width: 1440px) 21vw, 270px'} />
                  </div>
                  <div className={styles.collectionCopy}>
                    <h3>{title}</h3>
                    <p>{note}</p>
                    <Arrow diagonal />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <p className={styles.studyNote}>Illustrative material studies</p>
        </section>}

        <section className={styles.shop} aria-labelledby="home-shop">
          <div className={`${styles.shell} ${styles.section}`}>
            <div className={styles.sectionHeading}>
              <h2 id="home-shop">Featured jewelry</h2>
              <Link prefetch={false} href="/shop" className={styles.textLink}>Shop all jewelry <Arrow diagonal /></Link>
            </div>
            <nav aria-label="Shop by category" className={styles.categoryNav}>
              {CATEGORIES.map(({ slug, name }) => <Link prefetch={false} key={slug} href={`/collections/${slug}`}>{name}</Link>)}
            </nav>
            {featured.length > 0 && (
              <div className={styles.products}>
                {featured.map((product) => <ProductTile key={product.slug} product={productCard(product)} />)}
              </div>
            )}
          </div>
        </section>

        <section className={styles.studio}>
          <div className={`${styles.shell} ${styles.studioLayout}`}>
            <figure className={styles.studioFigure}>
              <div className={styles.studioFrame}>
                <Image src="/editorial/cord-and-silver.webp" alt="Deep red braided cord threaded through a hammered silver bead on rough paper" fill sizes="(max-width: 767px) 100vw, (max-width: 1450px) 54vw, 740px" className="object-cover" />
              </div>
              <figcaption>Illustrative material study</figcaption>
            </figure>
            <div className={styles.studioCopy}>
              <h2>Inside the <em>studio.</em></h2>
              <p>Follow a single detail from material to form in each of our jewelry design studies.</p>
              <ul className={styles.studioEdits}>
                {studioEdits.map(({ slug, name }) => (
                  <li key={slug}>
                    <Link prefetch={false} href={`/collections/${slug}`}>
                      <span className={styles.editName}>{name}</span>
                      <span className={styles.editNote}>{studioNotes[slug]}</span>
                      <Arrow diagonal />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link prefetch={false} href="/studio" className={styles.textLink}>All studio collections <Arrow /></Link>
            </div>
          </div>
        </section>

        {leadArticle && (
          <section className={`${styles.shell} ${styles.section}`}>
            <div className={styles.sectionHeading}>
              <h2>The Nara Journal</h2>
              <Link prefetch={false} href="/blog" className={styles.textLink}>Browse the journal <Arrow diagonal /></Link>
            </div>
            <div className={styles.journal}>
              <Link prefetch={false} href={`/blog/${leadArticle.slug}`} className={styles.journalFeature}>
                {leadArt && <div className={styles.journalImage}><Image src={leadArt.src} alt={leadArt.alt} fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" /></div>}
                <div>
                  <p className={styles.kicker}>{leadArticle.category}</p>
                  <h3>{leadArticle.title}</h3>
                </div>
              </Link>
              <ul className={styles.journalIndex}>
                {otherArticles.map((article) => (
                  <li key={article.slug}>
                    <Link prefetch={false} href={`/blog/${article.slug}`}>
                      <div>
                        <p className={styles.kicker}>{article.category}</p>
                        <h3>{article.title}</h3>
                      </div>
                      <Arrow diagonal />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
        <div className={styles.help}>
          <nav aria-label="Shopping help" className={`${styles.shell} ${styles.helpLinks}`}>
            <Link prefetch={false} href="/gift-guide">Choose a jewelry gift <Arrow diagonal /></Link>
            <Link prefetch={false} href="/size-guide">Find your fit <Arrow diagonal /></Link>
            <Link prefetch={false} href="/shipping">Check delivery options <Arrow diagonal /></Link>
          </nav>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
