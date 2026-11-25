'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from '@/components/storefront-image';
import { inquiryPath } from '@/lib/product-inquiry';
import { isExternalProductImage, variantProductMedia } from '@/lib/product-media';
import { variantTitle, type StorefrontVariant } from '@/lib/storefront-offer';
import { useProductVariant } from './use-product-variant';
import styles from './product-gallery.module.css';

type GalleryVariant = Pick<StorefrontVariant, 'sku' | 'name' | 'photoUrls'>;

const illustrationDetails: Partial<Record<string, string>> = {
  '/products/redesigned/editorial-views/mongolian-road-knot-cord-detail.webp': 'Black cord braid and sliding knot',
  '/products/redesigned/editorial-views/mongolian-road-knot-cord-styling.webp': 'Braided cord bracelet worn at the wrist',
  '/products/redesigned/editorial-views/hadas-knot-red-cord-detail.webp': 'Red cord and silver eternity-knot detail',
  '/products/redesigned/editorial-views/hadas-knot-red-cord-styling.webp': 'Red cord bracelet worn at the wrist',
  '/products/redesigned/editorial-views/amethyst-calm-bracelet-detail.webp': 'Deep purple stones and carved silver accent',
  '/products/redesigned/editorial-views/amethyst-calm-bracelet-styling.webp': 'Deep purple amethyst bracelet worn at the wrist',
  '/products/redesigned/editorial-views/amethyst-peace-bracelet-detail.webp': 'Pale violet amethyst facets and slim silver spacers',
  '/products/redesigned/editorial-views/amethyst-peace-bracelet-styling.webp': 'Pale violet amethyst bracelet worn at the wrist',
  '/products/redesigned/editorial-views/strawberry-quartz-bracelet-detail.webp': 'Pink-red quartz and its natural-looking flecks',
  '/products/redesigned/editorial-views/strawberry-quartz-bracelet-styling.webp': 'Strawberry quartz bracelet worn at the wrist',
  '/products/redesigned/editorial-views/rose-quartz-bracelet-detail.webp': 'Milky blush beads and two silver spacers',
  '/products/redesigned/editorial-views/rose-quartz-bracelet-styling.webp': 'Rose quartz bracelet worn at the wrist',
  '/products/redesigned/editorial-views/obsidian-guard-charm-detail.webp': 'Knotted black bead loop and silver connector',
  '/products/redesigned/editorial-views/obsidian-guard-charm-styling.webp': 'Black obsidian bead loop attached to a phone case',
  '/products/redesigned/editorial-views/mixed-crystal-bracelet-detail.webp': 'Purple, pink and clear beads with silver spacers',
  '/products/redesigned/editorial-views/mixed-crystal-bracelet-styling.webp': 'Mixed crystal bracelet worn at the wrist',
  '/products/redesigned/editorial-views/cinnabar-cord-charm-detail.webp': 'Red beads, wrapped cord and silver accent',
  '/products/redesigned/editorial-views/cinnabar-cord-charm-styling.webp': 'Red beaded charm attached to a phone case',
  '/products/redesigned/editorial-views/turquoise-sky-bracelet-detail.webp': 'Turquoise matrix and patterned silver accent',
  '/products/redesigned/editorial-views/turquoise-sky-bracelet-styling.webp': 'Turquoise bracelet worn at the wrist',
  '/products/redesigned/editorial-views/citrine-bracelet-abundance-detail.webp': 'Golden citrine color and patterned silver spacer',
  '/products/redesigned/editorial-views/citrine-bracelet-abundance-styling.webp': 'Golden citrine bracelet worn at the wrist',
  '/products/redesigned/editorial-views/howlite-turquoise-bracelet-detail.webp': 'Dark veining in turquoise-dyed howlite',
  '/products/redesigned/editorial-views/howlite-turquoise-bracelet-styling.webp': 'Turquoise-dyed howlite bracelet worn at the wrist',
  '/products/redesigned/editorial-views/hematite-bracelet-mens-detail.webp': 'Matte charcoal beads and cord closure',
  '/products/redesigned/editorial-views/hematite-bracelet-mens-styling.webp': 'Matte hematite bracelet worn at the wrist',
  '/products/redesigned/editorial-views/unakite-bracelet-balance-detail.webp': 'Olive and salmon mottling beside a silver spacer',
  '/products/redesigned/editorial-views/unakite-bracelet-balance-styling.webp': 'Unakite bracelet worn at the wrist',
  '/products/redesigned/editorial-views/amethyst-earrings-silver-detail.webp': 'Faceted amethyst and silver wire detail',
  '/products/redesigned/editorial-views/amethyst-earrings-silver-styling.webp': 'Amethyst drop earring worn with a charcoal top',
  '/products/redesigned/editorial-views/miao-filigree-drop-earrings-detail.webp': 'Coiled silver wire and openwork petals',
  '/products/redesigned/editorial-views/miao-filigree-drop-earrings-styling.webp': 'Silver flower earring worn with an olive collar',
  '/products/redesigned/editorial-views/caravan-fusion-necklace-detail.webp': 'Turquoise setting and hammered silver texture',
  '/products/redesigned/editorial-views/caravan-fusion-necklace-styling.webp': 'Turquoise pendant worn with a linen collar',
  '/products/redesigned/editorial-views/tibetan-amulet-925-bracelet-detail.webp': 'Hammered silver, turquoise and braided cord detail',
  '/products/redesigned/editorial-views/tibetan-amulet-925-bracelet-styling.webp': 'Turquoise amulet bracelet worn at the wrist',
  '/products/redesigned/editorial-views/tai-silk-cord-phone-charm-detail.webp': 'Burgundy silk braid and silver lotus bead',
  '/products/redesigned/editorial-views/tai-silk-cord-phone-charm-styling.webp': 'Burgundy silk charm looped through a phone case',
  '/products/redesigned/editorial-views/han-jade-lotus-pendant-detail.webp': 'Carved lotus petals and silver bail',
  '/products/redesigned/editorial-views/han-jade-lotus-pendant-styling.webp': 'Carved lotus pendant worn at the collarbone',
  '/products/redesigned/editorial-views/lotus-jade-bracelet-detail.webp': 'Green stone beads and silver lotus accent',
  '/products/redesigned/editorial-views/lotus-jade-bracelet-styling.webp': 'Green stone lotus bracelet worn at the wrist',
  '/products/redesigned/editorial-views/obsidian-guardian-charm-detail.webp': 'Black obsidian beads and engraved silver accent',
  '/products/redesigned/editorial-views/obsidian-guardian-charm-styling.webp': 'Black obsidian charm looped through a phone case',
  '/products/redesigned/obsidian-guardian-charm-bead-study.webp': 'Black obsidian beads, a braided attachment loop and a silver accent',
  '/products/redesigned/tai-silk-cord-phone-charm-lotus-detail.webp': 'Close-up of the silk braid and silver lotus bead',
  '/products/redesigned/caravan-fusion-necklace-metalwork-detail.webp': 'Close-up of the hammered silver and turquoise setting',
};

export function VariantProductGallery({ name, media, variant, variants, fallback }: {
  name: string;
  media: Parameters<typeof variantProductMedia>[0];
  variant: GalleryVariant;
  variants: GalleryVariant[];
  fallback: ReactNode;
}) {
  const selected = useProductVariant(variant, variants);
  const { images, imageKind } = variantProductMedia(media, selected);
  const photoInquiry = imageKind !== 'photo' ? inquiryPath(name, selected.sku, selected.name, { type: 'photo' }) : undefined;
  if (!images.length) return <>{fallback}{photoInquiry && <ProductPhotoInquiryLink href={photoInquiry} />}</>;
  return <ProductGallery
    key={selected.sku} name={selected.photoUrls?.length ? variantTitle(name, selected) : name}
    images={images} kind={imageKind} photoInquiry={photoInquiry}
  />;
}

export function ProductPhotoInquiryLink({ href }: { href: string }) {
  return <Link prefetch={false} href={href} className={styles.photoInquiry}>Ask for a close-up photo <span aria-hidden="true">↗</span></Link>;
}

export function ProductGallery({ name, images, kind, preview = false, photoInquiry, showCaption = true }: {
  name: string;
  images: string[];
  kind?: 'photo' | 'illustration';
  preview?: boolean;
  photoInquiry?: string;
  showCaption?: boolean;
}) {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const dialogId = useId();
  const src = images[selected];
  if (!src) return null;

  const detail = kind === 'illustration' ? illustrationDetails[src] : undefined;
  const viewDescription = detail ? `: ${detail}` : selected > 0 ? `, view ${selected + 1}` : '';
  const alt = `${name}${viewDescription}`;

  function enlarge() {
    dialog.current?.showModal();
    setExpanded(true);
  }

  const enlargeButton = (
    <button type="button" className={styles.enlarge} aria-controls={dialogId} aria-haspopup="dialog" onClick={enlarge}>
      <span aria-hidden="true">⤢</span> Enlarge
    </button>
  );

  return (
    <figure className={styles.gallery} data-views={images.length > 1 ? 'multiple' : 'single'} data-preview={preview || undefined}>
      <div className={styles.frame} data-image-kind={kind}>
        <Image
          key={src} src={src} alt={alt} unoptimized={isExternalProductImage(src)} fill
          preload={selected === 0} loading={selected === 0 ? undefined : 'eager'}
          sizes={images.length > 1
            ? '(max-width: 767px) calc(100vw - 36px), (max-width: 1351px) 43vw, 565px'
            : '(max-width: 767px) calc(100vw - 36px), (max-width: 1351px) 49vw, 640px'}
        />
        {(!preview || !showCaption) && enlargeButton}
      </div>
      {images.length > 1 && (
        <div role="group" aria-label="Product image views" className={styles.thumbnails}>
          {images.map((image, index) => {
            const summary = kind === 'illustration' ? illustrationDetails[image] : undefined;
            return (
              <button key={image} type="button" aria-label={summary ? `Show ${summary.toLowerCase()}` : `Show image ${index + 1} of ${images.length}`} aria-pressed={selected === index} onClick={() => setSelected(index)}>
                <Image src={image} alt="" unoptimized={isExternalProductImage(image)} fill sizes="64px" />
              </button>
            );
          })}
        </div>
      )}
      <dialog id={dialogId} ref={dialog} aria-label={`${name} image viewer`} onClose={() => setExpanded(false)} className={styles.dialog}>
        <div className={styles.viewer}>
          <button type="button" className={styles.close} onClick={() => dialog.current?.close()}>Close <span aria-hidden="true">×</span></button>
          {expanded && <Image src={src} alt={alt} unoptimized={isExternalProductImage(src)} fill loading="eager" sizes="(max-width: 767px) 95vw, 760px" />}
        </div>
      </dialog>
      {showCaption && (preview || detail || photoInquiry) && (
        <figcaption className={styles.caption}>
          <span>{detail ? `${detail}.` : preview ? 'Upcoming studio design.' : 'Want to see this piece in hand?'}</span>
          {preview && enlargeButton}
          {photoInquiry && <ProductPhotoInquiryLink href={photoInquiry} />}
        </figcaption>
      )}
    </figure>
  );
}
