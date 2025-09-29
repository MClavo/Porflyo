/**
 * ModernEditorSidebar - Flex-based sidebar for portfolio editor
 */

import React from 'react';
import './ModernEditorSidebar.css';

export interface ModernEditorSidebarProps {
  isOpen: boolean;
  children: React.ReactNode;
}

export const ModernEditorSidebar: React.FC<ModernEditorSidebarProps> = ({
  isOpen,
  children
}) => {
  return (
    <>
      {/* Mobile overlay - only show on mobile when open */}
      <div 
        className={`modern-editor-sidebar__overlay ${isOpen ? 'modern-editor-sidebar__overlay--visible' : ''}`}
      />
      
      {/* Sidebar */}
      <aside className={`modern-editor-sidebar ${isOpen ? 'modern-editor-sidebar--expanded' : 'modern-editor-sidebar--collapsed'}`}>
        <div className="modern-editor-sidebar__header">
          <h3 className="modern-editor-sidebar__title">Saved</h3>
        </div>
        
        <div className="modern-editor-sidebar__divider"></div>
        
        <div className="modern-editor-sidebar__content">
          {children}
        </div>
      </aside>
    </>
  );
};

export default ModernEditorSidebar;