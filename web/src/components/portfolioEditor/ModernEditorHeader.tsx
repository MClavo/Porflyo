/**
 * ModernEditorHeader - Modern header component for portfolio editor
 */

import React from 'react';
import { type TemplateKey } from '../../templates/Template.types';
import { ModernModeToggle } from './ModernModeToggle';
import { ModernTemplateSelector } from './ModernTemplateSelector';
import { UrlSection } from './UrlSection';
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
  lastVerifiedSlug?: string;
  
  // Publication
  isPublished?: boolean;
  setIsPublished?: (published: boolean) => void;
  onPublish?: () => void;
  isPublishing?: boolean;
  hasChanges?: boolean;
  
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
  lastVerifiedSlug,
  isPublished,
  setIsPublished,
  onPublish,
  isPublishing,
  hasChanges,
  isEditMode
}) => {
  const headerRef = React.useRef<HTMLElement>(null);

  // Update CSS custom property for header height dynamically
  React.useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--editor-header-height', `${height}px`);
      }
    };

    // Initial update
    updateHeaderHeight();

    // Update on resize
    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <header ref={headerRef} className="editor-header">
      <div className="editor-header__container">
        {/* Left Group: Title + Template + Mode + Save */}
        <div className="editor-header__left">
          <div className="editor-header__title-area">
            <input
              type="text"
              value={portfolioTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              className="editor-header__title-input"
              placeholder="Portfolio Title"
            />
          </div>
          
          <ModernTemplateSelector
            selectedTemplate={selectedTemplate}
            onSelect={onTemplateSelect}
          />
          
          <ModernModeToggle mode={mode} onToggle={onModeToggle} />
          
          <ModernSaveButton
            onSave={onSave}
            isSaving={isSaving}
          />
        </div>

        {/* Right Group: URL + Public + Publish */}
        {isEditMode && (
          <div className="editor-header__right">
            <UrlSection
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
            
            {onPublish && (
              <ModernPublishButton
                onPublish={onPublish}
                isPublishing={isPublishing || false}
                isPublished={isPublished || false}
                isSlugAvailable={isSlugAvailable || false}
                isSaving={isSaving}
                hasChanges={hasChanges || false}
                currentSlug={slug || ''}
                lastVerifiedSlug={lastVerifiedSlug || ''}
              />
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default ModernEditorHeader;