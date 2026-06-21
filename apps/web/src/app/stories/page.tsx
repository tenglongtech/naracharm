import { ComingSoonPage } from '@/components/coming-soon-page';

/** /stories - 故事集 (Phase 2 接 STORY_DOCTRINE 故事库) */
export default function StoriesPage() {
  return (
    <ComingSoonPage
      eyebrow="Stories in Every Piece"
      title="The Stories Are Being Written"
      subtitle="Every charm carries a tale worth telling."
      description="We are gathering the craft stories behind each piece — the silversmiths, the weavers, the braiders, and the meaning woven into every knot. Soon you will be able to read them all here."
      cta={{ href: '/collections', label: 'Browse Pieces While You Wait' }}
    />
  );
}
