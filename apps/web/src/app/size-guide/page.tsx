import { pageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { Breadcrumb } from '@/components/breadcrumb';
import { absoluteUrl, serializeJsonLd } from '@/lib/seo';
import styles from '../buying-guides.module.css';

export const metadata = pageMetadata({
  title: 'Jewelry Size Guide | Bracelets, Necklaces & Earrings',
  description: 'Measure your wrist in cm or inches, compare 16–24 inch necklace lengths, check earring drops and verify phone charm lanyard fit before ordering.',
  path: '/size-guide',
});

const topics = [
  { id: 'bracelet-fit', label: 'Bracelets' },
  { id: 'necklace-fit', label: 'Necklaces' },
  { id: 'earring-fit', label: 'Earrings' },
  { id: 'charm-fit', label: 'Phone charms' },
];

const wristChart = [
  ['Petite / Small', '14.0 – 15.0 cm', '5.5 – 5.9 in', 'Snug stretch strand or adjustable sliding cord'],
  ['Standard / Medium', '15.5 – 17.0 cm', '6.1 – 6.7 in', 'Fits most standard 6 mm & 8 mm elastic bracelets'],
  ['Relaxed / Large', '17.5 – 19.0 cm', '6.9 – 7.5 in', 'Adjustable braided cord or larger inner circumference'],
];

const necklaceChart = [
  ['16 in', '40 – 41 cm', 'Base of neck / collar', 'Small pendants & open button-down collars'],
  ['18 in', '45 – 46 cm', 'At the collarbone', 'Everyday pendants (most versatile single length)'],
  ['20 in', '50 – 51 cm', 'Just below collarbone', 'Medium statement pendants & fine knitwear'],
  ['22 – 24 in', '56 – 61 cm', 'Upper to mid-chest', 'Layering over high collars or crew-neck sweaters'],
];

const sizeGuideSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Measure Your Wrist and Necklace Length for Jewelry',
  description: 'Step-by-step instructions to measure wrist circumference and compare necklace, earring and phone charm dimensions at home.',
  url: absoluteUrl('/size-guide'),
  step: [
    { '@type': 'HowToStep', name: 'Wrap a paper strip around your wrist', text: 'Wrap a flexible tape or paper strip flat around the spot where you want the bracelet to sit without pulling tight.' },
    { '@type': 'HowToStep', name: 'Mark and read the measurement', text: 'Mark where the strip overlaps, lay it flat against a ruler, and compare the cm or inch value with the product fit range.' },
    { '@type': 'HowToStep', name: 'Test necklace drop with string', text: 'Cut a piece of string to 45 cm (18 in) or 50 cm (20 in) and hold it against your usual neckline to see where a pendant will rest.' },
    { '@type': 'HowToStep', name: 'Check phone case lanyard opening', text: 'Inspect your phone case for a dedicated lanyard eyelet and confirm clear space around the camera and charging port.' },
  ],
};

export default function SizeGuidePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(sizeGuideSchema) }} />
      <SiteHeader />
      <main id="main" className={styles.guide}>
        <header className={styles.hero}>
          <div className={styles.shell}>
            <Breadcrumb items={[{ label: 'Size guide' }]} />
            <div className={`${styles.heroCopy} ${styles.fitIntro}`}>
              <h1>Jewelry <em>size guide.</em></h1>
              <p>Use a flexible tape, a strip of paper or a piece you already wear. Compare your measurement with the conversion tables below and the details on each product page.</p>
            </div>
          </div>
        </header>
        <nav aria-label="Size guide sections" className={`${styles.jumpBar} ${styles.fitJump}`}>
          <ul className={styles.shell}>
            {topics.map(({ id, label }) => <li key={id}><a href={`#${id}`}>{label} <span aria-hidden="true">↓</span></a></li>)}
          </ul>
        </nav>

        <div className={`${styles.shell} ${styles.section} ${styles.fitSections}`}>
          <section id="bracelet-fit" aria-labelledby="bracelet-fit-title" tabIndex={-1}>
            <h2 id="bracelet-fit-title">Bracelets</h2>
            <div>
              <ol>
                <li>Wrap a flexible tape or a strip of paper around the spot where you want the bracelet to sit. Keep it flat against the skin without pulling tight.</li>
                <li>Mark the overlap and measure that length. Use this wrist circumference to compare the product’s stated fit range.</li>
                <li>Check the fastening. A stretch bracelet needs to pass over the hand. For an adjustable cord, compare its smallest and largest closed sizes with your wrist.</li>
              </ol>
              <div className="mt-5 overflow-x-auto border border-border bg-bg">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <caption className="sr-only">Wrist circumference conversion and bracelet fit chart</caption>
                  <thead>
                    <tr className="border-b border-border bg-surface text-ink">
                      <th scope="col" className="px-3 py-2.5 font-semibold">Fit range</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Wrist (cm)</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Wrist (in)</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Recommended style</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-muted">
                    {wristChart.map(([fit, cm, inches, style]) => (
                      <tr key={fit}>
                        <td className="px-3 py-2.5 font-medium text-ink">{fit}</td>
                        <td className="px-3 py-2.5 tabular-nums">{cm}</td>
                        <td className="px-3 py-2.5 tabular-nums">{inches}</td>
                        <td className="px-3 py-2.5">{style}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={styles.fitExample}>For a wrist measuring 16 cm (6.3 in), a listing that fits wrists from 15.5 to 17 cm includes your measurement. Compare <Link href="/blog/bead-size-guide-6mm-vs-8mm-vs-10mm-bracelets" className="text-brand underline underline-offset-4">6 mm, 8 mm and 10 mm bead sizes</Link> when deciding how a strand will sit beside a watch.</p>
              <Link href="/blog/bracelet-size-guide-how-to-measure" className={styles.textLink}>See how to measure your wrist <span aria-hidden="true">↗</span></Link>
            </div>
          </section>
          <section id="necklace-fit" aria-labelledby="necklace-fit-title" tabIndex={-1}>
            <h2 id="necklace-fit-title">Necklaces</h2>
            <div>
              <p>Use a piece of string to try the listed chain or cord length against the neckline you plan to wear. Measure the string laid flat after you find a length you like.</p>
              <p>Check pendant dimensions and the extender range separately. When layering, try the shortest piece first and leave room so the pendants sit apart.</p>
              <div className="mt-5 overflow-x-auto border border-border bg-bg">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <caption className="sr-only">Necklace length placement chart in inches and centimeters</caption>
                  <thead>
                    <tr className="border-b border-border bg-surface text-ink">
                      <th scope="col" className="px-3 py-2.5 font-semibold">Length (in)</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Length (cm)</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Typical placement</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Best paired with</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-muted">
                    {necklaceChart.map(([inches, cm, place, pair]) => (
                      <tr key={inches}>
                        <td className="px-3 py-2.5 font-medium tabular-nums text-ink">{inches}</td>
                        <td className="px-3 py-2.5 tabular-nums">{cm}</td>
                        <td className="px-3 py-2.5">{place}</td>
                        <td className="px-3 py-2.5">{pair}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Link href="/blog/necklace-length-paper-test" className={styles.textLink}>Test necklace length with string <span aria-hidden="true">↗</span></Link>
            </div>
          </section>
          <section id="earring-fit" aria-labelledby="earring-fit-title" tabIndex={-1}>
            <h2 id="earring-fit-title">Earrings</h2>
            <div>
              <p>Measure an earring you already wear from its hook or post to its lowest point. Compare that drop with the listing and check whether a longer pair would touch a collar or scarf.</p>
              <Link href="/blog/reading-earring-drop-length" className={styles.textLink}>Make an earring drop template <span aria-hidden="true">↗</span></Link>
            </div>
          </section>
          <section id="charm-fit" aria-labelledby="charm-fit-title" tabIndex={-1}>
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
