import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';

/** /size-guide - 尺码/测量指南 */
export const metadata: Metadata = { title: 'Size Guide' };

export default function SizeGuidePage() {
  return (
    <LegalPage
      title="Size Guide"
      intro="How to measure and choose the right fit. When in doubt, measure twice — or email us for help."
      sections={[
        {
          heading: 'How to Measure Your Wrist (for Bracelets)',
          body: [
            '1. Wrap a flexible tape measure (or a strip of paper) snugly around your wrist bone.',
            '2. Note the length in centimeters.',
            '3. Add 1–1.5cm for a comfortable fit (more for a looser feel).',
            '4. Match to the bracelet size: Small ≈ 15cm, Medium ≈ 17cm, Large ≈ 19cm.',
          ],
        },
        {
          heading: 'Bracelet Sizes',
          body: [
            'Small (15cm / 5.9in) — fits wrists ~13.5–14cm.',
            'Medium (17cm / 6.7in) — fits wrists ~15.5–16cm. Most common.',
            'Large (19cm / 7.5in) — fits wrists ~17.5–18cm.',
            'Many of our cord bracelets are adjustable with a slip knot.',
          ],
        },
        {
          heading: 'Necklace Lengths',
          body: [
            '16 inch (40cm) — sits at the collarbone. A choker-like, close fit.',
            '18 inch (45cm) — sits just below the collarbone. The most popular length.',
            '20 inch (50cm) — sits at the top of the chest. Good for layering.',
            'Tip: layer a 16in and a 20in for a styled, layered look.',
          ],
        },
        {
          heading: 'Ring Sizes (if applicable)',
          body: [
            'We list ring sizes in US standard. To convert: US 5 = EU 49, US 6 = EU 52, US 7 = EU 54, US 8 = EU 57.',
            'Measure an existing ring that fits by matching its inner diameter to a sizing chart.',
          ],
        },
        {
          heading: 'Bead Sizes',
          body: [
            '6mm beads — delicate, subtle.',
            '8mm beads — our most common size, balanced presence.',
            '10mm+ beads — bold, statement.',
            'Bead sizes are listed on each product page.',
          ],
        },
        {
          heading: 'Still Unsure?',
          body: [
            'Email hello@naracharm.com with your measurements and the piece you\'re considering — we\'ll recommend the best fit.',
          ],
        },
      ]}
    />
  );
}
