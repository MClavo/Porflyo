import { useCallback } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { useOptimisticSaves } from './useOptimisticSaves';
import type { ItemCompProps } from './overlay';
import { useSavedItems } from '../useSavedItems';
import { useCreateSavedSection, useDeleteSavedSection } from './useSavedSections';
import { useDndSensors } from './useSensors';
import { useBaseState } from './state';
import { useFindZone, useItemOps } from './useItemOps';
import { useSavedItemsSync } from './useSavedItemsSync';
import { useDropIndicators } from './useDropIndicators';
import { useDndHandlers } from './useDndHandlers';
import { renderSortableItemDragOverlay } from './overlay';
import { dropAnimation } from './constants';
import type { EditorPortfolioItemsData } from '../../components/portfolio/dnd/EditorTypes';

import { DEFAULT_SECTIONS as PORTFOLIO_SECTIONS } from '../../types/sectionDto';

export { dropAnimation };

export function usePortfolioGrid(sectionsConfig = PORTFOLIO_SECTIONS as typeof PORTFOLIO_SECTIONS) {
  // server/cache
  const { savedItems, isLoading: isLoadingSavedItems } = useSavedItems();
  const createSavedSectionMutation = useCreateSavedSection();
  const deleteSavedSectionMutation = useDeleteSavedSection();

  // base state
  const {
    items, setItems,
    itemsData, setItemsData,
    activeId, setActiveId,
    clonedItems, setClonedItems,
    recentlyMovedToNewZone,
    sectionDropStates, setSectionDropStates,
  } = useBaseState(sectionsConfig);

  // sensors
  const sensors = useDndSensors();

  // helpers & ops
  const findZone = useFindZone(items);
  const { addItemToSection, removeItem, handleItemUpdate } = useItemOps(
    sectionsConfig,
    { items, setItems, itemsData, setItemsData }
  );

  // saved items initial sync
  const { savedItemsLoaded } = useSavedItemsSync(
    sectionsConfig,
    savedItems,
    { items, setItems, itemsData, setItemsData }
  );

  // drop indicators
  const updateDropIndicators = useDropIndicators(
    sectionsConfig,
    items,
    itemsData,
    findZone,
    setSectionDropStates
  );

  const setAllDropsNone = useCallback(() => {
    setSectionDropStates((prev) => {
      const out = { ...prev }; Object.keys(out).forEach((k) => (out[k] = 'none')); return out;
    });
  }, [setSectionDropStates]);

  // optimistic saves / deletes & dialogs
  const {
    showSaveDialog, pendingSaveItem, promptSave, handleSaveItem, handleCancelSave,
    showDeleteDialog, pendingDeleteItem, askDelete, handleConfirmDelete, handleCancelDelete,
  } = useOptimisticSaves(
    { items, setItems, itemsData, setItemsData },
    createSavedSectionMutation,
    deleteSavedSectionMutation
  );

  // DnD handlers
  const { onDragCancel, handleDragStart, handleDragOver, handleDragEnd } = useDndHandlers({
    sectionsConfig,
    items, setItems,
    itemsData, setItemsData,
    activeId, setActiveId,
    clonedItems, setClonedItems,
    recentlyMovedToNewZone,
    setAllDropsNone,
    updateDropIndicators,
    findZone,
    promptSave,
  });

  // overlay renderer
  const dragOverlayRenderer = useCallback(
    (id: UniqueIdentifier, ItemComponent: React.ComponentType<ItemCompProps>) => renderSortableItemDragOverlay(id, itemsData as EditorPortfolioItemsData, ItemComponent),
    [itemsData]
  );

  return {
    items, setItems,
    itemsData, setItemsData,
    addItemToSection,
    sensors,
    onDragCancel,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    activeId,
    renderSortableItemDragOverlay: dragOverlayRenderer,
    handleItemUpdate,
  removeItem: (id: UniqueIdentifier) => removeItem(id, askDelete),
    sectionDropStates,
    showSaveDialog, pendingSaveItem, handleSaveItem, handleCancelSave,
    showDeleteDialog, pendingDeleteItem, handleConfirmDelete, handleCancelDelete,
    isLoadingSavedItems: isLoadingSavedItems && !savedItemsLoaded,
  } as const;
}
