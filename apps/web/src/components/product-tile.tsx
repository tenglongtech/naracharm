import Link from 'next/link';
import Image from 'next/image';

/** 示例产品类型 (Phase 2 用 Drizzle schema 的 Product/Variant 类型替换) */
export type ProductCard = {
  slug: string;
  name: string;
  heritage: string;
  price: string;
  compareAt?: string | null;
  tag?: string | null;
  image?: string;
};

/** 商品卡片 - 首页 Best Sellers / 系列页 / 相关推荐 复用 */
export function ProductTile({ product }: { product: ProductCard }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden rounded-md bg-surface shadow-sm transition-shadow duration-300 group-hover:shadow-lg">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted/40">[product image]</div>
        )}
        {product.tag && (
          <span className="absolute left-2 top-2 rounded-sm bg-brand px-2 py-0.5 text-[10px] font-medium text-bg">
            {product.tag}
          </span>
        )}
      </div>
      <p className="mt-3 text-xs uppercase tracking-wider text-gold">{product.heritage}</p>
      <h3 className="mt-1 font-display text-base leading-snug group-hover:text-brand">
        {product.name}
      </h3>
      <div className="mt-1 flex items-center gap-2 text-sm tabular-nums">
        <span>{product.price}</span>
        {product.compareAt && (
          <span className="text-muted line-through">{product.compareAt}</span>
        )}
      </div>
    </Link>
  );
}
