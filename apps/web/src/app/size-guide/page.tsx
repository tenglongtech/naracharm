import { pageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { Breadcrumb } from '@/components/breadcrumb';
import styles from '../buying-guides.module.css';

export const metadata = pageMetadata({
  title: 'Jewelry Size Guide | Bracelets, Necklaces & Earrings',
  description: 'Measure your wrist, compare necklace and earring lengths, and check whether a phone charm fits your case before you order.',
  path: '/size-guide',
});

const topics = [
  { id: 'bracelet-fit', label: 'Bracelets' },
  { id: 'necklace-fit', label: 'Necklaces' },
  { id: 'earring-fit', label: 'Earrings' },
  { id: 'charm-fit', label: 'Phone charms' },
];

export default function SizeGuidePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className={styles.guide}>
        <header className={styles.hero}>
          <div className={styles.shell}>
            <Breadcrumb items={[{ label: 'Size guide' }]} />
            <div className={`${styles.heroCopy} ${styles.fitIntro}`}>
              <h1>Jewelry <em>size guide.</em></h1>
              <p>Use a flexible tape, a strip of paper or a piece you already wear. Compare your measurement with the details on the product page.</p>
            </div>
          </div>
        </header>
        <nav aria-label="Size guide sections" className={`${styles.jumpBar} ${styles.fitJump}`}>
          <ul className={styles.shell}>
            {topics.map(({ id, label }) => <li key={id}><Link href={`#${id}`}>{label} <span aria-hidden="true">↓</span></Link></li>)}
          </ul>
        </nav>

        <div className={`${styles.shell} ${styles.section} ${styles.fitSections}`}>
          <section id="bracelet-fit" aria-labelledby="bracelet-fit-title">
            <h2 id="bracelet-fit-title">Bracelets</h2>
            <div>
              <ol>
                <li>Wrap a flexible tape or a strip of paper around the spot where you want the bracelet to sit. Keep it flat against the skin without pulling tight.</li>
                <li>Mark the overlap and measure that length. Use this wrist circumference to compare the product’s stated fit range.</li>
                <li>Check the fastening. A stretch bracelet needs to pass over the hand. For an adjustable cord, compare its smallest and largest closed sizes with your wrist.</li>
              </ol>
              <p className={styles.fitExample}>For a wrist measuring 16 cm, a listing that fits wrists from 15.5 to 17 cm includes your measurement. If the listing gives a laid-flat length, ask for the closed fit range.</p>
              <Link href="/blog/bracelet-size-guide-how-to-measure" className={styles.textLink}>Read the bracelet measurement guide <span aria-hidden="true">↗</span></Link>
            </div>
          </section>
          <section id="necklace-fit" aria-labelledby="necklace-fit-title">
            <h2 id="necklace-fit-title">Necklaces</h2>
            <div>
              <p>Use a piece of string to try the listed chain or cord length against the neckline you plan to wear. Measure the string laid flat after you find a length you like.</p>
              <p>Check pendant dimensions and the extender range separately. When layering, try the shortest piece first and leave room so the pendants sit apart.</p>
              <Link href="/collections/necklaces" className={styles.textLink}>Browse necklaces <span aria-hidden="true">↗</span></Link>
            </div>
          </section>
          <section id="earring-fit" aria-labelledby="earring-fit-title">
            <h2 id="earring-fit-title">Earrings</h2>
            <div>
              <p>Measure an earring you already wear from its hook or post to its lowest point. Compare that drop with the listing and check whether a longer pair would touch a collar or scarf.</p>
              <Link href="/blog/choosing-openwork-earrings" className={styles.textLink}>Compare openwork earring styles <span aria-hidden="true">↗</span></Link>
            </div>
          </section>
          <section id="charm-fit" aria-labelledby="charm-fit-title">
            <h2 id="charm-fit-title">Phone charms</h2>
            <div>
              <p>Compare the charm’s attachment loop with a compatible lanyard opening on your case. Check that the charm has room to move clear of the camera and charging port.</p>
              <Link href="/blog/does-my-phone-case-fit-a-charm" className={styles.textLink}>Check your phone case <span aria-hidden="true">↗</span></Link>
            </div>
          </section>
        </div>

        <section className={styles.choicePanel} aria-labelledby="fit-help-title">
          <div className={`${styles.shell} ${styles.section}`}>
            <div className={styles.sectionHeading}>
              <div>
                <h2 id="fit-help-title">Ask about a piece</h2>
                <p>Send us the product name and your measurement so we can check the details with you.</p>
              </div>
              <Link href="/contact" className={styles.textLink}>Contact us <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
