import { useEffect, useState } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { EditorPortfolioItemsData, EditorPortfolioItems } from '../../components/portfolio/dnd/EditorTypes';
import type { ItemsRef } from './types';
import type { PortfolioSection } from '../../types/sectionDto';
import type { SavedItem } from '../../types/itemDto';

export function useSavedItemsSync(
  sectionsConfig: PortfolioSection[],
  savedItems: SavedItem[], // si tienes tipo SavedItemDto cámbialo aquí
  itemsRef: ItemsRef,
) {
  const { setItems, setItemsData } = itemsRef;
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!savedItems.length || loaded) return;

    // Accept common variants for the saved items section id and also match by section type
    let savedItemsSection = sectionsConfig.find((s) =>
      s.id === 'savedItems' || s.id === 'saved-items' || s.type === 'savedItems'
    );

    // As a last resort, try to find a section that accepts savedItem in allowedItemTypes
    if (!savedItemsSection) {
      savedItemsSection = sectionsConfig.find((s) => Array.isArray((s as PortfolioSection).allowedItemTypes) && (s as PortfolioSection).allowedItemTypes.includes('savedItem'));
    }

    // If still not found, fallback to a default id so the UI still shows saved items
    const sectionId = savedItemsSection?.id ?? 'savedItems';
    const ids: UniqueIdentifier[] = [];
    const data: EditorPortfolioItemsData = {};

    savedItems.forEach((s, idx) => {
      const uid = `saved-${s.dbId ?? s.id ?? idx}` as UniqueIdentifier;
      ids.push(uid);
      data[uid] = s;
    });

  // Set itemsData first so components reading itemsData immediately after setItems find the data
  setItemsData((prev) => ({ ...prev, ...data }));
  setItems((prev) => ({ ...prev, [sectionId]: ids } as EditorPortfolioItems));
    setLoaded(true);
  }, [savedItems, sectionsConfig, loaded, setItems, setItemsData]);

  return { savedItemsLoaded: loaded };
}
