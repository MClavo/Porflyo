import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
/* import { useAuthUser } from '../../auth/hooks/useAuthUser'; */
import { useCreatePortfolio, useGetPortfolio, usePatchPortfolio } from '../features/portfolios/hooks/usePortfolios';
import { useDebouncedSlugAvailability } from '../features/portfolios/hooks/usePublicPortfolio';
import { useListSavedSections } from '../features/portfolios/hooks/useSavedSections';
import { toSlug } from '../lib/slug/toSlug';
//import { TemplateSelector } from '../componentsOld/TemplateSelector';
import type { TemplateId } from '../features/portfolios/templates';
import { DEFAULT_TEMPLATE } from '../features/portfolios/templates';
import { listTemplates } from '../templates/registry';
import type { TemplateDefinition } from '../templates/types';
import type { PortfolioCreateDto, PortfolioPatchDto, PortfolioSection } from '../types/dto';
// import PortfolioEditor from '../components/PortfolioEditor';
import { PortfolioEditor } from '../components/portfolio/dnd/PortfolioEditor';

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
  //const savedSectionsQuery = useListSavedSections();
  //const savedSections = useMemo(() => savedSectionsQuery.data || [], [savedSectionsQuery.data]);

  const [template, setTemplate] = useState<TemplateId>(DEFAULT_TEMPLATE);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSettingsCollapsed, setIsSettingsCollapsed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Draft state: zoned representation
  //const [draft, setDraft] = useState<PortfolioDraft | null>(null);

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
      //const mockTpl = getMockTemplate(tplId);
      //setDraft(normalizeSectionsToZones(portfolio.sections || [], mockTpl));
    }
    if (isNewPortfolio) {
      //const mockTpl = getMockTemplate(DEFAULT_TEMPLATE);
      //setDraft(normalizeSectionsToZones([], mockTpl));
    }
  }, [portfolio, isNewPortfolio, getMockTemplate]);

  //const saved = useMemo(() => savedSections, [savedSections]);

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
      //const sectionsToSave: PortfolioSection[] = draft ? serializeSectionsForSave(draft) : [];
      const createBody: PortfolioCreateDto = { 
        title, 
        description: '', 
        template, 
        sections: []
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
    //const sectionsToSave: PortfolioSection[] = draft ? serializeSectionsForSave(draft) : [];
    const patch: PortfolioPatchDto = { 
      title: title || undefined, 
      template, 
      sections: [] 
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
                {/* Template selector */}
                <div className="form-group">
                  <label className="form-label">Template</label>
                  <select value={template} onChange={(e) => setTemplate(e.target.value as TemplateId)} className="form-input">
                    {listTemplates().map((t: TemplateDefinition) => (
                      <option key={t.id} value={t.id}>{t.title || t.id}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)} className="form-input" />
                </div>

                <div className="form-group">
                  <label className="form-label">URL Slug</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">porflyo.com/p/</span>
                    <input type="text" value={slug} onChange={(e) => handleSlugChange(e.target.value)} className="flex-1 form-input rounded-l-none" />
                  </div>
                  {getSlugStatus() && <div className="text-xs mt-1 text-gray-600">{getSlugStatus()}</div>}
                </div>

                <div className="form-group mt-4">
                  <button onClick={handleSave} className="btn w-full">Save Portfolio</button>
                </div>
              </div>
            </div>

            <div className="saved-sections-card" id="saved-items">
              <h2 className="card-title">Saved</h2>
            </div>
          </aside>
                

          {/* PORTFOLIO EDITOR */}
          <main className="portfolio-main">
            <div className="portfolio-preview">
              <h1 className="profile-header">Portfolio</h1>
                  {/* <PortfolioEditor /> */}
                  <PortfolioEditor templateId={template} />

            </div>
          </main>
        </div>
  );
}


