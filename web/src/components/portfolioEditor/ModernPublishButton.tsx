/**
 * ModernPublishButton - Publish/Update action button
 */

import React from 'react';
import { FiUpload, FiLoader } from 'react-icons/fi';
import './ModernPublishButton.css';

export interface ModernPublishButtonProps {
  onPublish: () => void;
  isPublishing: boolean;
  isPublished: boolean;
  isSlugAvailable: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  currentSlug: string;
  lastVerifiedSlug: string;
}

export const ModernPublishButton: React.FC<ModernPublishButtonProps> = ({
  onPublish,
  isPublishing,
  isPublished,
  isSlugAvailable,
  isSaving,
  hasChanges,
  currentSlug,
  lastVerifiedSlug
}) => {
  // Only allow publish if:
  // 1. Slug is available
  // 2. Not currently publishing or saving
  // 3. There are changes
  // 4. Current slug has been verified (matches last verified slug)
  const slugHasBeenVerified = currentSlug === lastVerifiedSlug;
  const canPublish = isSlugAvailable && !isPublishing && !isSaving && hasChanges && slugHasBeenVerified;

  return (
    <button
      className="publish-button"
      onClick={onPublish}
      disabled={!canPublish}
      aria-label={isPublished ? 'Update portfolio URL and visibility' : 'Publish portfolio'}
    >
      <div className="publish-button__icon">
        {isPublishing ? <FiLoader className="publish-button__spinner" /> : <FiUpload size={16} />}
      </div>
      <span className="publish-button__text">
        {isPublishing ? 'Updating...' : isPublished ? 'Update' : 'Publish'}
      </span>
    </button>
  );
};

export default ModernPublishButton;
