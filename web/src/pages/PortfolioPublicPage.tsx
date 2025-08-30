import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { useGetPublicPortfolio } from '../hooks/usePortfolios';
import { getTemplate } from '../templates/registry';
import PortfolioLayout from '../components/portfolio/layout/PortfolioLayout';
import type { PortfolioSection } from '../types/sectionDto';
import type { PortfolioItem } from '../types/itemDto';
import type { PortfolioUserInfo } from '../types/userDto';
import { extractUserInfoFromPortfolio, extractUserInfoFromBackendPortfolio } from '../utils/userProfileUtils';
// Don't import template types from the legacy `features` folder.
// For the public view we only need a string id for the template.
type TemplateId = string;

/**
 * Public portfolio view page - renders portfolios without editing capabilities
 * Uses template layouts directly without DnD or editing features
 */
export function PortfolioPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: portfolio, isLoading, error } = useGetPublicPortfolio(slug || '');

  // State to hold transformed editor data
  const [editorData, setEditorData] = useState<{
    sections: PortfolioSection[];
    items: Record<string, string[]>;
    itemsData: Record<string, PortfolioItem>;
  } | null>(null);

  // State to hold extracted user info
  const [userInfo, setUserInfo] = useState<PortfolioUserInfo | null>(null);

  // Transform backend data to editor format (same logic as PortfolioEditorPage)
  const transformBackendToEditor = useCallback((backendPortfolio: typeof portfolio, templateId: string) => {
    if (!backendPortfolio?.sections) return { sections: [], items: {}, itemsData: {} };

    // Get the template to use as base structure
    const template = getTemplate(templateId);
    const tpl = template ? template : getTemplate('dark');
    
    // Start with template sections as base (exclude saved-items for public view)
    const templateSections = tpl.sections.filter((s: { id: string }) => s.id !== 'saved-items');

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

            // Build editor item with generated ID. If backend item is a string,
            // store it in `text` so TemplateItem (type 'text') can render it.
            // If it's an object, spread its fields (may include `type`, `text`, etc.).
            const baseItem: Partial<PortfolioItem> = {
              id: Date.now() + itemIndex,
              sectionType: templateSection.type,
              type: 'text',
            };

            let editorItem: PortfolioItem;
            if (typeof item === 'string') {
              editorItem = {
                ...(baseItem as PortfolioItem),
                text: item,
              } as PortfolioItem;
            } else if (typeof item === 'object' && item !== null) {
              editorItem = {
                ...(baseItem as PortfolioItem),
                ...(item as Record<string, unknown>),
              } as PortfolioItem;
            } else {
              editorItem = {
                ...(baseItem as PortfolioItem),
                text: '',
              } as PortfolioItem;
            }

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

  // Transform data when portfolio loads
  useEffect(() => {
    if (portfolio) {
      const templateId = (portfolio.template as TemplateId) || 'template-example';
      const transformed = transformBackendToEditor(portfolio, templateId);
      setEditorData(transformed);
      
      // Extract user info directly from backend portfolio data (more reliable)
      const extractedUserInfo = extractUserInfoFromBackendPortfolio(portfolio.sections || []);
      if (extractedUserInfo) {
        setUserInfo(extractedUserInfo);
      } else {
        // Fallback: try extracting from transformed data
        const fallbackUserInfo = extractUserInfoFromPortfolio(
          transformed.sections, 
          transformed.items, 
          transformed.itemsData
        );
        setUserInfo(fallbackUserInfo);
      }
    }
  }, [portfolio, transformBackendToEditor]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading portfolio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Portfolio Not Found</h1>
          <p className="text-gray-600">The portfolio you're looking for doesn't exist or is not published.</p>
        </div>
      </div>
    );
  }

  if (!portfolio || !editorData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Portfolio not found</div>
      </div>
    );
  }

  // Get template
  const templateId = (portfolio.template as string) || 'template-example';
  const template = getTemplate(templateId);
  const tpl = template ? template : getTemplate('dark');

  const { sections, items, itemsData } = editorData;

  return (
    <div className="portfolio-public-view">
      {/* Use the presentational PortfolioLayout (no DnD) and provide the template as siteComponent.
          This reuses the same rendering path as the editor but without edit handlers so items are immutable. */}
      <PortfolioLayout
        sections={sections}
        itemMap={items}
        itemDataMap={itemsData}
        templateId={templateId}
        userInfo={userInfo || undefined}
        siteComponent={tpl ? <tpl.Layout sections={sections} itemMap={{}} itemDataMap={{}} themeClass={tpl.ThemeClass} /> : undefined}
        readOnly={true}
      />
    </div>
  );
}
