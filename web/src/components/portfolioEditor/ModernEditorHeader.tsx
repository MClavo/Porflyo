/**
 * ModernEditorHeader - Modern header component for portfolio editor
 */

import React from 'react';
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
  
  // Publication
  isPublished?: boolean;
  setIsPublished?: (published: boolean) => void;
  onPublish?: () => void;
  isPublishing?: boolean;
  
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
  isEditMode
}) => {
  return (
    <header className="modern-editor-header">
      <div className="modern-editor-header__container">
        {/* Left: Title */}
        <div className="modern-editor-header__left">
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

        {/* Center: Controls */}
        <div className="modern-editor-header__center">
          {/* Mode Toggle */}
          <ModernModeToggle
            mode={mode}
            onToggle={onModeToggle}
          />

          {/* Template Selector - only in edit mode */}
          {mode === 'edit' && (
            <ModernTemplateSelector
              selectedTemplate={selectedTemplate}
              onSelect={onTemplateSelect}
            />
          )}

          {/* URL Section - only in edit mode */}
          {mode === 'edit' && isEditMode && (
            <ModernUrlSection
              slug={slug || ''}
              setSlug={setSlug || (() => {})}
              currentSlug={currentSlug}
              isSlugAvailable={isSlugAvailable}
              isCheckingSlug={isCheckingSlug}
              onSlugAvailabilityChange={onSlugAvailabilityChange}
            />
          )}

          {/* Public Toggle - only in edit mode */}
          {mode === 'edit' && isEditMode && (
            <ModernPublicToggle
              isPublished={isPublished || false}
              setIsPublished={setIsPublished || (() => {})}
            />
          )}
        </div>

        {/* Right: Action Buttons */}
        <div className="modern-editor-header__right">
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