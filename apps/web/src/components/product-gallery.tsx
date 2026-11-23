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
