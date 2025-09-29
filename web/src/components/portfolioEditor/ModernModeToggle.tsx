/**
 * ModernModeToggle - Spectacular toggle button for edit/view mode
 */

import React from 'react';
import { FiEdit3, FiEye } from 'react-icons/fi';
import './ModernModeToggle.css';

export interface ModernModeToggleProps {
  mode: 'edit' | 'view';
  onToggle: () => void;
  isSidebarOpen: boolean;
}

export const ModernModeToggle: React.FC<ModernModeToggleProps> = ({
  mode,
  onToggle,
  isSidebarOpen
}) => {
  // Auto-close sidebar when switching to view mode
  React.useEffect(() => {
    if (mode === 'view' && isSidebarOpen) {
      // Small delay to allow mode change to settle
      setTimeout(() => {
        // This would need to be handled by parent component
        // For now, we'll just rely on the parent to handle this
      }, 100);
    }
  }, [mode, isSidebarOpen]);

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