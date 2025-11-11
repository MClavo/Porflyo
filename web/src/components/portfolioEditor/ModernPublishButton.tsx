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
}

export const ModernPublishButton: React.FC<ModernPublishButtonProps> = ({
  onPublish,
  isPublishing,
  isPublished,
  isSlugAvailable,
  isSaving
}) => {
  const canPublish = isSlugAvailable && !isPublishing && !isSaving;

  return (
    <button
      className="modern-publish-button"
      onClick={onPublish}
      disabled={!canPublish}
      aria-label={isPublished ? 'Update portfolio URL and visibility' : 'Publish portfolio'}
    >
      <div className="modern-publish-button__icon">
        {isPublishing ? <FiLoader className="modern-publish-button__spinner" /> : <FiUpload size={16} />}
      </div>
      <span className="modern-publish-button__text">
        {isPublishing ? 'Updating...' : isPublished ? 'Update' : 'Publish'}
      </span>
    </button>
  );
};

export default ModernPublishButton;
