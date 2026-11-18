import { Wishlist } from '@/components/wishlist';
import { productCard } from '@/lib/catalog';
import { getActiveProducts } from '@/lib/storefront';

export default async function WishlistPage() {
  return <Wishlist products={(await getActiveProducts()).map(productCard)} />;
}
