import { useCallback, useState } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { PortfolioItem, SavedItem } from '../../types/itemDto';
import { mapPortfolioItemToCreateDto } from '../../mappers/savedSections.mapper';
import type { ItemsRef, PendingDelete, PendingSave } from './types';
import type { SavedSectionCreateDto, PublicSavedSectionDto } from '../../types/savedSections.types';

export function useOptimisticSaves(
  itemsRef: ItemsRef,
  createSavedSectionMutation: { mutateAsync: (dto: SavedSectionCreateDto) => Promise<PublicSavedSectionDto> },
  deleteSavedSectionMutation: { mutateAsync: (id: string) => Promise<void> },
) {
  const { items, setItems, setItemsData } = itemsRef;

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingSaveItem, setPendingSaveItem] = useState<PendingSave | null>(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<PendingDelete | null>(null);

  const promptSave = useCallback((payload: PendingSave) => {
    setPendingSaveItem(payload);
    setShowSaveDialog(true);
  }, []);

  const handleSaveItem = useCallback(async (name: string) => {
    if (!pendingSaveItem) return;
    const { item, targetZone, targetId } = pendingSaveItem;

    const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}` as UniqueIdentifier;
    const savedItem: SavedItem = {
      id: Date.now(),
      type: 'savedItem',
      sectionType: 'savedItems',
      savedName: name,
      originalItem: (item.type === 'savedItem' ? (item as SavedItem).originalItem : (item as PortfolioItem)) as SavedItem['originalItem'],
    };

    setItemsData((d) => ({ ...d, [newId]: savedItem }));

    const insertIndex = (items[targetZone] ?? []).indexOf(targetId);
    setItems((prev) => {
      const dest = prev[targetZone] ?? [];
      const idx = insertIndex >= 0 ? insertIndex : dest.length;
      return { ...prev, [targetZone]: [...dest.slice(0, idx), newId, ...dest.slice(idx)] };
    });

    setPendingSaveItem(null);
    setShowSaveDialog(false);

    try {
      const dto = mapPortfolioItemToCreateDto(item, name);
      const savedInDb = await createSavedSectionMutation.mutateAsync(dto);
  setItemsData((d) => ({ ...d, [newId]: { ...d[newId], dbId: savedInDb.id } }));
    } catch {
      // opcional: toast
    }
  }, [pendingSaveItem, items, setItems, setItemsData, createSavedSectionMutation]);

  const handleCancelSave = useCallback(() => {
    setPendingSaveItem(null);
    setShowSaveDialog(false);
  }, []);

  const askDelete = useCallback((payload: PendingDelete) => {
    setPendingDeleteItem(payload);
    setShowDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDeleteItem) return;
    const { id, item } = pendingDeleteItem;

    setShowDeleteDialog(false);
    setPendingDeleteItem(null);

    setItems((prev) =>
      Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: prev[key].filter((x) => x !== id) }), {} as typeof items),
    );
    setItemsData((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    if (item.type === 'savedItem' && (item as SavedItem).dbId) {
      try {
  await deleteSavedSectionMutation.mutateAsync((item as SavedItem).dbId as string);
      } catch {
        /* opcional: toast */
      }
    }
  }, [pendingDeleteItem, setItems, setItemsData, deleteSavedSectionMutation]);

  const handleCancelDelete = useCallback(() => {
    setPendingDeleteItem(null);
    setShowDeleteDialog(false);
  }, []);

  return {
    // save
    showSaveDialog, pendingSaveItem, promptSave, handleSaveItem, handleCancelSave,
    // delete
    showDeleteDialog, pendingDeleteItem, askDelete, handleConfirmDelete, handleCancelDelete,
  };
}
