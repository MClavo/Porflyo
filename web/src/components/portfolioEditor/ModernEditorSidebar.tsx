/**
 * ModernEditorSidebar - Flex-based sidebar for portfolio editor
 */

import React from 'react';
import { HiOutlineInboxArrowDown } from 'react-icons/hi2';
import './ModernEditorSidebar.css';

export interface ModernEditorSidebarProps {
  isOpen: boolean;
  children: React.ReactNode;
  mode?: 'view' | 'edit';
}

export const ModernEditorSidebar: React.FC<ModernEditorSidebarProps> = ({
  isOpen,
  children,
  mode = 'view'
}) => {
  return (
    <aside className={`editor-sidebar ${isOpen ? 'editor-sidebar--open' : 'editor-sidebar--closed'}`}>
      <div className="editor-sidebar__header">
        <h3 className="editor-sidebar__title">Saved</h3>
        {mode === 'edit' && (
          <div className="saved-cards-hint">
            <HiOutlineInboxArrowDown />
            Hover for preview • Drag to use
          </div>
        )}
      </div>
      
      <div className="editor-sidebar__divider"></div>
      
      <div className="editor-sidebar__content">
        {children}
      </div>
    </aside>
  );
};

export default ModernEditorSidebar;