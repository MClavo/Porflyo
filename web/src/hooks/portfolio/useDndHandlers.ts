import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent, DragOverEvent, DragStartEvent, UniqueIdentifier } from '@dnd-kit/core';
import { useCallback, useEffect } from 'react';
import { getMaxItems } from '../../types/sectionDto';
import type { PortfolioSection } from '../../types/sectionDto';
import type { EditorPortfolioItemsData, EditorPortfolioItems } from '../../components/portfolio/dnd/EditorTypes';
import type { PortfolioItem } from '../../types/itemDto';

export function useDndHandlers(params: {
  sectionsConfig: PortfolioSection[];
  items: Record<string, UniqueIdentifier[]>;
  setItems: React.Dispatch<React.SetStateAction<Record<string, UniqueIdentifier[]>>>;
  itemsData: EditorPortfolioItemsData;
  setItemsData: React.Dispatch<React.SetStateAction<EditorPortfolioItemsData>>;
  activeId: UniqueIdentifier | null;
  setActiveId: (id: UniqueIdentifier | null) => void;
  clonedItems: EditorPortfolioItems | null;
  setClonedItems: React.Dispatch<React.SetStateAction<EditorPortfolioItems | null>>;
  recentlyMovedToNewZone: React.MutableRefObject<boolean>;
  setAllDropsNone: () => void;
  updateDropIndicators: (activeId: UniqueIdentifier) => void;
  findZone: (id: UniqueIdentifier) => string | undefined;
  promptSave: (p: { item: PortfolioItem; targetZone: string; targetId: string }) => void;
}) {
  const {
    sectionsConfig, items, setItems, itemsData, setItemsData,
    setActiveId, clonedItems, setClonedItems, recentlyMovedToNewZone,
    setAllDropsNone, updateDropIndicators, findZone, promptSave,
  } = params;

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewZone.current = false;
    });
  }, [items, recentlyMovedToNewZone]);

  const onDragCancel = useCallback(() => {
    if (clonedItems) setItems(clonedItems);
    setActiveId(null);
    setAllDropsNone();
    setClonedItems(null);
  }, [clonedItems, setItems, setActiveId, setAllDropsNone, setClonedItems]);

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    setActiveId(active.id);
    setClonedItems(items);
    updateDropIndicators(active.id);
  }, [items, setActiveId, setClonedItems, updateDropIndicators]);

  const handleDragOver = useCallback(({ active, over }: DragOverEvent) => {
    const overId = over?.id;
    if (overId == null || active.id in items) return;

    const overZone = findZone(overId);
    const activeZone = findZone(active.id);
    if (!overZone || !activeZone) return;

    if (activeZone !== overZone) {
      const destSection = sectionsConfig.find((s) => s.id === overZone);
      const srcSection = sectionsConfig.find((s) => s.id === activeZone);
      if (!destSection || !srcSection) return;

      const dragged = itemsData[active.id];
      if (!dragged) return;
      const itemForValidation = dragged.type === 'savedItem' ? dragged.originalItem : dragged;

      if (destSection.type !== 'savedItems' && destSection.type !== itemForValidation.sectionType) return;
      if (!destSection.allowedItemTypes.includes(itemForValidation.type)) return;
      if (destSection.type === 'savedItems' && srcSection.type !== 'savedItems') return;
      if (srcSection.type === 'savedItems' && destSection.type !== 'savedItems') return;

      const overItems = items[overZone];
      if ((overItems?.length ?? 0) >= getMaxItems(destSection)) return;

      const overIndex = overItems.indexOf(overId as string);
      const activeIndex = items[activeZone].indexOf(active.id as string);
      const isBelow = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
      const modifier = isBelow ? 1 : 0;
      const newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length;

      recentlyMovedToNewZone.current = true;

      setItems((cur) => ({
        ...cur,
        [activeZone]: cur[activeZone].filter((it) => it !== active.id),
        [overZone]: [...cur[overZone].slice(0, newIndex), cur[activeZone][activeIndex], ...cur[overZone].slice(newIndex)],
      }));
    }
  }, [findZone, items, itemsData, sectionsConfig, setItems, recentlyMovedToNewZone]);

  const handleDragEnd = useCallback(({ active, over }: DragEndEvent) => {
    let revert = false;
    const activeZone = findZone(active.id);
    const dragged = itemsData[active.id];
    const overId = over?.id;

    if (activeZone && overId && dragged) {
      const overZone = findZone(overId);
      if (overZone) {
        const destSection = sectionsConfig.find((s) => s.id === overZone);
        const srcSection = sectionsConfig.find((s) => s.id === activeZone);
        const itemForValidation = dragged.type === 'savedItem' ? dragged.originalItem : dragged;

        if (!destSection || !srcSection ||
            (destSection.type !== 'savedItems' &&
             (destSection.type !== itemForValidation.sectionType ||
              !destSection.allowedItemTypes.includes(itemForValidation.type)))) {
          revert = true;
        }

        // to savedItems => prompt name, clone later (optimistic handled in useOptimisticSaves)
        if (destSection && destSection.type === 'savedItems' && srcSection && srcSection.type !== 'savedItems') {
          const currentSaved = items[overZone]?.length ?? 0;
          if (currentSaved >= getMaxItems(destSection)) {
            revert = true;
          } else {
            promptSave({ item: dragged, targetZone: overZone, targetId: overId as string });
          }
        }

        // from savedItems => clone to other sections
        if (srcSection?.type === 'savedItems' && destSection?.type !== 'savedItems') {
          const itemToClone = dragged.type === 'savedItem' ? dragged.originalItem : dragged;

          // Check destination capacity before cloning to avoid exceeding max items
          const destCount = items[overZone]?.length ?? 0;
          if (destSection && destCount >= getMaxItems(destSection)) {
            // destination full, revert the move
            revert = true;
          } else if (destSection) {
            const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}` as UniqueIdentifier;
            setItemsData((d) => ({ ...d, [newId]: { ...itemToClone, sectionType: destSection.type } }));
            const insertIndex = items[overZone].indexOf(overId as string);
            setItems((prev) => {
              const destItems = prev[overZone] ?? [];
              const idx = insertIndex >= 0 ? insertIndex : destItems.length;
              return { ...prev, [overZone]: [...destItems.slice(0, idx), newId, ...destItems.slice(idx)] };
            });
          }
        }

        // reorder when no cloning involved
        const aIdx = items[activeZone].indexOf(active.id as string);
        const oIdx = items[overZone].indexOf(overId as string);
        if (!(
          destSection?.type === 'savedItems' && srcSection?.type !== 'savedItems'
        ) && !(
          srcSection?.type === 'savedItems' && destSection?.type !== 'savedItems'
        )) {
          if (aIdx !== oIdx) {
            setItems((cur) => ({ ...cur, [overZone]: arrayMove(cur[overZone], aIdx, oIdx) }));
          }
        }
      }
    }

    setAllDropsNone();
    if (revert && clonedItems) setItems(clonedItems);

    setActiveId(null);
    setClonedItems(null);
  }, [findZone, items, itemsData, sectionsConfig, setItems, setItemsData, clonedItems, setClonedItems, setActiveId, setAllDropsNone, promptSave]);

  return { onDragCancel, handleDragStart, handleDragOver, handleDragEnd };
}
