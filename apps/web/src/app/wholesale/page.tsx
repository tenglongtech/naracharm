import { ComingSoonPage } from '@/components/coming-soon-page';

/** /wholesale - 批发合作 */
export default function WholesalePage() {
  return (
    <ComingSoonPage
      eyebrow="Wholesale"
      title="Carry Nara Charm"
      subtitle="Handmade heritage jewelry for your store."
      description="We offer wholesale partnerships to thoughtfully selected boutiques that share our values of craft and meaning. Reach out to wholesale@naracharm.com to request our lookbook and terms."
      cta={{ href: '/about', label: 'Learn About Us' }}
    />
  );
}
