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
import { SECTION_LIMITS, SECTION_DISPLAY_NAMES, type SectionKind, type PortfolioSectionData } from '../types/sectionsOLD';
import { SectionCard } from './SectionCard';
import { SectionEditor } from './SectionEditor';
import { PortfolioSaveAction } from './PortfolioSaveAction';
import { SavedSectionsPanel } from './SavedSectionsPanel';
import { SlugField } from './SlugField';
import { PublishedToggle } from './PublishedToggle';
import { StickyHeader } from './StickyHeader';
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
  const [lastSavedAt, setLastSavedAt] = useState<Date | undefined>();

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
      setLastSavedAt(new Date());
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
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gray-50">
        <StickyHeader 
          onSave={() => {
            // Trigger form submission through the save pipeline
            const formData = methods.getValues();
            onSubmit?.(formData);
          }}
          isSaving={isLoading || false}
          lastSavedAt={lastSavedAt}
          canSave={isSlugValidAndAvailable || !published}
        />
        
        <div className="pt-16"> {/* Account for sticky header height */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="portfolio-editor">
              {/* Portfolio Meta Fields */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Settings</h2>
                
                <div className="space-y-6">
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

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">
                    Sections ({sections.length}/{SECTION_LIMITS.MAX_SECTIONS})
                  </h2>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {sections.length < SECTION_LIMITS.MAX_SECTIONS && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowAddSectionMenu(!showAddSectionMenu)}
                          className="btn btn-primary w-full sm:w-auto"
                        >
                          Add Section
                        </button>
                        
                        {showAddSectionMenu && (
                          <div className="absolute top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                            <div className="py-1">
                              {availableSectionTypes.map((sectionType) => (
                                <button
                                  key={sectionType}
                                  type="button"
                                  onClick={() => addSection(sectionType)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {SECTION_DISPLAY_NAMES[sectionType]}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => setShowSavedSections(!showSavedSections)}
                      className="btn btn-outline w-full sm:w-auto"
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
                    <div className="space-y-4">
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

              {/* Save Actions - Mobile friendly */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
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
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => methods.reset()}
                        className="btn btn-outline order-2 sm:order-1"
                        disabled={isLoading || isSaving}
                      >
                        Reset
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => save()}
                        disabled={isSaving || isLoading || (published && !isSlugValidAndAvailable)}
                        className="btn btn-primary flex-1 order-1 sm:order-2"
                      >
                        {isSaving ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>{progress?.stage === 'images' ? 'Uploading Images...' : 'Saving...'}</span>
                          </div>
                        ) : (
                          published ? 'Save & Publish' : 'Save Draft'
                        )}
                      </button>
                    </div>
                  )}
                </PortfolioSaveAction>

                {published && !isSlugValidAndAvailable && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-sm text-amber-800">
                      Please enter a valid and available slug to publish
                    </p>
                  </div>
                )}

                {/* Save Result Display */}
                {saveResult && (
                  <div className="mt-4">
                    {saveResult.success ? (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <h4 className="text-sm font-medium text-green-800">✅ Portfolio saved successfully!</h4>
                        {saveResult.warnings.length > 0 && (
                          <ul className="mt-2 text-sm text-green-700">
                            {saveResult.warnings.map((warning, index) => (
                              <li key={index}>• {warning}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <h4 className="text-sm font-medium text-red-800">❌ Save failed</h4>
                        <ul className="mt-2 text-sm text-red-700">
                          {saveResult.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Global Form Errors */}
              {errors.sections && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="font-medium text-red-800">Portfolio Validation Errors:</p>
                  <ul className="mt-2 text-sm text-red-700">
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
          </div>
        </div>

        {/* Saved Sections Panel - Mobile responsive */}
        {showSavedSections && (
          <div className="fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-auto">
            <div className="absolute inset-0 bg-black bg-opacity-50 lg:hidden" onClick={() => setShowSavedSections(false)}></div>
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg lg:relative lg:w-auto lg:shadow-none">
              <SavedSectionsPanel
                onInsertSection={handleInsertSection}
                onSaveSection={handleSaveSection}
                className="h-full overflow-y-auto"
              />
            </div>
          </div>
        )}
      </div>
    </FormProvider>
  );
}
