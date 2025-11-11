import './PublicationSettings.css';

interface PublicationSettingsProps {
  isPublished: boolean;
  onPublishedChange: (published: boolean) => void;
  slug: string;
  isSlugAvailable: boolean;
  isCheckingSlug: boolean;
  onPublish: () => void;
  isPublishing: boolean;
  disabled?: boolean;
}

export function PublicationSettings({
  isPublished,
  onPublishedChange,
  slug,
  isSlugAvailable,
  isCheckingSlug,
  onPublish,
  isPublishing,
  disabled = false
}: PublicationSettingsProps) {
  // Can only publish if slug is available and not empty
  const canPublish = slug && (isSlugAvailable || isCheckingSlug === false) && !isCheckingSlug;

  return (
    <div className="publication-settings">
      <h3 className="publication-title">Publication Settings</h3>
      
      <div className="publication-controls">
        <div className="visibility-control">
          <label className="visibility-label">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => onPublishedChange(e.target.checked)}
              disabled={disabled}
              className="visibility-checkbox"
            />
            <span className="visibility-text">
              Make portfolio visible to public
            </span>
          </label>
          <p className="visibility-description">
            When enabled, your portfolio will be accessible at portfolio.com/p/{slug}
          </p>
        </div>

        <button
          className="publish-button"
          onClick={onPublish}
          disabled={!canPublish || isPublishing || disabled}
        >
          {isPublishing ? 'Updating...' : 'Update Publication Settings'}
        </button>

        {!canPublish && slug && (
          <p className="publish-warning">
            {isCheckingSlug 
              ? 'Checking slug availability...' 
              : !isSlugAvailable 
                ? 'URL is not available. Please choose a different one.'
                : 'Please enter a valid URL.'}
          </p>
        )}
      </div>
    </div>
  );
}