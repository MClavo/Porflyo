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
    <div className="mode-toggle">
      <button 
        className="mode-toggle__container"
        onClick={onToggle}
        aria-label={`Switch to ${mode === 'edit' ? 'view' : 'edit'} mode`}
      >
        <div 
          className={`mode-toggle__slider ${mode === 'view' ? 'mode-toggle__slider--view' : ''}`}
        />
        
        <div className={`mode-toggle__option ${mode === 'edit' ? 'mode-toggle__option--active' : ''}`}>
          <FiEdit3 size={16} />
          <span>Edit</span>
        </div>
        
        <div className={`mode-toggle__option ${mode === 'view' ? 'mode-toggle__option--active' : ''}`}>
          <FiEye size={16} />
          <span>View</span>
        </div>
      </button>
    </div>
  );
};

export default ModernModeToggle;