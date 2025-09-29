/**
 * ModernEditorHeader - Modern header component for portfolio editor
 */

import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ModernModeToggle } from './ModernModeToggle';
import { ModernTemplateSelector } from './ModernTemplateSelector';
import { ModernUrlSection } from './ModernUrlSection';
import { ModernPublicToggle } from './ModernPublicToggle';
import { ModernActionButtons } from './ModernActionButtons';
import './ModernEditorHeader.css';

export interface ModernEditorHeaderProps {
  // Title and Save
  portfolioTitle: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  isSaving: boolean;
  
  // Mode and Template
  mode: 'edit' | 'view';
  onModeToggle: () => void;
  selectedTemplate: string;
  onTemplateSelect: (template: string) => void;
  
  // URL and Publication (only for edit mode)
  slug?: string;
  setSlug?: (slug: string) => void;
  currentSlug?: string;
  isSlugAvailable?: boolean;
  isCheckingSlug?: boolean;
  onSlugAvailabilityChange?: (available: boolean) => void;
  
  isPublished?: boolean;
  setIsPublished?: (published: boolean) => void;
  onPublish?: () => void;
  isPublishing?: boolean;
  
  // Sidebar control
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  
  // Page context
  isEditMode: boolean; // true if /portfolios/{id}/edit, false if /portfolios/new
}

export const ModernEditorHeader: React.FC<ModernEditorHeaderProps> = ({
  portfolioTitle,
  onTitleChange,
  onSave,
  isSaving,
  mode,
  onModeToggle,
  selectedTemplate,
  onTemplateSelect,
  slug,
  setSlug,
  currentSlug,
  isSlugAvailable,
  isCheckingSlug,
  onSlugAvailabilityChange,
  isPublished,
  setIsPublished,
  onPublish,
  isPublishing,
  isSidebarOpen,
  onToggleSidebar,
  isEditMode
}) => {
  return (
    <header className="modern-editor-header">
      <div className="modern-editor-header__container">
        {/* Left side - Title and Sidebar Toggle */}
        <div className="modern-editor-header__left">
          <button
            className="modern-editor-header__sidebar-toggle"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isSidebarOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
          </button>
          
          <div className="modern-editor-header__title-section">
            <input
              type="text"
              value={portfolioTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              className="modern-editor-header__title-input"
              placeholder="Portfolio Title"
            />
          </div>
        </div>

        {/* Center - Mode Toggle and Template Selector */}
        <div className="modern-editor-header__center">
          <ModernModeToggle
            mode={mode}
            onToggle={onModeToggle}
            isSidebarOpen={isSidebarOpen}
          />
          
          <ModernTemplateSelector
            selectedTemplate={selectedTemplate}
            onSelect={onTemplateSelect}
          />
        </div>

        {/* Right side - URL, Publication, and Actions */}
        <div className="modern-editor-header__right">
          {isEditMode && (
            <>
              <ModernUrlSection
                slug={slug || ''}
                setSlug={setSlug || (() => {})}
                currentSlug={currentSlug}
                isSlugAvailable={isSlugAvailable}
                isCheckingSlug={isCheckingSlug}
                onSlugAvailabilityChange={onSlugAvailabilityChange}
              />
              
              <ModernPublicToggle
                isPublished={isPublished || false}
                setIsPublished={setIsPublished || (() => {})}
              />
            </>
          )}
          
          <ModernActionButtons
            onSave={onSave}
            isSaving={isSaving}
            onPublish={onPublish}
            isPublishing={isPublishing || false}
            isEditMode={isEditMode}
            isPublished={isPublished || false}
            isSlugAvailable={isSlugAvailable || false}
          />
        </div>
      </div>
    </header>
  );
};

export default ModernEditorHeader;