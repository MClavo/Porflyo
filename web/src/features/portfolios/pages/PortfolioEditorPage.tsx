import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
/* import { useAuthUser } from '../../auth/hooks/useAuthUser'; */
import { usePatchPortfolio, useCreatePortfolio, useGetPortfolio } from '../hooks/usePortfolios';
import { useDebouncedSlugAvailability } from '../hooks/usePublicPortfolio';
import { useListSavedSections } from '../hooks/useSavedSections';
import { toSlug } from '../../../lib/slug/toSlug';
import { TemplateSelector } from '../componentsOld/TemplateSelector';
import type { TemplateId } from '../templates';
import {  DEFAULT_TEMPLATE } from '../templates';
import type { PortfolioSection, PortfolioCreateDto, PortfolioPatchDto } from '../../../types/dto';
import { normalizeSectionsToZones, serializeSectionsForSave, readMeta } from '../../../components/portfolio/utils';
import type { PortfolioDraft } from '../../../components/portfolio/types';
import PortfolioEditor from '../components/PortfolioEditor';

// Small presentational header used in the editor preview
/* function PortfolioUserHeader({ title }: { title: string }) {
  const { user } = useAuthUser();
  if (!user) return null;

  return (
    <div className="portfolio-user-header">
      <div className="portfolio-user-info">
        <img src={user.profileImage ?? undefined} alt="Avatar" className="portfolio-avatar" />
        <div>
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          <p className="text-blue-100">{user.email}</p>
          {title && <p className="text-blue-200 mt-2 text-lg">{title}</p>}
        </div>
      </div>
      {user.socials && Object.keys(user.socials).length > 0 && (
        <div className="portfolio-meta mt-2">
          <div className="flex flex-wrap gap-3">
            {Object.entries(user.socials).map(([platform, url]) => (
              <a key={platform} href={String(url)} target="_blank" rel="noopener noreferrer" className="text-blue-100 hover:text-white text-sm underline">
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} */

export default function PortfolioEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on the "new" route by looking at the current path
  const isNewPortfolio = location.pathname.endsWith('/new');

  const { data: portfolio, isLoading, error } = useGetPortfolio(isNewPortfolio ? '' : id || '');
  const savedSectionsQuery = useListSavedSections();
  const savedSections = useMemo(() => savedSectionsQuery.data || [], [savedSectionsQuery.data]);

  const [template, setTemplate] = useState<TemplateId>(DEFAULT_TEMPLATE);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSettingsCollapsed, setIsSettingsCollapsed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Draft state: zoned representation
  const [draft, setDraft] = useState<PortfolioDraft | null>(null);

  // MVP Zones for the template (temporary implementation)
  const getMvpTemplateZones = useCallback(() => {
    return [
      { id: 'profile', label: 'Perfil', zoneType: 'about' as const, allowed: ['about' as const], maxItems: 3, variants: [], defaultVariant: '' },
      { id: 'projects', label: 'Proyectos', zoneType: 'cards-grid' as const, allowed: ['project' as const], maxItems: 3, variants: [], defaultVariant: '' },
      { id: 'experience', label: 'Experiencia', zoneType: 'list' as const, allowed: ['skillGroup' as const], maxItems: 3, variants: [], defaultVariant: '' },
    ];
  }, []);

  const getMockTemplate = useCallback((templateId: TemplateId) => {
    return {
      id: templateId,
      version: 1,
      name: templateId,
      zones: getMvpTemplateZones()
    };
  }, [getMvpTemplateZones]);

  // Initialize draft when portfolio loads or when creating a new one
  useEffect(() => {
    if (!isNewPortfolio && portfolio) {
      const tplId = (portfolio.template as TemplateId) || DEFAULT_TEMPLATE;
      setTemplate(tplId);
      setTitle(portfolio.title || '');
      setSlug(portfolio.reservedSlug || '');
      const mockTpl = getMockTemplate(tplId);
      setDraft(normalizeSectionsToZones(portfolio.sections || [], mockTpl));
    }
    if (isNewPortfolio) {
      const mockTpl = getMockTemplate(DEFAULT_TEMPLATE);
      setDraft(normalizeSectionsToZones([], mockTpl));
    }
  }, [portfolio, isNewPortfolio, getMockTemplate]);

  const saved = useMemo(() => savedSections, [savedSections]);

  // slug availability (debounced)
  const slugQuery = useDebouncedSlugAvailability(slug);
  const isCheckingSlug = slugQuery.isLoading;
  const isSlugAvailable = slugQuery.data;

  const createMutation = useCreatePortfolio();
  const patchMutation = usePatchPortfolio();

  const handleTitleChange = (newTitle: string) => { setTitle(newTitle); if (!slug || slug === toSlug(title)) setSlug(toSlug(newTitle)); };
  const handleSlugChange = (newSlug: string) => setSlug(toSlug(newSlug));

  const getSlugStatus = () => {
    if (!slug) return null;
    if (isCheckingSlug) return 'Checking...';
    if (slug === portfolio?.reservedSlug) return 'Current slug';
    if (isSlugAvailable === true) return '✓ Available';
    if (isSlugAvailable === false) return '✗ Taken';
    return null;
  };

  const handleSave = async () => {
    if (isNewPortfolio) {
      const sectionsToSave: PortfolioSection[] = draft ? serializeSectionsForSave(draft) : [];
      const createBody: PortfolioCreateDto = { 
        title, 
        description: '', 
        template, 
        sections: sectionsToSave 
      };
      try {
        const created = await createMutation.mutateAsync(createBody);
        if (created && created.id) navigate(`/portfolios/${created.id}/edit`);
        else navigate('/portfolios');
      } catch (err) { 
        console.error('Failed to create portfolio:', err); 
      }
      return;
    }

    if (!id || !portfolio) return;
    const sectionsToSave: PortfolioSection[] = draft ? serializeSectionsForSave(draft) : [];
    const patch: PortfolioPatchDto = { 
      title: title || undefined, 
      template, 
      sections: sectionsToSave 
    };
    try { 
      await patchMutation.mutateAsync({ id, patch }); 
    } catch (err) { 
      console.error('Failed to save portfolio:', err); 
    }
  };

  if (!isNewPortfolio && isLoading) return (<div className="min-h-screen flex items-center justify-center"><div className="text-lg text-gray-600">Loading portfolio...</div></div>);
  if (!isNewPortfolio && (error || !portfolio)) return (<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio Not Found</h2><button onClick={() => navigate('/portfolios')} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Back to Portfolios</button></div></div>);

  return (
        <div className={`portfolio-editor-grid ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {/* Sidebar Toggle Button */}
          <button 
            className={`sidebar-toggle ${isSidebarCollapsed ? 'collapsed' : ''}`}
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            <span className="toggle-icon">
              {isSidebarCollapsed ? '▶' : '◀'}
            </span>
          </button>

          <aside className={`portfolio-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="template-settings-card">
              <div 
                className="collapsible-header" 
                onClick={() => setIsSettingsCollapsed(!isSettingsCollapsed)}
              >
                <h2 className="card-title">Settings</h2>
                <span className={`collapse-icon ${isSettingsCollapsed ? 'collapsed' : ''}`}>
                  ▼
                </span>
              </div>
              <div className={`collapsible-content ${isSettingsCollapsed ? 'collapsed' : ''}`}>
                <TemplateSelector selectedTemplate={template} onTemplateChange={(t) => setTemplate(t as TemplateId)} className="mb-6" />

                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)} className="form-input" />
                </div>

                <div className="form-group">
                  <label className="form-label">URL Slug</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">/p/</span>
                    <input type="text" value={slug} onChange={(e) => handleSlugChange(e.target.value)} className="flex-1 form-input rounded-l-none" />
                  </div>
                  {getSlugStatus() && <div className="text-xs mt-1 text-gray-600">{getSlugStatus()}</div>}
                </div>

                <div className="form-group mt-4">
                  <button onClick={handleSave} className="btn w-full">Save Portfolio</button>
                </div>
              </div>
            </div>

            <div className="saved-sections-card mt-6">
              <h2 className="card-title">Saved Sections</h2>
              <div className="space-y-3 mt-3">
                {saved?.length ? saved.map(s => (
                  <div key={s.id} className="p-3 border border-gray-200 rounded-md hover:border-gray-300 cursor-pointer" onClick={() => {
                    if (!draft) return; const zoneId = draft.zones['profile'] ? 'profile' : Object.keys(draft.zones)[0]; setDraft(prev => { if (!prev) return prev; const next = { ...prev, zones: { ...prev.zones } } as PortfolioDraft; const zone = next.zones[zoneId] || { variant: '', items: [] }; zone.items = [...(zone.items || []), s.section]; next.zones[zoneId] = zone; return next; });
                  }}>
                    <div className="font-medium text-sm">{s.name}</div>
                    <div className="text-xs text-gray-500">{String(readMeta(s.section)?.sectionType || 'unknown')}</div>
                  </div>
                )) : (<div className="text-center text-gray-500 py-4">No saved sections</div>)}
              </div>
            </div>
          </aside>
                
          <main className="portfolio-main">
            <div className="portfolio-preview">
              <h1 className="profile-header">Portfolio</h1>
                  <PortfolioEditor />

            </div>
          </main>
        </div>
  );
}
