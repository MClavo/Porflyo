/**
 * ModernEditorHeader - Modern header component for portfolio editor
 */

import React from 'react';
import { type TemplateKey } from '../../templates/Template.types';
import { ModernModeToggle } from './ModernModeToggle';
import { ModernTemplateSelector } from './ModernTemplateSelector';
import { ModernUrlSection } from './ModernUrlSection';
import { ModernPublicToggle } from './ModernPublicToggle';
import { ModernSaveButton } from './ModernSaveButton';
import { ModernPublishButton } from './ModernPublishButton';
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
  selectedTemplate: TemplateKey;
  onTemplateSelect: (template: TemplateKey) => void;
  
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
        {/* Left: Title + quick save */}
        <div className="modern-editor-header__left">
          <div className="modern-editor-header__title-area">
            <input
              type="text"
              value={portfolioTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              className="modern-editor-header__title-input"
              placeholder="Portfolio Title"
            />
          </div>
        </div>

        {/* Center: primary controls (centered) */}
        <div className="modern-editor-header__center">
          <div className="modern-editor-header__primary-controls">
            <ModernTemplateSelector
              selectedTemplate={selectedTemplate}
              onSelect={onTemplateSelect}
            />
            <ModernModeToggle mode={mode} onToggle={onModeToggle} />
          </div>
        </div>

        {/* Right: URL / Public / Action buttons */}
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

          <ModernSaveButton
            onSave={onSave}
            isSaving={isSaving}
          />

          {isEditMode && onPublish && (
            <ModernPublishButton
              onPublish={onPublish}
              isPublishing={isPublishing || false}
              isPublished={isPublished || false}
              isSlugAvailable={isSlugAvailable || false}
              isSaving={isSaving}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default ModernEditorHeader;