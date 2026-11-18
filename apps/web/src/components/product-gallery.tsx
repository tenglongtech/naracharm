'use client';

import { useId, useRef, useState } from 'react';
import Image from '@/components/storefront-image';
import { isExternalProductImage } from '@/lib/product-media';
import styles from './product-gallery.module.css';

export function ProductGallery({ name, images, kind, preview = false }: {
  name: string;
  images: string[];
  kind?: 'photo' | 'illustration';
  preview?: boolean;
}) {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const dialogId = useId();
  const src = images[selected];
  if (!src) return null;

  const alt = `${name}${kind === 'illustration' ? ' design illustration' : ''}${selected > 0 ? `, view ${selected + 1}` : ''}`;

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
        {!preview && enlargeButton}
      </div>
      {images.length > 1 && (
        <div role="group" aria-label="Product image views" className={styles.thumbnails}>
          {images.map((image, index) => (
            <button key={image} type="button" aria-label={`Show image ${index + 1} of ${images.length}`} aria-pressed={selected === index} onClick={() => setSelected(index)}>
              <Image src={image} alt="" unoptimized={isExternalProductImage(image)} fill sizes="64px" />
            </button>
          ))}
        </div>
      )}
      <dialog id={dialogId} ref={dialog} aria-label={`${name} image viewer`} onClose={() => setExpanded(false)} className={styles.dialog}>
        <div className={styles.viewer}>
          <button type="button" className={styles.close} onClick={() => dialog.current?.close()}>Close <span aria-hidden="true">×</span></button>
          {expanded && <Image src={src} alt={alt} unoptimized={isExternalProductImage(src)} fill loading="eager" sizes="(max-width: 767px) 95vw, 760px" />}
        </div>
      </dialog>
      {(preview || kind !== 'photo') && (
        <figcaption className={styles.caption}>
          <span>{kind === 'illustration' ? 'AI-generated design illustration.' : kind === 'photo' ? 'Product photograph.' : 'Catalog image.'}</span>
          {preview && enlargeButton}
        </figcaption>
      )}
    </figure>
  );
}
