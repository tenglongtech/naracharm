import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 合并 className (Tailwind 友好的 cn 工具) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 分 → 元 显示 ($xx.xx) */
export function formatPrice(cents: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}
