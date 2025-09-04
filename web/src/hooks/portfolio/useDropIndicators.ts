import { useCallback } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { getMaxItems } from '../../types/sectionDto';
import type { PortfolioSection } from '../../types/sectionDto';
import type { SectionDropStates } from './types';
import type { EditorPortfolioItemsData } from '../../components/portfolio/dnd/EditorTypes';

export function useDropIndicators(
  sectionsConfig: PortfolioSection[],
  items: Record<string, UniqueIdentifier[]>,
  itemsData: EditorPortfolioItemsData,
  findZone: (id: UniqueIdentifier) => string | undefined,
  setSectionDropStates: React.Dispatch<React.SetStateAction<SectionDropStates>>,
) {
  return useCallback((activeId: UniqueIdentifier) => {
    const dragged = itemsData[activeId];
    const itemForValidation = dragged?.type === 'savedItem' ? dragged.originalItem : dragged;

    setSectionDropStates((prev) => {
      const out = { ...prev };
      for (const section of sectionsConfig) {
        const srcSection = sectionsConfig.find((s) => findZone(activeId) === s.id);
        const destSection = section;
        if (!srcSection || !destSection || !itemForValidation) {
          out[section.id] = 'none';
          continue;
        }
        const can =
          destSection.type === 'savedItems' ||
          srcSection.id === destSection.id ||
          (itemForValidation.sectionType === destSection.type &&
            destSection.allowedItemTypes.includes(itemForValidation.type) &&
            getMaxItems(destSection) > (items[section.id]?.length ?? 0));
        out[section.id] = can ? 'allowed' : 'forbidden';
      }
      return out;
    });
  }, [itemsData, items, sectionsConfig, findZone, setSectionDropStates]);
}
