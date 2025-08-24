import { useState, useRef, useMemo } from 'react';
import { useSensors, useSensor, MouseSensor, TouchSensor, KeyboardSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { SectionConfig } from '../types/itemDto';
import type { 
  ItemsMap, 
  SectionsMap 
} from '../dnd/types';
import { DndStateHelpers } from '../dnd/stateHelpers';
import { useCollisionDetectionWithUtils } from '../dnd/collisionDetection';

/**
 * Hook that manages the DnD state for portfolio editor
 * Converts between legacy format and DnD format as needed
 */
export function usePortfolioDndState(initialSections: SectionConfig[]) {
  // Legacy sections for backward compatibility
  const [sections, setSections] = useState<SectionConfig[]>(initialSections);
  
  // DnD state
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  
  // Convert legacy format to DnD format when needed
  const dndSections = useMemo(() => 
    DndStateHelpers.convertToDndSections(sections), 
    [sections]
  );
  
  const itemsMap = useMemo(() => 
    DndStateHelpers.convertToItemsMap(sections), 
    [sections]
  );
  
  const sectionsMap = useMemo(() => 
    DndStateHelpers.convertToSectionsMap(sections), 
    [sections]
  );

  // Snapshots for revert operations
  const clonedSectionsRef = useRef<SectionsMap | null>(null);
  const clonedItemsRef = useRef<ItemsMap | null>(null);

  // Sensors for DnD
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10, // 10px movement required to start drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Collision detection
  const { collisionDetection, markRecentMove } = useCollisionDetectionWithUtils(
    activeId,
    sectionsMap
  );

  /**
   * Updates sections using DnD state helpers
   */
  const updateSectionsFromDnd = (
    newSectionsMap: SectionsMap,
    newItemsMap: ItemsMap = itemsMap
  ) => {
    const newSections = DndStateHelpers.convertToLegacyFormat(
      dndSections.map(section => ({
        ...section,
        items: newSectionsMap[section.id] || []
      })),
      newItemsMap
    );
    setSections(newSections);
  };

  /**
   * Creates snapshots for revert operations
   */
  const createSnapshots = () => {
    clonedSectionsRef.current = DndStateHelpers.cloneSectionsMap(sectionsMap);
    clonedItemsRef.current = DndStateHelpers.cloneItemsMap(itemsMap);
  };

  /**
   * Reverts to snapshots
   */
  const revertToSnapshots = () => {
    if (clonedSectionsRef.current && clonedItemsRef.current) {
      updateSectionsFromDnd(clonedSectionsRef.current, clonedItemsRef.current);
    }
  };

  /**
   * Clears snapshots
   */
  const clearSnapshots = () => {
    clonedSectionsRef.current = null;
    clonedItemsRef.current = null;
  };

  /**
   * Helper functions for DnD operations
   */
  const findContainer = (itemId: UniqueIdentifier) => 
    DndStateHelpers.findContainer(itemId, sectionsMap);

  const getItemIndex = (itemId: UniqueIdentifier) => 
    DndStateHelpers.getItemIndex(itemId, sectionsMap);

  return {
    // Legacy state
    sections,
    setSections,

    // DnD state
    activeId,
    setActiveId,
    dndSections,
    itemsMap,
    sectionsMap,

    // Sensors and collision detection
    sensors,
    collisionDetection,
    markRecentMove,

    // State operations
    updateSectionsFromDnd,
    createSnapshots,
    revertToSnapshots,
    clearSnapshots,

    // Helper functions
    findContainer,
    getItemIndex,

    // State helpers class (for advanced operations)
    stateHelpers: DndStateHelpers
  };
}

/**
 * Type for the return value of usePortfolioDndState
 */
export type PortfolioDndStateHook = ReturnType<typeof usePortfolioDndState>;
