import { useCallback, useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
/* import { useAuthUser } from '../../auth/hooks/useAuthUser'; */
import { useCreatePortfolio, useGetPortfolio, usePatchPortfolio } from '../features/portfolios/hooks/usePortfolios';
import { useDebouncedSlugAvailability } from '../features/portfolios/hooks/usePublicPortfolio';
import { toSlug } from '../lib/slug/toSlug';
//import { TemplateSelector } from '../componentsOld/TemplateSelector';
import type { TemplateId } from '../features/portfolios/templates';
import { DEFAULT_TEMPLATE } from '../features/portfolios/templates';
import { listTemplates, getTemplate } from '../templates/registry';
import type { TemplateDefinition } from '../templates/types';
import type { PortfolioCreateDto, PortfolioPatchDto } from '../types/dto';
import type { PortfolioSection } from '../types/sectionDto';
import type { PortfolioSection as BackendPortfolioSection } from '../types/dto';
import type { PortfolioItem } from '../types/itemDto';
// import PortfolioEditor from '../components/PortfolioEditor';
import { PortfolioEditor } from '../components/portfolio/dnd/PortfolioEditor';

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

  // Reference to get current data from the portfolio editor
  const getCurrentDataRef = useRef<(() => { sections: PortfolioSection[], items: Record<string, string[]>, itemsData: Record<string, PortfolioItem> }) | null>(null);

  // Callback to receive the getCurrentData function from PortfolioEditor
  const handleGetCurrentData = useCallback((getCurrentData: () => { sections: PortfolioSection[], items: Record<string, string[]>, itemsData: Record<string, PortfolioItem> }) => {
    getCurrentDataRef.current = getCurrentData;
  }, []);

  // Draft state: zoned representation
  //const [draft, setDraft] = useState<PortfolioDraft | null>(null);

  // MVP Zones for the template (temporary implementation)
  /* const getMvpTemplateZones = useCallback(() => {
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
  }, [getMvpTemplateZones]); */

  // Transform backend data to editor format, using template as base
  const transformBackendToEditor = useCallback((backendPortfolio: typeof portfolio, templateId: TemplateId) => {
    if (!backendPortfolio?.sections) return { sections: [], items: {}, itemsData: {} };

    // Get the template to use as base structure
    const template = getTemplate(templateId);
    const tpl = template ? template : getTemplate('dark');
    
    // Start with template sections as base (includes saved-items if not present)
    const templateSections = tpl.sections.some((s: { id: string }) => s.id === 'saved-items')
      ? tpl.sections
      : ([
          ...tpl.sections,
          ({
            id: 'saved-items',
            type: 'savedItems' as const,
            title: 'Saved',
            columns: 1,
            rows: 10,
            allowedItemTypes: ['text', 'doubleText', 'character'] as import('../types/itemDto').ItemType[],
            items: [],
          } as PortfolioSection),
        ] as PortfolioSection[]);

    // Create a map of backend data by section ID
    const backendDataMap = new Map();
    backendPortfolio.sections.forEach((backendSection) => {
      const sectionId = String(backendSection.sectionType);
      backendDataMap.set(sectionId, backendSection);
    });

    const editorSections: PortfolioSection[] = [];
    const editorItems: Record<string, string[]> = {};
    const editorItemsData: Record<string, PortfolioItem> = {};

    // Process template sections and apply backend data
    templateSections.forEach((templateSection: PortfolioSection) => {
      const backendSection = backendDataMap.get(templateSection.id);
      
      // Create editor section using template as base
      const editorSection: PortfolioSection = {
        ...templateSection, // Keep all template properties (type, allowedItemTypes, columns, rows, etc.)
        title: backendSection?.title ? String(backendSection.title) : templateSection.title,
        items: [] // Will be populated below
      };

      // Process items from backend if they exist
      const itemIds: string[] = [];
      if (backendSection) {
        let sectionItems: unknown[] = [];
        try {
          const content = backendSection.content;
          if (content && typeof content === 'string') {
            sectionItems = JSON.parse(content);
          }
        } catch (error) {
          console.error(`Failed to parse section content for section ${templateSection.id}:`, error);
          sectionItems = [];
        }

        // Generate IDs for items and create editor items data
        if (Array.isArray(sectionItems)) {
          sectionItems.forEach((item, itemIndex) => {
            // Use simpler, more predictable IDs for DnD compatibility
            const itemId = `${templateSection.id}-${itemIndex}`;
            itemIds.push(itemId);

            // Create editor item with generated ID
            const editorItem: PortfolioItem = {
              id: Date.now() + itemIndex, // Unique numeric ID based on timestamp
              sectionType: templateSection.type, // Use template section type
              type: 'text', // Default type, should be inferred from item data
              text: '',
              ...(typeof item === 'object' && item !== null ? item : {})
            } as PortfolioItem;

            editorItemsData[itemId] = editorItem;
          });
        }
      }

      // Update the section with the item IDs
      editorSection.items = itemIds;
      editorSections.push(editorSection);
      editorItems[templateSection.id] = itemIds;
    });

    return { sections: editorSections, items: editorItems, itemsData: editorItemsData };
  }, []);

  // Initialize editor state for loading data from backend
  const [initialEditorData, setInitialEditorData] = useState<{
    sections: PortfolioSection[];
    items: Record<string, string[]>;
    itemsData: Record<string, PortfolioItem>;
  } | null>(null);

  // Initialize editor data when portfolio loads
  useEffect(() => {
    if (!isNewPortfolio && portfolio) {
      const tplId = (portfolio.template as TemplateId) || DEFAULT_TEMPLATE;
      setTemplate(tplId);
      setTitle(portfolio.title || '');
      setSlug(portfolio.reservedSlug || '');
      
      const editorData = transformBackendToEditor(portfolio, tplId);
      console.log('PortfolioEditorPage - Setting initial editor data for existing portfolio:', editorData);
      setInitialEditorData(editorData);
    } else if (isNewPortfolio) {
      // For new portfolios, don't set initial data so the template sections are used
      console.log('PortfolioEditorPage - New portfolio, using template sections');
      setInitialEditorData(null);
    }
  }, [portfolio, isNewPortfolio, transformBackendToEditor]);

  //const saved = useMemo(() => savedSections, [savedSections]);

  // slug availability (debounced)
  const slugQuery = useDebouncedSlugAvailability(slug);
  const isCheckingSlug = slugQuery.isLoading;
  const isSlugAvailable = slugQuery.data;

  const createMutation = useCreatePortfolio();
  const patchMutation = usePatchPortfolio();

  // Handle section title updates
  const handleSectionUpdate = useCallback(async (updatedSections: PortfolioSection[]) => {
    if (!id || isNewPortfolio) return;
    
    try {
      // Convert to DTO format - the backend expects a flexible structure
      const sectionsForApi = updatedSections.map(section => ({
        sectionType: section.type,
        title: section.title,
        content: '',  // placeholder
        media: []     // placeholder
      }));
      
      const patch: PortfolioPatchDto = { 
        sections: sectionsForApi as import('../types/dto').PortfolioSection[]
      };
      await patchMutation.mutateAsync({ id, patch });
    } catch (err) {
      console.error('Failed to update section:', err);
    }
  }, [id, isNewPortfolio, patchMutation]);

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

  // Transform editor data to backend format
  const transformSectionsForBackend = useCallback((): BackendPortfolioSection[] => {
    // Get current data from the portfolio editor
    if (!getCurrentDataRef.current) {
      return [];
    }

    const { sections, items, itemsData } = getCurrentDataRef.current();
    
    return sections
      .filter(section => section.type !== 'savedItems') // Exclude saved items section
      .map(section => {
        const sectionItems = items[section.id] || [];
        const sectionItemsData = sectionItems.map(itemId => itemsData[itemId]).filter(Boolean);
        
        // Extract all image URLs from items
        const mediaUrls: string[] = [];
        
        // Clean items data - remove IDs and other editor-specific properties
        const cleanedItemsData = sectionItemsData.map(item => {
          // Remove the ID property and other editor-specific fields
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, sectionType, ...cleanItem } = item;
          
          // Extract image URLs for media array
          if (item.type === 'textPhoto' && item.imageUrl) {
            mediaUrls.push(item.imageUrl);
          }
          
          return cleanItem;
        });

        // Convert cleaned items to JSON content
        const content = JSON.stringify(cleanedItemsData);

        const backendSection = {
          sectionType: section.id,
          title: section.title,
          content,
          media: mediaUrls
        };
        
        return backendSection;
      });
  }, []);

  const handleSave = async () => {
    const backendSections = transformSectionsForBackend();

    if (isNewPortfolio) {
      const createBody: PortfolioCreateDto = { 
        title: title || '', 
        description: '', 
        template, 
        sections: backendSections
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
    const patch: PortfolioPatchDto = { 
      title: title || undefined, 
      template, 
      sections: backendSections
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
                

          {/* Show loading while initial data is being prepared */}
          {!isNewPortfolio && !initialEditorData ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-lg text-gray-600">Loading portfolio data...</div>
            </div>
          ) : (
            <PortfolioEditor 
              templateId={template} 
              portfolioId={id} 
              onSectionUpdate={handleSectionUpdate}
              onGetCurrentData={handleGetCurrentData}
              initialSections={initialEditorData?.sections}
              initialItems={initialEditorData?.items}
              initialItemsData={initialEditorData?.itemsData}
            />
          )}
          {/* PORTFOLIO EDITOR */}
          {/* <main className="portfolio-main"> */}
            {/* <div className="portfolio-preview">
                  

            </div> */}
          {/* </main> */}
        </div>
  );
}


