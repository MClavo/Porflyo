import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthUser } from '../../auth/hooks/useAuthUser';
import { usePatchPortfolio } from '../hooks/usePortfolios';
import { useCreatePortfolio } from '../hooks/usePortfolios';
import { getPortfolio } from '../api/portfolios.api';
import { useDebouncedSlugAvailability } from '../hooks/usePublicPortfolio';
import { useListSavedSections } from '../hooks/useSavedSections';
import { toSlug } from '../../../lib/slug/toSlug';
import { TemplateSelector } from '../components/TemplateSelector';
import { DEFAULT_TEMPLATE } from '../templates';
import type { PortfolioPatchDto, PortfolioSection, PortfolioCreateDto } from '../../../types/dto';
import type { TemplateId } from '../templates';

/**
 * Portfolio editor page with modern two-panel layout
 */
export function PortfolioEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  // Treat both routes '/portfolios/new' and '/portfolios/:id/edit' where id === 'new' as new portfolio
  const isNewPortfolio = id === 'new' || location.pathname.endsWith('/new');
  
  // Only fetch portfolio if we have a real ID (not "new")
  const portfolioQuery = useQuery({
    queryKey: ['portfolios', 'detail', id],
    queryFn: () => getPortfolio(id!),
    enabled: !isNewPortfolio && !!id,
  });
  
  const { data: portfolio, isLoading, error } = portfolioQuery;
  const patchMutation = usePatchPortfolio();
  const createMutation = useCreatePortfolio();
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

  const getSlugStatus = () => {
    if (!slug) return null;
    if (isCheckingSlug) return 'Checking...';
    if (slug === portfolio?.reservedSlug) return 'Current slug';
    if (isSlugAvailable === true) return '✓ Available';
    if (isSlugAvailable === false) return '✗ Taken';
    return null;
  };

  const handleSave = async () => {
    // Create new portfolio flow
    if (isNewPortfolio) {
        const createBody: PortfolioCreateDto = {
          title: title,
          description: '',
          template,
          sections,
        };

      try {
        const created = await createMutation.mutateAsync(createBody);
        // After creation, navigate to the editor for the new portfolio
        if (created && created.id) {
          navigate(`/portfolios/${created.id}/edit`);
        } else {
          // Fallback: go back to list
          navigate('/portfolios');
        }
      } catch (error) {
        console.error('Failed to create portfolio:', error);
      }

      return;
    }

    // Update existing portfolio flow
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
            onClick={() => navigate('/portfolios')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Portfolios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-editor">
      <div className="portfolio-editor-content">
        <div className="portfolio-editor-grid">
          {/* Left Sidebar */}
          <div className="portfolio-sidebar">
            {/* Template & Settings Card */}
            <div className="template-settings-card">
              <h2 className="card-title">Settings</h2>
              
              {/* Template Selector */}
              <TemplateSelector 
                selectedTemplate={template}
                onTemplateChange={setTemplate}
                className="mb-6"
              />

              {/* Title Input */}
              <div className="form-group">
                <label className="form-label">
                  Title <span className="text-gray-500">(max 50 characters)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  maxLength={50}
                  className="form-input"
                  placeholder="Portfolio Title"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {title.length}/50 characters
                </div>
              </div>

              {/* Slug Input */}
              <div className="form-group">
                <label className="form-label">URL Slug</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    /p/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="flex-1 form-input rounded-l-none"
                    placeholder="portfolio-slug"
                  />
                </div>
                {getSlugStatus() && (
                  <div className="text-xs mt-1 text-gray-600">
                    {getSlugStatus()}
                  </div>
                )}
              </div>

              {/* Published Toggle */}
              <div className="form-group">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    disabled={!canPublish}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <span className="form-label mb-0">Published</span>
                </label>
                {!canPublish && (
                  <div className="text-xs text-gray-500 mt-1">
                    Set a valid slug to enable publishing
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={createMutation.isPending || patchMutation.isPending}
                className="btn w-full"
              >
                {createMutation.isPending || patchMutation.isPending ? 'Saving...' : 'Save Portfolio'}
              </button>
            </div>

            {/* Saved Sections Card */}
            <div className="saved-sections-card">
              <h2 className="card-title">Saved Sections</h2>
              
              {savedSections && savedSections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No saved sections yet</p>
                  <p className="text-xs mt-1">Create reusable sections for your portfolios</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedSections?.map((savedSection) => (
                    <div key={savedSection.id} className="p-3 border border-gray-200 rounded-md hover:border-gray-300 transition-colors cursor-pointer"
                         onClick={() => setSections(prev => [...prev, savedSection.section])}>
                      <div className="font-medium text-sm">{savedSection.name}</div>
                      <div className="text-xs text-gray-500">{String(savedSection.section.type || 'unknown')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Portfolio Preview */}
          <div className="portfolio-main">
            <div className="portfolio-preview">
              {/* Portfolio User Header */}
              <PortfolioUserHeader title={title} />

              {/* Sections Container */}
              <div className="sections-container">
                <h2 className="card-title">Portfolio Sections</h2>
                
                {/* About Section (Fixed) */}
                <div className="section-placeholder">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">About Section</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Fixed</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    This section is always first and cannot be moved or deleted.
                  </p>
                </div>

                {/* Other Sections */}
                {sections.map((section, index) => (
                  <div key={index} className="section-placeholder">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Section {index + 1}</h3>
                      <button
                        onClick={() => setSections(prev => prev.filter((_, i) => i !== index))}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Type: {String(section.type || 'unknown')} | Content: {String(section.content || '').substring(0, 50)}...
                    </p>
                  </div>
                ))}

                {/* Add Section Button */}
                <button 
                  onClick={() => {
                    const newSection: PortfolioSection = { type: 'custom', content: 'New section' };
                    setSections(prev => [...prev, newSection]);
                  }}
                  className="add-section-btn"
                >
                  + Add Section
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Portfolio User Header Component
interface PortfolioUserHeaderProps {
  title: string;
}

function PortfolioUserHeader({ title }: PortfolioUserHeaderProps) {
  const { user } = useAuthUser();
  
  if (!user) return null;

  return (
    <div className="portfolio-user-header">
      <div className="portfolio-user-info">
        <img 
          src={user.profileImage ?? undefined} 
          alt="Avatar" 
          className="portfolio-avatar"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          <p className="text-blue-100">{user.email}</p>
          {title && <p className="text-blue-200 mt-2 text-lg">{title}</p>}
        </div>
      </div>
      
      {/* Social Links */}
      {user.socials && Object.keys(user.socials).length > 0 && (
        <div className="portfolio-meta">
          <div className="flex flex-wrap gap-3">
            {Object.entries(user.socials).map(([platform, url]) => (
              <a 
                key={platform} 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-100 hover:text-white text-sm underline"
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
