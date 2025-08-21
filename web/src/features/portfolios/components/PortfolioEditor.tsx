import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

import { portfolioFormSchema, type PortfolioFormData } from '../schemas/sections.schema';
import { SECTION_LIMITS, SECTION_DISPLAY_NAMES, type SectionKind, type PortfolioSectionData } from '../types/sections';
import { SectionCard } from './SectionCard';
import { SectionEditor } from './SectionEditor';
import { PortfolioSaveAction } from './PortfolioSaveAction';
import { SavedSectionsPanel } from './SavedSectionsPanel';
import { SlugField } from './SlugField';
import { PublishedToggle } from './PublishedToggle';
import type { SavePipelineResult } from '../services/savePipeline';

interface PortfolioEditorProps {
  portfolioId: string;
  initialData?: Partial<PortfolioFormData>;
  onSubmit?: (data: PortfolioFormData) => void;
  isLoading?: boolean;
}

export function PortfolioEditor({ portfolioId, initialData, onSubmit, isLoading }: PortfolioEditorProps) {
  const [showAddSectionMenu, setShowAddSectionMenu] = useState(false);
  const [showSavedSections, setShowSavedSections] = useState(false);
  const [saveResult, setSaveResult] = useState<SavePipelineResult | null>(null);
  const [isSlugValidAndAvailable, setIsSlugValidAndAvailable] = useState(true);

  const methods = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: {
      title: '',
      template: 'default',
      slug: '',
      published: false,
      sections: [
        {
          id: 'about-section',
          kind: 'ABOUT',
          position: 0,
          name: '',
          email: '',
          socials: {},
          showUserDescription: true,
        },
      ],
      ...initialData,
    },
  });

  const { watch, setValue, formState: { errors } } = methods;
  const sections = watch('sections') || [];
  const title = watch('title');
  const template = watch('template');
  const slug = watch('slug');
  const published = watch('published');

  // Save pipeline handlers
  const handleSaveComplete = (result: SavePipelineResult) => {
    setSaveResult(result);
    if (result.success) {
      console.log('Portfolio saved successfully:', result);
      // Optionally call the original onSubmit if provided
      if (onSubmit) {
        const formData = methods.getValues();
        onSubmit(formData);
      }
    }
  };

  const handleSaveError = (errors: string[]) => {
    console.error('Save failed:', errors);
    setSaveResult({
      success: false,
      errors,
      warnings: []
    });
  };

  const handleInsertSection = (sectionData: PortfolioSectionData) => {
    // Convert PortfolioSectionData to form section format and add at the end
    const newSection = {
      ...sectionData,
      position: sections.length
    };
    const newSections = [...sections, newSection];
    setValue('sections', newSections);
    setShowSavedSections(false); // Close panel after inserting
  };

  const handleSaveSection = (section: PortfolioSectionData, name?: string) => {
    // This would be called when user wants to save a section
    console.log('Saving section:', section, 'with name:', name);
  };

  // Handle slug validity changes
  const handleSlugValidityChange = (isValid: boolean, isAvailable: boolean) => {
    setIsSlugValidAndAvailable(isValid && isAvailable);
    
    // Force published=false if slug is empty
    const slugValue = watch('slug');
    const isEmpty = !slugValue || slugValue.trim() === '';
    if (isEmpty && published) {
      setValue('published', false);
    }
  };

  // Determine if published can be enabled
  const canPublish = () => {
    const isEmpty = !slug || slug.trim() === '';
    if (isEmpty) return false; // Can't publish without a slug
    return isSlugValidAndAvailable;
  };

  const getPublishedDisabledReason = () => {
    const isEmpty = !slug || slug.trim() === '';
    if (isEmpty) return 'Enter a valid slug to publish';
    if (!isSlugValidAndAvailable) return 'Slug must be valid and available to publish';
    return undefined;
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Section management functions
  const addSection = (kind: SectionKind) => {
    if (sections.length >= SECTION_LIMITS.MAX_SECTIONS) {
      return;
    }

    const newSection = createNewSection(kind, sections.length);
    const newSections = [...sections, newSection];
    setValue('sections', newSections);
    setShowAddSectionMenu(false);
  };

  const moveSection = (fromIndex: number, toIndex: number) => {
    if (fromIndex === 0 || toIndex === 0) return; // ABOUT cannot be moved
    
    const newSections = [...sections];
    const [movedSection] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, movedSection);
    
    // Update positions
    newSections.forEach((section, index) => {
      section.position = index;
    });
    
    setValue('sections', newSections);
  };

  const moveSectionUp = (index: number) => {
    if (index <= 1) return; // Cannot move ABOUT or first non-ABOUT section up
    moveSection(index, index - 1);
  };

  const moveSectionDown = (index: number) => {
    if (index === 0 || index >= sections.length - 1) return;
    moveSection(index, index + 1);
  };

  const deleteSection = (index: number) => {
    if (index === 0) return; // Cannot delete ABOUT section
    
    const newSections = sections.filter((_, i) => i !== index);
    // Update positions
    newSections.forEach((section, i) => {
      section.position = i;
    });
    setValue('sections', newSections);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((section) => section.id === active.id);
      const newIndex = sections.findIndex((section) => section.id === over.id);
      
      // Prevent moving ABOUT section or moving items to position 0
      if (oldIndex === 0 || newIndex === 0) return;
      
      const newSections = arrayMove(sections, oldIndex, newIndex);
      // Update positions
      newSections.forEach((section, index) => {
        section.position = index;
      });
      setValue('sections', newSections);
    }
  };

  const createNewSection = (kind: SectionKind, position: number) => {
    const baseSection = {
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position,
    };

    switch (kind) {
      case 'TEXT':
        return {
          ...baseSection,
          kind: 'TEXT' as const,
          title: '',
          content: '',
          links: [],
        };
      case 'TEXT_WITH_IMAGE_LEFT':
        return {
          ...baseSection,
          kind: 'TEXT_WITH_IMAGE_LEFT' as const,
          title: '',
          content: '',
          image: '',
          links: [],
        };
      case 'TEXT_WITH_IMAGE_RIGHT':
        return {
          ...baseSection,
          kind: 'TEXT_WITH_IMAGE_RIGHT' as const,
          title: '',
          content: '',
          image: '',
          links: [],
        };
      case 'REPO':
        return {
          ...baseSection,
          kind: 'REPO' as const,
          repoId: '',
        };
      case 'REPO_LIST':
        return {
          ...baseSection,
          kind: 'REPO_LIST' as const,
          repoIds: [],
        };
      case 'GALLERY_LARGE':
        return {
          ...baseSection,
          kind: 'GALLERY_LARGE' as const,
          images: [],
        };
      case 'GALLERY_SMALL':
        return {
          ...baseSection,
          kind: 'GALLERY_SMALL' as const,
          images: [],
        };
      case 'GALLERY_GRID':
        return {
          ...baseSection,
          kind: 'GALLERY_GRID' as const,
          images: [],
        };
      default:
        throw new Error(`Unknown section kind: ${kind}`);
    }
  };

  const availableSectionTypes: SectionKind[] = [
    'TEXT',
    'TEXT_WITH_IMAGE_LEFT',
    'TEXT_WITH_IMAGE_RIGHT',
    'REPO',
    'REPO_LIST',
    'GALLERY_LARGE',
    'GALLERY_SMALL',
    'GALLERY_GRID',
  ];

  return (
    <div className="app-container">
      <div className="portfolio-editor-layout">
        <div className="main-content">
          <FormProvider {...methods}>
            <div className="portfolio-editor">
              {/* Portfolio Header */}
              <div className="portfolio-header">
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                  Portfolio Editor
                </h1>
                
                {/* Portfolio Meta Fields */}
              <div className="portfolio-meta">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="portfolio-title" className="form-label">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="portfolio-title"
                      {...methods.register('title')}
                      className={`form-input ${errors.title ? 'error' : ''}`}
                      placeholder="Portfolio title"
                      maxLength={SECTION_LIMITS.MAX_TITLE_LENGTH}
                    />
                    {errors.title && (
                      <p className="error-message">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="portfolio-template" className="form-label">
                      Template *
                    </label>
                    <select
                      id="portfolio-template"
                      {...methods.register('template')}
                      className={`form-input ${errors.template ? 'error' : ''}`}
                    >
                      <option value="default">Default</option>
                      <option value="minimal">Minimal</option>
                      <option value="modern">Modern</option>
                    </select>
                    {errors.template && (
                      <p className="error-message">{errors.template.message}</p>
                    )}
                  </div>
                </div>

                <div className="form-grid">
                  <SlugField
                    control={methods.control}
                    isEdit={portfolioId !== 'new'}
                    currentSlug={initialData?.slug}
                    onValidityChange={handleSlugValidityChange}
                  />

                  <PublishedToggle
                    control={methods.control}
                    disabled={!canPublish()}
                    disabledReason={getPublishedDisabledReason()}
                  />
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="sections-container">
              <div className="sections-header">
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                  Sections ({sections.length}/{SECTION_LIMITS.MAX_SECTIONS})
                </h2>
                
                <div className="section-actions">
                  {sections.length < SECTION_LIMITS.MAX_SECTIONS && (
                    <div className="add-section-container">
                      <button
                        type="button"
                        onClick={() => setShowAddSectionMenu(!showAddSectionMenu)}
                        className="btn"
                      >
                        Add Section
                      </button>
                      
                      {showAddSectionMenu && (
                        <div className="add-section-menu">
                          {availableSectionTypes.map((sectionType) => (
                            <button
                              key={sectionType}
                              type="button"
                              onClick={() => addSection(sectionType)}
                              className="add-section-item"
                            >
                              {SECTION_DISPLAY_NAMES[sectionType]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => setShowSavedSections(!showSavedSections)}
                    className="btn btn-outline btn-sm"
                  >
                    {showSavedSections ? 'Hide' : 'Show'} Saved Sections
                  </button>
                </div>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={sections.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="sections-list">
                    {sections.map((section, index) => (
                      <SectionCard
                        key={section.id}
                        section={section}
                        index={index}
                        onMoveUp={moveSectionUp}
                        onMoveDown={moveSectionDown}
                        onDelete={deleteSection}
                        canMoveUp={index > 1}
                        canMoveDown={index > 0 && index < sections.length - 1}
                      >
                        <SectionEditor section={section} sectionIndex={index} />
                      </SectionCard>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {/* Save Actions */}
            <div className="save-actions">
              <PortfolioSaveAction
                portfolioId={portfolioId}
                sections={sections as PortfolioSectionData[]}
                title={title}
                template={template}
                publishSettings={published ? {
                  shouldPublish: true,
                  slug: slug.trim(),
                  published: true
                } : {
                  shouldPublish: false
                }}
                onSaveComplete={handleSaveComplete}
                onError={handleSaveError}
              >
                {({ save, isSaving, progress }) => (
                  <div className="save-button-group">
                    <button
                      type="button"
                      onClick={() => methods.reset()}
                      className="btn-secondary"
                      disabled={isLoading || isSaving}
                    >
                      Reset
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => save()}
                      disabled={isSaving || isLoading || (published && !isSlugValidAndAvailable)}
                      className="btn btn-primary"
                    >
                      {isSaving ? (
                        <>
                          <div className="btn-spinner"></div>
                          {progress?.stage === 'images' ? 'Uploading Images...' : 'Saving...'}
                        </>
                      ) : (
                        published ? 'Save & Publish' : 'Save Draft'
                      )}
                    </button>
                    
                    {published && !isSlugValidAndAvailable && (
                      <div className="save-warning">
                        Please enter a valid and available slug to publish
                      </div>
                    )}
                  </div>
                )}
              </PortfolioSaveAction>

              {/* Save Result Display */}
              {saveResult && (
                <div className="save-result">
                  {saveResult.success ? (
                    <div className="save-success">
                      <h4>✅ Portfolio saved successfully!</h4>
                      {saveResult.warnings.length > 0 && (
                        <ul className="save-warnings">
                          {saveResult.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <div className="save-error">
                      <h4>❌ Save failed</h4>
                      <ul className="save-errors">
                        {saveResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Global Form Errors */}
            {errors.sections && (
              <div className="error">
                <p className="font-bold">Portfolio Validation Errors:</p>
                <ul>
                  {Array.isArray(errors.sections) && errors.sections.map((sectionError, index) => (
                    sectionError && (
                      <li key={index}>
                        Section {index + 1}: {typeof sectionError === 'object' && 'message' in sectionError ? sectionError.message : 'Invalid section'}
                      </li>
                    )
                  ))}
                  {typeof errors.sections === 'object' && 'message' in errors.sections && (
                    <li>{errors.sections.message}</li>
                  )}
                </ul>
              </div>
            )}
            </div>
          </FormProvider>
        </div>

        {/* Saved Sections Panel */}
        {showSavedSections && (
          <div className="editor-sidebar">
            <SavedSectionsPanel
              onInsertSection={handleInsertSection}
              onSaveSection={handleSaveSection}
              className="saved-sections-sidebar"
            />
          </div>
        )}
      </div>
    </div>
  );
}
