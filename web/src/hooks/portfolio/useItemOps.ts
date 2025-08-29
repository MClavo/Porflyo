import { useCallback } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { PortfolioItem } from '../../types/itemDto';
import type { EditorPortfolioItems} from '../../components/portfolio/dnd/EditorTypes';


import type { ItemsRef } from './types';
import { getMaxItems, type PortfolioSection } from '../../types/sectionDto';

export function useFindZone(items: EditorPortfolioItems) {
  return useCallback(
    (id: UniqueIdentifier) => {
      console.log('useFindZone - searching for:', id, 'in items:', Object.keys(items));
      const result = id in items ? (id as string) : Object.keys(items).find((k) => items[k].includes(id));
      console.log('useFindZone - result:', result);
      return result;
    },
    [items],
  );
}

export function useItemOps(
  sectionsConfig: PortfolioSection[],
  itemsRef: ItemsRef,
) {
  const { setItems, itemsData, setItemsData } = itemsRef;

  const addItemToSection = useCallback(
    (sectionId: string, itemType?: PortfolioItem['type']) => {
      const sectionConfig = sectionsConfig.find((s) => s.id === sectionId);
      if (!sectionConfig) return;

      setItems((prev) => {
        const sectionItems = prev[sectionId] || [];
        if (sectionItems.length >= getMaxItems(sectionConfig)) return prev;

        const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}` as UniqueIdentifier;
        const now = Date.now();

        let defaultItem: PortfolioItem;
        switch (itemType ?? sectionConfig.allowedItemTypes[0]) {
          case 'character':
            defaultItem = { id: now, type: 'character', sectionType: sectionConfig.type, character: '' };
            break;
          case 'doubleText':
            defaultItem = { id: now, type: 'doubleText', sectionType: sectionConfig.type, text1: '', text2: '' };
            break;
          case 'textPhoto':
            defaultItem = { id: now, type: 'textPhoto', sectionType: sectionConfig.type, text1: '', text2: '', imageUrl: '' };
            break;
          default:
            defaultItem = { id: now, type: 'text', sectionType: sectionConfig.type, text: '' };
        }

        setItemsData((data) => ({ ...data, [newId]: defaultItem }));
        return { ...prev, [sectionId]: [...sectionItems, newId] };
      });
    },
    [sectionsConfig, setItems, setItemsData],
  );

  const removeItem = useCallback(
    async (id: UniqueIdentifier, askConfirm?: (data: { id: UniqueIdentifier; item: PortfolioItem }) => void) => {
      const itemToRemove = itemsData[id] as PortfolioItem | undefined;
      if (itemToRemove?.type === 'savedItem') {
        askConfirm?.({ id, item: itemToRemove });
        return;
      }

      setItems((prev) =>
        Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: prev[key].filter((x) => x !== id) }), {} as EditorPortfolioItems),
      );
      setItemsData((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    },
    [itemsData, setItems, setItemsData],
  );

  const handleItemUpdate = useCallback(
    (id: UniqueIdentifier, updated: PortfolioItem) => {
      setItemsData((prev) => {
        const existing = prev[id] as PortfolioItem | undefined;
        const merged: PortfolioItem = {
          ...(existing ?? {}),
          ...updated,
          sectionType: updated.sectionType ?? existing?.sectionType ?? updated.sectionType,
        } as PortfolioItem;
        return { ...prev, [id]: merged };
      });
    },
    [setItemsData],
  );

  return { addItemToSection, removeItem, handleItemUpdate };
}
