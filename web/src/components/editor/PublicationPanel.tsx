import { PublicationSettings } from '../portfolio';

export default function PublicationPanel({
  isPublished,
  setIsPublished,
  slug,
  isSlugAvailable,
  isCheckingSlug,
  onPublish,
  isPublishing,
}: {
  isPublished: boolean;
  setIsPublished: (v: boolean) => void;
  slug: string;
  isSlugAvailable: boolean;
  isCheckingSlug: boolean;
  onPublish: () => void;
  isPublishing: boolean;
}) {
  return (
    <PublicationSettings
      isPublished={isPublished}
      onPublishedChange={setIsPublished}
      slug={slug}
      isSlugAvailable={isSlugAvailable}
      isCheckingSlug={isCheckingSlug}
      onPublish={onPublish}
      isPublishing={isPublishing}
    />
  );
}
