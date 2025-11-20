/**
 * SaveButton - Save action button
 */

import React from 'react';
import { FiSave, FiLoader } from 'react-icons/fi';
import './SaveButton.css';

export interface SaveButtonProps {
  onSave: () => void;
  isSaving: boolean;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  onSave,
  isSaving
}) => {
  return (
    <button
      className="save-button"
      onClick={onSave}
      disabled={isSaving}
      aria-label="Save portfolio"
    >
      <div className="save-button__icon">
        {isSaving ? <FiLoader className="save-button__spinner" /> : <FiSave size={16} />}
      </div>
      <span className="save-button__text">
        {isSaving ? 'Saving...' : 'Save'}
      </span>
    </button>
  );
};

export default SaveButton;
