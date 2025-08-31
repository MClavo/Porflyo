import { useCallback, useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { calculateMD5, requestPresignedPost, uploadToS3 } from '../services/mediaService';
import { useAuthUser } from '../features/auth/hooks/useAuthUser';
import { useCreatePortfolio, useGetPortfolio, usePatchPortfolio, usePublishPortfolio, portfolioKeys } from '../api';
import { useDebouncedSlugAvailability } from '../hooks/usePublicPortfolio';
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
import type { PortfolioUserInfo } from '../types/userDto';
import { injectUserInfoIntoPortfolio, extractUserInfoFromPortfolio, extractUserInfoFromBackendPortfolio } from '../utils/userProfileUtils';
// import PortfolioEditor from '../components/PortfolioEditor';
import { PortfolioEditor } from '../components/portfolio/dnd/PortfolioEditor';
import { Notification } from '../components/Notification';

export default function PortfolioEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // Check if we're on the "new" route by looking at the current path
  const isNewPortfolio = location.pathname.endsWith('/new');

  const { data: portfolio, isLoading, error } = useGetPortfolio(isNewPortfolio ? '' : id || '');
  
  // Get authenticated user information
  const { user: authUser } = useAuthUser();
  
  //const savedSectionsQuery = useListSavedSections();
  //const savedSections = useMemo(() => savedSectionsQuery.data || [], [savedSectionsQuery.data]);

  const [template, setTemplate] = useState<TemplateId>(DEFAULT_TEMPLATE);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSettingsCollapsed, setIsSettingsCollapsed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // User info state for templates
  const [userInfo, setUserInfo] = useState<PortfolioUserInfo>({});

  // Publication state
  const [isPublished, setIsPublished] = useState(false);
  const [normalizedSlugForPublish, setNormalizedSlugForPublish] = useState('');

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  // Helper functions for notifications
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({
      message,
      type,
      isVisible: true
    });
  }, []);

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  // Reference to get current data from the portfolio editor
  const getCurrentDataRef = useRef<(() => { sections: PortfolioSection[], items: Record<string, string[]>, itemsData: Record<string, PortfolioItem> }) | null>(null);

  // Callback to receive the getCurrentData function from PortfolioEditor
  const handleGetCurrentData = useCallback((getCurrentData: () => { sections: PortfolioSection[], items: Record<string, string[]>, itemsData: Record<string, PortfolioItem> }) => {
    getCurrentDataRef.current = () => {
      const baseData = getCurrentData();
      
      // Inject current user info into the portfolio data before returning
      if (userInfo && (userInfo.userProfile || userInfo.portfolioDescription)) {
        const injectedData = injectUserInfoIntoPortfolio(
          baseData.sections,
          baseData.items,
          baseData.itemsData,
          userInfo
        );
        return injectedData;
      }
      
      return baseData;
    };
  }, [userInfo]);

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

  // Helper function to extract user info from transformed editor data
  const extractUserInfoFromEditorData = useCallback((editorData: { sections: PortfolioSection[], items: Record<string, string[]>, itemsData: Record<string, PortfolioItem> }) => {
    const extractedUserInfo = extractUserInfoFromPortfolio(editorData.sections, editorData.items, editorData.itemsData);
    if (extractedUserInfo) {
      setUserInfo(extractedUserInfo);
    }
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
      setIsPublished(portfolio.isPublished || false);
      setNormalizedSlugForPublish(portfolio.reservedSlug || '');
      
      const editorData = transformBackendToEditor(portfolio, tplId);
      setInitialEditorData(editorData);
      
      // Extract user info from the loaded portfolio data
      extractUserInfoFromEditorData(editorData);
    } else if (isNewPortfolio) {
      // For new portfolios, don't set initial data so the template sections are used
      setInitialEditorData(null);
    }
  }, [portfolio, isNewPortfolio, transformBackendToEditor, extractUserInfoFromEditorData]);

  // Initialize user info from authenticated user and portfolio description
  useEffect(() => {
    if (authUser) {
      // Start with base user info from auth
      let portfolioUserInfo: PortfolioUserInfo = {
        userProfile: {
          id: authUser.email, // Use email as id for now
          name: authUser.name,
          email: authUser.email,
          profileImageUrl: authUser.profileImage || authUser.providerAvatarUrl || undefined,
          description: authUser.description,
          // Preserve all socials from authUser (do not filter keys) so custom keys are kept
          socialLinks: authUser.socials ? { ...authUser.socials } : undefined,
        },
        portfolioDescription: portfolio?.description || authUser.description || '',
      };

      // If we have an existing portfolio, try to extract user info from it first
      if (portfolio?.sections) {
        const extractedUserInfo = extractUserInfoFromBackendPortfolio(portfolio.sections);
        if (extractedUserInfo) {
          // Merge extracted info with auth user info (extracted takes precedence)
          portfolioUserInfo = {
            userProfile: {
              ...portfolioUserInfo.userProfile,
              ...extractedUserInfo.userProfile,
            },
            portfolioDescription: extractedUserInfo.portfolioDescription || portfolioUserInfo.portfolioDescription,
          };
        }
      }

      setUserInfo(portfolioUserInfo);
    }
  }, [authUser, portfolio?.description, portfolio?.sections]);

  // Handle user info updates (especially portfolio description)
  const handleUserInfoUpdate = useCallback((updatedUserInfo: PortfolioUserInfo) => {
    setUserInfo(updatedUserInfo);
  }, []);

  //const saved = useMemo(() => savedSections, [savedSections]);

  // slug availability (debounced with 2 second delay)
  const slugQuery = useDebouncedSlugAvailability(slug, true, 2000);
  const isCheckingSlug = slugQuery.isLoading;
  const availabilityData = slugQuery.data;

  // Apply backend-normalized slug when it differs from user input
  useEffect(() => {
    const backendSlug = availabilityData?.slug;
    if (!backendSlug || isCheckingSlug) return;

    // Only update the slug field once when we receive a response from backend
    // This prevents infinite loops and allows user to continue editing
    setSlug(backendSlug);
    setNormalizedSlugForPublish(backendSlug);
  }, [availabilityData?.slug, isCheckingSlug]);

  const createMutation = useCreatePortfolio();
  const patchMutation = usePatchPortfolio();
  const publishMutation = usePublishPortfolio();

  // Handle section title updates (only for local state, no auto-save)
  const handleSectionUpdate = useCallback(() => {
    // Only update local state, don't auto-save to backend
  }, []);

  // Handle template change and update sections
  const handleTemplateChange = useCallback((newTemplate: TemplateId) => {
    setTemplate(newTemplate);
    
    // Get the new template definition
    const newTemplateDefinition = getTemplate(newTemplate);
    if (!newTemplateDefinition) return;
    
    // Get current data from the portfolio editor
    if (!getCurrentDataRef.current) return;
    
    const { sections: currentSections, items: currentItems, itemsData: currentItemsData } = getCurrentDataRef.current();
    
    // Create updated sections based on new template
    const updatedSections: PortfolioSection[] = [];
    const updatedItems: Record<string, string[]> = {};
    const updatedItemsData: Record<string, PortfolioItem> = { ...currentItemsData };
    
    // Add saved-items section if not present in new template
    const templateSections = newTemplateDefinition.sections.some((s: { id: string }) => s.id === 'saved-items')
      ? newTemplateDefinition.sections
      : ([
          ...newTemplateDefinition.sections,
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
    
    // Process each section from the new template
    templateSections.forEach((templateSection: PortfolioSection) => {
      // Find the corresponding section in current sections
      const currentSection = currentSections.find(section => section.id === templateSection.id);
      
      // Create updated section with template properties but preserve current data
      const updatedSection: PortfolioSection = {
        ...templateSection, // Use template properties (type, allowedItemTypes, columns, rows, etc.)
        title: currentSection?.title || templateSection.title, // Preserve custom title if exists
        items: currentSection?.items || [] // Preserve current items
      };
      
      updatedSections.push(updatedSection);
      
      // Preserve current items for this section
      if (currentSection && currentItems[currentSection.id]) {
        updatedItems[templateSection.id] = currentItems[currentSection.id];
      } else {
        updatedItems[templateSection.id] = [];
      }
    });
    
    // Update the initial editor data to trigger re-render
    setInitialEditorData({
      sections: updatedSections,
      items: updatedItems,
      itemsData: updatedItemsData
    });
  }, []);

  const handleTitleChange = (newTitle: string) => { 
    setTitle(newTitle); 
    // Only auto-generate slug if it's completely empty (new portfolio)
    if (!slug) {
      setSlug(toSlug(newTitle)); 
    }
  };
  const handleSlugChange = (newSlug: string) => {
    // Limit to 50 characters and convert spaces to hyphens for better UX
    const limitedSlug = newSlug.slice(0, 50);
    // Convert spaces to hyphens in real-time for better user experience
    const slugWithHyphens = limitedSlug.replace(/\s+/g, '-');
    setSlug(slugWithHyphens);
  };

  const handleTogglePublished = () => {
    setIsPublished(!isPublished);
  };

  const handlePublish = async () => {
    if (!id || !portfolio) return;
    
    // Use the normalized slug from backend for publication
    const publishDto = {
      url: normalizedSlugForPublish || slug,
      published: isPublished
    };
    
    try {
      const updatedPortfolio = await publishMutation.mutateAsync({ id, body: publishDto });
      
      // Update the portfolio in React Query cache to trigger re-render
      queryClient.setQueryData(portfolioKeys.detail(id), updatedPortfolio);
      
      // Update local states from response
      setIsPublished(updatedPortfolio.isPublished || false);
      setNormalizedSlugForPublish(updatedPortfolio.reservedSlug || '');
      setTitle(updatedPortfolio.title || '');
      setSlug(updatedPortfolio.reservedSlug || '');
      
      // Re-transform the updated portfolio data for editor
      const tplId = (updatedPortfolio.template as TemplateId) || DEFAULT_TEMPLATE;
      const editorData = transformBackendToEditor(updatedPortfolio, tplId);
      setInitialEditorData(editorData);
      
      showNotification('Publication settings updated successfully!', 'success');
      
    } catch (err) {
      console.error('Failed to update publication settings:', err);
      showNotification('Failed to update publication settings. Please try again.', 'error');
    }
  };

  const getSlugStatus = () => {
    if (!slug) return null;
    if (isCheckingSlug) return 'Checking...';
    if (slug === portfolio?.reservedSlug) return 'Current slug';
    
    // Only show availability status if we have data for the current slug
    if (availabilityData && availabilityData.slug === slug) {
      if (availabilityData.available === true) return '✓ Available';
      if (availabilityData.available === false) return '✗ Taken';
    }
    
    return null;
  };

  const isSlugAvailable = () => {
    // If it's the current slug, it's always "available" for this portfolio
    if (slug === portfolio?.reservedSlug) return true;
    
    // If we have availability data for the current slug, use that
    if (availabilityData && availabilityData.slug === slug) {
      return availabilityData.available === true;
    }
    
    // If we're checking or don't have data, consider it not available to be safe
    return false;
  };

  // Helper function to detect if an image URL is a blob URL (not yet saved)
  const isBlobUrl = (url: string): boolean => {
    return url.startsWith('blob:');
  };

  // Helper function to generate a unique key for image uploads
  const generateImageKey = (prefix: string = 'portfolio'): string => {
    const uuid = crypto.randomUUID();
    const timestamp = Date.now();
    return `${prefix}/${timestamp}-${uuid}.webp`;
  };

  // Helper function to convert blob URL to blob object
  const blobUrlToBlob = async (blobUrl: string): Promise<Blob> => {
    const response = await fetch(blobUrl);
    return response.blob();
  };

  // Transform editor data to backend format with image upload handling
  const transformSectionsForBackend = useCallback(async (): Promise<BackendPortfolioSection[]> => {
    // Get current data from the portfolio editor
    if (!getCurrentDataRef.current) {
      return [];
    }

    const { sections, items, itemsData } = getCurrentDataRef.current();
    
    // First pass: collect all blob URLs that need to be uploaded
    const blobUrls: string[] = [];
    const blobToKeyMap = new Map<string, string>();
    
    sections
      .filter(section => section.type !== 'savedItems')
      .forEach(section => {
        const sectionItems = items[section.id] || [];
        const sectionItemsData = sectionItems.map(itemId => itemsData[itemId]).filter(Boolean);
        
        sectionItemsData.forEach(item => {
          if (item.type === 'textPhoto' && item.imageUrl && isBlobUrl(item.imageUrl)) {
            if (!blobUrls.includes(item.imageUrl)) {
              blobUrls.push(item.imageUrl);
              blobToKeyMap.set(item.imageUrl, generateImageKey());
            }
          }
        });
      });

    // If there are blob URLs, upload them first
    const urlReplacementMap = new Map<string, string>();
    
    if (blobUrls.length > 0) {
      try {
        showNotification('Uploading images...', 'info');
        
        // Convert blob URLs to blobs and prepare upload requests (use mediaService helpers)
        const uploadRequests = await Promise.all(
          blobUrls.map(async (blobUrl) => {
            const blob = await blobUrlToBlob(blobUrl);
            const key = blobToKeyMap.get(blobUrl)!;

            // Calculate MD5 using mediaService helper which returns base64
            const md5Base64 = await calculateMD5(blob);

            return {
              key,
              contentType: blob.type || 'image/webp',
              size: blob.size,
              md5: md5Base64,
              blob
            };
          })
        );

        // Request all presigned URLs at once via mediaService
        const presignRequests = uploadRequests.map(req => ({
          key: req.key,
          contentType: req.contentType,
          size: req.size,
          md5: req.md5
        }));

        const presignedResponses = await requestPresignedPost(presignRequests);

        // Upload all images in parallel using mediaService.uploadToS3
        await Promise.all(
          uploadRequests.map(async (uploadReq, index) => {
            const presignedPut = presignedResponses[index];

            // Upload using helper which applies required headers
            await uploadToS3(presignedPut, uploadReq.blob);

            // Store the mapping from blob URL to the final public URL
            const blobUrl = blobUrls.find(url => blobToKeyMap.get(url) === uploadReq.key)!;
            const publicUrl = presignedPut.url.split('?')[0]; // Remove query parameters for public URL
            urlReplacementMap.set(blobUrl, publicUrl);
          })
        );

        showNotification('Images uploaded successfully!', 'success');
      } catch (error) {
        console.error('Failed to upload images:', error);
        showNotification('Failed to upload some images. Saving portfolio anyway...', 'error');
      }
    }

    // Second pass: transform sections with updated image URLs
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
          
            // Replace blob URLs with uploaded URLs and extract for media array
            if (item.type === 'textPhoto' && item.imageUrl) {
              let finalImageUrl = item.imageUrl;
              
              // Replace blob URL with uploaded URL if available
              if (urlReplacementMap.has(item.imageUrl)) {
                finalImageUrl = urlReplacementMap.get(item.imageUrl)!;
                (cleanItem as { imageUrl: string }).imageUrl = finalImageUrl;
              }
              
              mediaUrls.push(finalImageUrl);
            }          return cleanItem;
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
  }, [showNotification]);

  const handleSave = async () => {
    const backendSections = await transformSectionsForBackend();

    if (isNewPortfolio) {
      const createBody: PortfolioCreateDto = { 
        title: title || '', 
        description: userInfo?.portfolioDescription || '', 
        template, 
        sections: backendSections
      };
      try {
        const created = await createMutation.mutateAsync(createBody);
        showNotification('Portfolio created successfully!', 'success');
        if (created && created.id) navigate(`/portfolios/${created.id}/edit`);
        else navigate('/portfolios');
      } catch (err) { 
        console.error('Failed to create portfolio:', err);
        showNotification('Failed to create portfolio. Please try again.', 'error');
      }
      return;
    }

    if (!id || !portfolio) return;
    const patch: PortfolioPatchDto = { 
      title: title || undefined, 
      description: userInfo?.portfolioDescription || undefined,
      template, 
      sections: backendSections
    };
    try { 
      await patchMutation.mutateAsync({ id, patch });
      showNotification('Portfolio saved successfully!', 'success');
    } catch (err) { 
      console.error('Failed to save portfolio:', err);
      showNotification('Failed to save portfolio. Please try again.', 'error');
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
                {/* Portfolio Configuration Section */}
                <div className="settings-section">
                  <h3 className="section-subtitle">Portfolio Configuration</h3>
                  
                  {/* Template selector */}
                  <div className="form-group">
                    <label className="form-label">Template</label>
                    <select value={template} onChange={(e) => handleTemplateChange(e.target.value as TemplateId)} className="form-input">
                      {listTemplates().map((t: TemplateDefinition) => (
                        <option key={t.id} value={t.id}>{t.title || t.id}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)} className="form-input" />
                  </div>

                  <div className="form-group mt-4">
                    <button onClick={handleSave} className="btn w-full">Save Portfolio</button>
                  </div>
                </div>

                {/* Publication Settings Section - Only show for existing portfolios */}
                {!isNewPortfolio && (
                  <div className="settings-section">
                    <h3 className="section-subtitle">Publication Settings</h3>
                    
                    <div className="form-group">
                      <label className="form-label">Public URL</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">porflyo.com/p/</span>
                        <input 
                          type="text" 
                          value={slug} 
                          onChange={(e) => handleSlugChange(e.target.value)} 
                          className="flex-1 form-input rounded-l-none" 
                          maxLength={50}
                          placeholder="my-portfolio"
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-xs text-gray-600">
                          {getSlugStatus()}
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label flex items-center justify-between">
                        <span>Make portfolio visible to public</span>
                        <button
                          type="button"
                          onClick={handleTogglePublished}
                          className="ml-2 focus:outline-none"
                        >
                          {isPublished ? (
                            <span className="text-green-600 text-lg font-bold">✓</span>
                          ) : (
                            <span className="text-red-600 text-lg font-bold">✗</span>
                          )}
                        </button>
                      </label>
                      <div className="text-xs text-gray-500 mt-1">When enabled, your portfolio will be accessible via the public URL</div>
                    </div>

                    <div className="form-group mt-4">
                      <button 
                        onClick={handlePublish} 
                        className="btn w-full" 
                        disabled={publishMutation.isPending || !isSlugAvailable()}
                      >
                        {publishMutation.isPending ? 'Updating...' : 'Update Publication Settings'}
                      </button>
                    </div>
                  </div>
                )}
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
              key={`${template}-${initialEditorData ? 'loaded' : 'new'}`}
              templateId={template} 
              portfolioId={id} 
              onSectionUpdate={handleSectionUpdate}
              onGetCurrentData={handleGetCurrentData}
              initialSections={initialEditorData?.sections}
              initialItems={initialEditorData?.items}
              initialItemsData={initialEditorData?.itemsData}
              userInfo={userInfo}
              onUserInfoUpdate={handleUserInfoUpdate}
            />
          )}
          {/* PORTFOLIO EDITOR */}

          {/* Notification */}
          <Notification
            message={notification.message}
            type={notification.type}
            isVisible={notification.isVisible}
            onClose={hideNotification}
          />
        </div>
  );
}


