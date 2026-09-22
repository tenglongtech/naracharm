import type { Metadata } from 'next';
import ShopPage from '../shop/page';
export const metadata: Metadata = { title: 'Search Jewelry', robots: { index: false, follow: true }, alternates: { canonical: '/shop' } };
export default ShopPage;
