/**
 * ModernActionButtons - Save and publish action buttons
 */

import React from 'react';
import { FiSave, FiUpload, FiLoader } from 'react-icons/fi';
import './ModernActionButtons.css';

export interface ModernActionButtonsProps {
  onSave: () => void;
  isSaving: boolean;
  onPublish?: () => void;
  isPublishing: boolean;
  isEditMode: boolean;
  isPublished: boolean;
  isSlugAvailable: boolean;
}

export const ModernActionButtons: React.FC<ModernActionButtonsProps> = ({
  onSave,
  isSaving,
  onPublish,
  isPublishing,
  isEditMode,
  isPublished,
  isSlugAvailable
}) => {
  const canPublish = isEditMode && isSlugAvailable && !isPublishing && !isSaving;

  return (
    <div className="modern-action-buttons">
      {/* Save Button */}
      <button
        className="modern-action-buttons__save"
        onClick={onSave}
        disabled={isSaving}
        aria-label="Save portfolio"
      >
        <div className="modern-action-buttons__icon">
          {isSaving ? <FiLoader className="modern-action-buttons__spinner" /> : <FiSave size={16} />}
        </div>
        <span className="modern-action-buttons__text">
          {isSaving ? 'Saving...' : 'Save'}
        </span>
      </button>

      {/* Update/Publish Button (only in edit mode) */}
      {isEditMode && onPublish && (
        <button
          className="modern-action-buttons__publish"
          onClick={onPublish}
          disabled={!canPublish}
          aria-label={isPublished ? 'Update portfolio URL and visibility' : 'Publish portfolio'}
        >
          <div className="modern-action-buttons__icon">
            {isPublishing ? <FiLoader className="modern-action-buttons__spinner" /> : <FiUpload size={16} />}
          </div>
          <span className="modern-action-buttons__text">
            {isPublishing ? 'Updating...' : isPublished ? 'Update' : 'Publish'}
          </span>
        </button>
      )}
    </div>
  );
};

export default ModernActionButtons;