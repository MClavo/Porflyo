export default function DebugInfo({
  portfolioId,
  slug,
  isPublished,
  isSlugAvailable,
  isCheckingSlug,
}: {
  portfolioId?: string | null;
  slug: string;
  isPublished: boolean;
  isSlugAvailable: boolean;
  isCheckingSlug: boolean;
}) {
  return (
    <div style={{ padding: '0.5rem', background: '#f0f0f0', fontSize: '0.75rem', marginBottom: '1rem' }}>
      <strong>Debug Info:</strong><br />
      Portfolio ID: {portfolioId ?? '(debug)'}<br />
      Slug: "{slug}"<br />
      Is Published: {isPublished ? 'Yes' : 'No'}<br />
      Slug Available: {isSlugAvailable ? 'Yes' : 'No'}<br />
      Checking Slug: {isCheckingSlug ? 'Yes' : 'No'}
    </div>
  );
}
