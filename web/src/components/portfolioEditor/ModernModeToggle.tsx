/**
 * ModernModeToggle - Spectacular toggle button for edit/view mode
 */

import React from 'react';
import { FiEdit3, FiEye } from 'react-icons/fi';
import './ModernModeToggle.css';

export interface ModernModeToggleProps {
  mode: 'edit' | 'view';
  onToggle: () => void;
}

export const ModernModeToggle: React.FC<ModernModeToggleProps> = ({
  mode,
  onToggle
}) => {
  return (
    <div className="modern-mode-toggle">
      <div className="modern-mode-toggle__container">
        <div 
          className={`modern-mode-toggle__slider ${mode === 'view' ? 'modern-mode-toggle__slider--view' : ''}`}
        />
        
        <button
          className={`modern-mode-toggle__option ${mode === 'edit' ? 'modern-mode-toggle__option--active' : ''}`}
          onClick={() => mode !== 'edit' && onToggle()}
          disabled={mode === 'edit'}
          aria-label="Switch to edit mode"
        >
          <FiEdit3 size={16} />
          <span>Edit</span>
        </button>
        
        <button
          className={`modern-mode-toggle__option ${mode === 'view' ? 'modern-mode-toggle__option--active' : ''}`}
          onClick={() => mode !== 'view' && onToggle()}
          disabled={mode === 'view'}
          aria-label="Switch to view mode"
        >
          <FiEye size={16} />
          <span>View</span>
        </button>
      </div>
    </div>
  );
};

export default ModernModeToggle;