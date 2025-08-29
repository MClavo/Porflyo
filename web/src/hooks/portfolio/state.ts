import type { UniqueIdentifier } from '@dnd-kit/core';
import { useMemo, useRef, useState, useEffect } from 'react';
import type { EditorPortfolioItems, EditorPortfolioItemsData } from '../../components/portfolio/dnd/EditorTypes';
import type { SectionDropStates } from './types';

export function useBaseState(
  sectionsConfig: { id: string }[],
  initialItems?: EditorPortfolioItems,
  initialItemsData?: EditorPortfolioItemsData
) {
  const hasInitializedRef = useRef(false);
  
  const [items, setItems] = useState<EditorPortfolioItems>(() => {
    // Always ensure all sections are present in items object
    const allSectionsItems = sectionsConfig.reduce((acc, s) => ({ ...acc, [s.id]: [] }), {} as EditorPortfolioItems);
    
    // If we have initial items, merge them with the base structure
    if (initialItems) {
      return { ...allSectionsItems, ...initialItems };
    }
    
    return allSectionsItems;
  });

  const [itemsData, setItemsData] = useState<EditorPortfolioItemsData>(() =>
    initialItemsData || {}
  );

  // Initialize once when initial data becomes available
  useEffect(() => {
    if (initialItems && initialItemsData && !hasInitializedRef.current) {
      // Ensure all sections are present in the items object
      const allSectionsItems = sectionsConfig.reduce((acc, s) => ({ ...acc, [s.id]: [] }), {} as EditorPortfolioItems);
      const mergedItems = { ...allSectionsItems, ...initialItems };
      
      setItems(mergedItems);
      setItemsData(initialItemsData);
      hasInitializedRef.current = true;
    }
  }, [initialItems, initialItemsData, sectionsConfig]);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [clonedItems, setClonedItems] = useState<EditorPortfolioItems | null>(null);
  const recentlyMovedToNewZone = useRef(false);

  const [sectionDropStates, setSectionDropStates] = useState<SectionDropStates>(() =>
    sectionsConfig.reduce((acc, s) => ({ ...acc, [s.id]: 'none' as const }), {} as SectionDropStates)
  );

  return useMemo(
    () => ({
      items, setItems,
      itemsData, setItemsData,
      activeId, setActiveId,
      clonedItems, setClonedItems,
      recentlyMovedToNewZone,
      sectionDropStates, setSectionDropStates,
    }),
    [items, itemsData, activeId, clonedItems, sectionDropStates]
  );
}

