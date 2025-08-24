import { useCallback } from 'react';
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import type { PortfolioDndStateHook } from './hooks';
import { DndStateHelpers } from './stateHelpers';
import { TRASH_ID } from './collisionDetection';

/**
 * Hook that provides DnD event handlers following MultipleContainers pattern
 */
export function usePortfolioDndCallbacks(dndState: PortfolioDndStateHook) {
  const {
    sectionsMap,
    itemsMap,
    setActiveId,
    updateSectionsFromDnd,
    createSnapshots,
    revertToSnapshots,
    clearSnapshots,
    findContainer,
    getItemIndex,
    markRecentMove
  } = dndState;

  /**
   * Handles drag start - creates snapshots and sets active item
   */
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    
    setActiveId(active.id);
    createSnapshots();
    
    console.log('Drag started for:', active.id);
  }, [setActiveId, createSnapshots]);

  /**
   * Handles drag over - performs live updates during drag
   */
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    // No valid drop target
    if (!overId || overId === TRASH_ID) {
      return;
    }

    // Don't handle container dragging in onDragOver
    if (active.id in sectionsMap) {
      return;
    }

    const overContainer = findContainer(overId);
    const activeContainer = findContainer(active.id);

    // No valid containers found
    if (!overContainer || !activeContainer) {
      return;
    }

    // Moving between different containers
    if (activeContainer !== overContainer) {
      const activeIndex = getItemIndex(active.id);
      const overIndex = overId in sectionsMap 
        ? sectionsMap[overId].length // If dropping on container, add to end
        : getItemIndex(overId); // If dropping on item, get its position

      if (activeIndex === -1) return;

      const newSectionsMap = DndStateHelpers.moveItemBetweenSections(
        sectionsMap,
        activeContainer,
        overContainer,
        activeIndex,
        overIndex >= 0 ? overIndex : 0
      );

      updateSectionsFromDnd(newSectionsMap);
      markRecentMove();
      
      console.log('Moved between containers:', {
        from: activeContainer,
        to: overContainer,
        activeIndex,
        overIndex
      });
    }
  }, [
    sectionsMap,
    findContainer,
    getItemIndex,
    updateSectionsFromDnd,
    markRecentMove
  ]);

  /**
   * Handles drag end - finalizes the drag operation
   */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    // Handle container dragging (section reordering)
    if (active.id in sectionsMap && overId) {
      // TODO: Implement section reordering if needed
      console.log('Section reordering not implemented yet');
      setActiveId(null);
      clearSnapshots();
      return;
    }

    const activeContainer = findContainer(active.id);

    if (!activeContainer) {
      setActiveId(null);
      clearSnapshots();
      return;
    }

    // No drop target - revert changes
    if (!overId) {
      console.log('No drop target - reverting');
      revertToSnapshots();
      setActiveId(null);
      clearSnapshots();
      return;
    }

    // Dropped on trash - remove item
    if (overId === TRASH_ID) {
      console.log('Dropped on trash - removing item:', active.id);
      const { sectionsMap: newSectionsMap, itemsMap: newItemsMap } = 
        DndStateHelpers.removeItem(sectionsMap, itemsMap, active.id);
      
      updateSectionsFromDnd(newSectionsMap, newItemsMap);
      setActiveId(null);
      clearSnapshots();
      return;
    }

    const overContainer = findContainer(overId);

    // Moving within same container
    if (overContainer && activeContainer === overContainer) {
      const activeIndex = getItemIndex(active.id);
      const overIndex = getItemIndex(overId);

      if (activeIndex !== overIndex && activeIndex !== -1 && overIndex !== -1) {
        const newSectionsMap = DndStateHelpers.moveItemWithinSection(
          sectionsMap,
          activeContainer,
          activeIndex,
          overIndex
        );

        updateSectionsFromDnd(newSectionsMap);
        
        console.log('Moved within same container:', {
          container: activeContainer,
          from: activeIndex,
          to: overIndex
        });
      }
    }

    setActiveId(null);
    clearSnapshots();
  }, [
    sectionsMap,
    itemsMap,
    findContainer,
    getItemIndex,
    updateSectionsFromDnd,
    revertToSnapshots,
    setActiveId,
    clearSnapshots
  ]);

  /**
   * Handles drag cancel - reverts all changes
   */
  const handleDragCancel = useCallback(() => {
    console.log('Drag cancelled - reverting changes');
    revertToSnapshots();
    setActiveId(null);
    clearSnapshots();
  }, [revertToSnapshots, setActiveId, clearSnapshots]);

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel
  };
}

/**
 * Type for the return value of usePortfolioDndCallbacks
 */
export type PortfolioDndCallbacks = ReturnType<typeof usePortfolioDndCallbacks>;
