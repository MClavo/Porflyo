import { SlugInput } from '../slug';

export default function SlugRow({
  slug,
  setSlug,
  currentSlug,
  onAvailabilityChange,
}: {
  slug: string;
  setSlug: (s: string) => void;
  currentSlug?: string | null;
  onAvailabilityChange?: (isAvailable: boolean, isChecking: boolean) => void;
}) {
  return (
    <div className="slug-row">
      <SlugInput value={slug} onChange={setSlug} currentSlug={currentSlug ?? undefined} onAvailabilityChange={onAvailabilityChange} />
    </div>
  );
}
