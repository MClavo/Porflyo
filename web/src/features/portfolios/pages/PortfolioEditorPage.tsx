import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usePatchPortfolio } from '../hooks/usePortfolios';
import { getPortfolio } from '../api/portfolios.api';
import { useDebouncedSlugAvailability } from '../hooks/usePublicPortfolio';
import { useListSavedSections } from '../hooks/useSavedSections';
import { toSlug } from '../../../lib/slug/toSlug';
import { TemplateSelector } from '../components/TemplateSelector';
import { DEFAULT_TEMPLATE } from '../templates';
import type { PortfolioPatchDto, PortfolioSection } from '../../../types/dto';
import type { TemplateId } from '../templates';

/**
 * Portfolio editor page with three-panel layout
 */
export function PortfolioEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewPortfolio = id === 'new';
  
  // Only fetch portfolio if we have a real ID (not "new")
  const portfolioQuery = useQuery({
    queryKey: ['portfolios', 'detail', id],
    queryFn: () => getPortfolio(id!),
    enabled: !isNewPortfolio && !!id,
  });
  
  const { data: portfolio, isLoading, error } = portfolioQuery;
  const patchMutation = usePatchPortfolio();
  const { data: savedSections } = useListSavedSections();

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [template, setTemplate] = useState<TemplateId>(DEFAULT_TEMPLATE);
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [isPublished, setIsPublished] = useState(false);

  // Slug availability check
  const { data: isSlugAvailable, isLoading: isCheckingSlug } = useDebouncedSlugAvailability(
    slug,
    slug.length > 0 && slug !== portfolio?.reservedSlug
  );

  // Initialize form when portfolio loads
  useEffect(() => {
    if (portfolio) {
      setTitle(portfolio.title || '');
      setSlug(portfolio.reservedSlug || '');
      setTemplate((portfolio.template as TemplateId) || DEFAULT_TEMPLATE);
      setSections(portfolio.sections || []);
      setIsPublished(portfolio.isPublished || false);
    }
  }, [portfolio]);

  // Auto-generate slug from title
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!slug || slug === toSlug(title)) {
      setSlug(toSlug(newTitle));
    }
  };

  const handleSlugChange = (newSlug: string) => {
    setSlug(toSlug(newSlug));
  };

  const handleSave = async () => {
    if (!id || !portfolio) return;

    const patch: PortfolioPatchDto = {
      title: title || undefined,
      template: template,
      sections,
    };

    try {
      await patchMutation.mutateAsync({ id, patch });
      // TODO: Show success message
    } catch (error) {
      // TODO: Show error message
      console.error('Failed to save portfolio:', error);
    }
  };

  const canPublish = Boolean(slug && slug.length > 0 && (isSlugAvailable || slug === portfolio?.reservedSlug));

  if (!isNewPortfolio && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading portfolio...</div>
      </div>
    );
  }

  if (!isNewPortfolio && (error || !portfolio)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio Not Found</h2>
          <button
            onClick={() => navigate('/app/portfolios')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Portfolios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/app/portfolios')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Portfolio
              </h1>
            </div>
            <button
              onClick={handleSave}
              disabled={patchMutation.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {patchMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Three-panel layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Left Panel - Settings */}
          <div className="col-span-3">
            <LeftPanel
              title={title}
              onTitleChange={handleTitleChange}
              slug={slug}
              onSlugChange={handleSlugChange}
              template={template}
              onTemplateChange={setTemplate}
              isPublished={isPublished}
              onPublishedChange={setIsPublished}
              canPublish={canPublish}
              isCheckingSlug={isCheckingSlug}
              isSlugAvailable={isSlugAvailable}
              currentSlug={portfolio?.reservedSlug}
            />
          </div>

          {/* Center Panel - Sections Editor */}
          <div className="col-span-6">
            <CenterPanel
              sections={sections}
              onSectionsChange={setSections}
            />
          </div>

          {/* Right Panel - Saved Sections */}
          <div className="col-span-3">
            <RightPanel
              savedSections={savedSections || []}
              onInsertSection={(section) => {
                setSections(prev => [...prev, section]);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Left Panel Component
interface LeftPanelProps {
  title: string;
  onTitleChange: (title: string) => void;
  slug: string;
  onSlugChange: (slug: string) => void;
  template: TemplateId;
  onTemplateChange: (template: TemplateId) => void;
  isPublished: boolean;
  onPublishedChange: (published: boolean) => void;
  canPublish: boolean;
  isCheckingSlug: boolean;
  isSlugAvailable?: boolean;
  currentSlug?: string;
}

function LeftPanel({
  title,
  onTitleChange,
  slug,
  onSlugChange,
  template,
  onTemplateChange,
  isPublished,
  onPublishedChange,
  canPublish,
  isCheckingSlug,
  isSlugAvailable,
  currentSlug,
}: LeftPanelProps) {
  const getSlugStatus = () => {
    if (!slug) return null;
    if (isCheckingSlug) return 'Checking...';
    if (slug === currentSlug) return 'Current slug';
    if (isSlugAvailable === true) return '✓ Available';
    if (isSlugAvailable === false) return '✗ Taken';
    return null;
  };

  const slugStatus = getSlugStatus();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Settings</h2>
      
      {/* Template Selector */}
      <TemplateSelector 
        selectedTemplate={template}
        onTemplateChange={onTemplateChange}
        className="mb-6"
      />

      {/* Title Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title <span className="text-gray-500">(max 50 characters)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={50}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Portfolio Title"
        />
        <div className="text-xs text-gray-500 mt-1">
          {title.length}/50 characters
        </div>
      </div>

      {/* Slug Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL Slug
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            /p/
          </span>
          <input
            type="text"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            className="flex-1 border border-gray-300 rounded-r-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="portfolio-slug"
          />
        </div>
        {slugStatus && (
          <div className={`text-xs mt-1 ${
            isCheckingSlug ? 'text-gray-500' :
            isSlugAvailable === true || slug === currentSlug ? 'text-green-600' :
            'text-red-600'
          }`}>
            {slugStatus}
          </div>
        )}
      </div>

      {/* Published Toggle */}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => onPublishedChange(e.target.checked)}
            disabled={!canPublish}
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
          />
          <span className="text-sm font-medium text-gray-700">
            Published
          </span>
        </label>
        {!canPublish && (
          <div className="text-xs text-gray-500 mt-1">
            Requires a valid and available slug
          </div>
        )}
      </div>
    </div>
  );
}

// Center Panel Component
interface CenterPanelProps {
  sections: PortfolioSection[];
  onSectionsChange: (sections: PortfolioSection[]) => void;
}

function CenterPanel({ sections, onSectionsChange }: CenterPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Sections</h2>
      
      {/* About Section (Fixed) */}
      <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">About</span>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
            Fixed
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          This section is always first and cannot be moved or deleted.
        </p>
      </div>

      {/* Other Sections */}
      <div className="space-y-3">
        {sections.map((section, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-md hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">
                Section {index + 1}
              </span>
              <div className="flex gap-2">
                <button className="text-gray-400 hover:text-gray-600">
                  ⋮⋮
                </button>
                <button 
                  onClick={() => {
                    const newSections = sections.filter((_, i) => i !== index);
                    onSectionsChange(newSections);
                  }}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {JSON.stringify(section, null, 2).substring(0, 100)}...
            </div>
          </div>
        ))}
      </div>

      {/* Add Section Button */}
      <button 
        onClick={() => {
          const newSection: PortfolioSection = { type: 'custom', content: 'New section' };
          onSectionsChange([...sections, newSection]);
        }}
        className="w-full mt-4 border-2 border-dashed border-gray-300 rounded-md py-4 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
      >
        + Add Section
      </button>
    </div>
  );
}

// Right Panel Component
interface RightPanelProps {
  savedSections: Array<{ id: string; name: string; section: PortfolioSection }>;
  onInsertSection: (section: PortfolioSection) => void;
}

function RightPanel({ savedSections, onInsertSection }: RightPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Saved Sections</h2>
      
      {savedSections.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No saved sections yet</p>
          <p className="text-xs mt-1">Create reusable sections for your portfolios</p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedSections.map((savedSection) => (
            <div key={savedSection.id} className="p-3 border border-gray-200 rounded-md hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 text-sm">
                  {savedSection.name}
                </span>
                <button className="text-red-400 hover:text-red-600 text-xs">
                  ✕
                </button>
              </div>
              <button
                onClick={() => onInsertSection(savedSection.section)}
                className="w-full text-left text-xs text-blue-600 hover:text-blue-800"
              >
                + Insert
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
