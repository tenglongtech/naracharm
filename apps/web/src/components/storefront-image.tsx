import Image, { getImageProps, type ImageProps } from 'next/image';
import { preload as preloadResource } from 'react-dom';
import staticVariants from '@/data/static-image-variants.json';

type ImageVariants = { key: string; widths: number[] };
const variantsBySource: Readonly<Record<string, ImageVariants>> = staticVariants;

export default function StorefrontImage(props: ImageProps) {
  const variants = typeof props.src === 'string' && props.src.startsWith('/') ? variantsBySource[props.src] : undefined;
  if (!variants || props.unoptimized || props.placeholder === 'blur') return <Image {...props} />;

  const { preload, sizes, ...options } = props;
  const displaySizes = sizes ?? (props.width ? `${props.width}px` : '100vw');
  const { props: { src, ...attributes } } = getImageProps({
    ...options,
    unoptimized: true,
    loading: preload ? 'eager' : props.loading,
    fetchPriority: preload ? 'high' : props.fetchPriority,
  });
  const srcSet = variants.widths
    .map((width) => `/image/${variants.key}-${width}.webp ${width}w`)
    .join(', ');

  if (preload) {
    preloadResource(src, {
      as: 'image', imageSrcSet: srcSet, imageSizes: displaySizes, fetchPriority: 'high',
      crossOrigin: props.crossOrigin, referrerPolicy: props.referrerPolicy,
    });
  }

  // getImageProps applies Next's positioning and lazy-loading defaults.
  return <img {...attributes} sizes={displaySizes} srcSet={srcSet} src={src} />;
}
