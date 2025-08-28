import type { UniqueIdentifier } from '@dnd-kit/core';
import { useMemo, useRef, useState } from 'react';
import type { EditorPortfolioItems, EditorPortfolioItemsData } from '../../components/portfolio/dnd/EditorTypes';
import type { SectionDropStates } from './types';

export function useBaseState(sectionsConfig: { id: string }[]) {
  const [items, setItems] = useState<EditorPortfolioItems>(() =>
    sectionsConfig.reduce((acc, s) => ({ ...acc, [s.id]: [] }), {} as EditorPortfolioItems)
  );

  const [itemsData, setItemsData] = useState<EditorPortfolioItemsData>({});
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

