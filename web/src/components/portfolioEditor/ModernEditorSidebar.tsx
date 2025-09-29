/**
 * ModernEditorSidebar - Collapsible sidebar for portfolio editor
 */

import React from 'react';
import { FiX } from 'react-icons/fi';
import './ModernEditorSidebar.css';
import './SavedCards.css';

export interface ModernEditorSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const ModernEditorSidebar: React.FC<ModernEditorSidebarProps> = ({
  isOpen,
  onToggle,
  children
}) => {
  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={`modern-editor-sidebar__overlay ${isOpen ? 'modern-editor-sidebar__overlay--visible' : ''}`}
        onClick={onToggle}
      />
      
      {/* Sidebar */}
      <aside className={`modern-editor-sidebar ${isOpen ? 'modern-editor-sidebar--expanded' : 'modern-editor-sidebar--collapsed'}`}>
        <div className="modern-editor-sidebar__header">
          <h3 className="modern-editor-sidebar__title">Saved Cards</h3>
          <button
            className="modern-editor-sidebar__close"
            onClick={onToggle}
            aria-label="Close sidebar"
          >
            <FiX size={20} />
          </button>
        </div>
        
        <div className="modern-editor-sidebar__content">
          <div className="modern-editor-sidebar__area">
            {children}
          </div>
        </div>
      </aside>
    </>
  );
};

export default ModernEditorSidebar;