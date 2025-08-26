import {
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PortfolioItem } from '../../types/itemDto';
import { getMaxItems, DEFAULT_SECTIONS as PORTFOLIO_SECTIONS, /* SectionType */ } from '../../types/sectionDto';
import type { EditorPortfolioItems as PortfolioItems, EditorPortfolioItemsData as PortfolioItemsData } from '../../components/portfolio/dnd/EditorTypes';
import type { DropAnimation } from '@dnd-kit/core';
import { defaultDropAnimationSideEffects as _defaultDropAnimationSideEffects } from '@dnd-kit/core';

export const dropAnimation: DropAnimation = {
  sideEffects: _defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

export function usePortfolioGrid(sectionsConfig = PORTFOLIO_SECTIONS as typeof PORTFOLIO_SECTIONS) {
  // Initialize with empty sections based on the section definitions
  const [items, setItems] = useState<PortfolioItems>(() =>
    sectionsConfig.reduce((acc, section) => {
      acc[section.id] = [];
      return acc;
    }, {} as PortfolioItems)
  );

  // Initialize with empty items data
  const [itemsData, setItemsData] = useState<PortfolioItemsData>(() => ({}));

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [sectionDropStates, setSectionDropStates] = useState<Record<string, 'allowed' | 'forbidden' | 'none'>>(() =>
    sectionsConfig.reduce((acc, s) => {
      acc[s.id] = 'none';
      return acc;
    }, {} as Record<string, 'allowed' | 'forbidden' | 'none'>)
  );
  const recentlyMovedToNewZone = useRef(false);
  const [clonedItems, setClonedItems] = useState<PortfolioItems | null>(null);

  const handleItemUpdate = useCallback((id: UniqueIdentifier, updatedItem: PortfolioItem) => {
    setItemsData((prev) => ({ ...prev, [id]: updatedItem }));
  }, []);

  const addItemToSection = useCallback(
    (sectionId: string, itemType?: import('../../types/itemDto').ItemType) => {
      const sectionConfig = sectionsConfig.find((s) => s.id === sectionId);
      if (!sectionConfig) return;

      setItems((prev) => {
        const sectionItems = prev[sectionId] || [];
        if (sectionItems.length >= getMaxItems(sectionConfig)) return prev;

        const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}` as UniqueIdentifier;

        const defaultType = itemType || sectionConfig.allowedItemTypes[0] || 'text';
        const defaultItem: PortfolioItem =
          defaultType === 'character'
            ? { id: Date.now(), type: 'character', sectionType: sectionConfig.type, character: '?' }
            : defaultType === 'doubleText'
            ? { id: Date.now(), type: 'doubleText', sectionType: sectionConfig.type, text1: 'Title', text2: 'Subtitle' }
            : { id: Date.now(), type: 'text', sectionType: sectionConfig.type, text: 'New text' };

        setItemsData((data) => ({ ...data, [newId]: defaultItem }));

        return { ...prev, [sectionId]: [...sectionItems, newId] };
      });
    },
    [sectionsConfig]
  );

  const removeItem = useCallback((id: UniqueIdentifier) => {
    setItems((prev) => {
      const updated = Object.keys(prev).reduce((acc, key) => {
        acc[key] = prev[key].filter((item) => item !== id);
        return acc;
      }, {} as PortfolioItems);

      return updated;
    });

    setItemsData((prev) => {
      const copy = { ...prev } as PortfolioItemsData;
      delete copy[id];
      return copy;
    });
  }, []);

  const findZone = useCallback(
    (id: UniqueIdentifier) => {
      if (id in items) return id as string;
      return Object.keys(items).find((key) => items[key].includes(id));
    },
    [items]
  );

  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 10 } }), useSensor(TouchSensor, { activationConstraint: { distance: 10 } }));

  const onDragCancel = () => {
    if (clonedItems) setItems(clonedItems);
    setActiveId(null);
    // reset drop indicators
    setSectionDropStates((prev) => {
      const out = { ...prev };
      Object.keys(out).forEach((k) => (out[k] = 'none'));
      return out;
    });
    setClonedItems(null);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewZone.current = false;
    });
  }, [items]);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id);
    setClonedItems(items);
    // Compute which sections would accept this item and set indicators
    const draggedItem = itemsData[active.id];
    setSectionDropStates((prev) => {
      const out = { ...prev };
      Object.keys(out).forEach((sectionId) => {
        const srcSection = sectionsConfig.find((s) => findZone(active.id) === s.id);
        const destSection = sectionsConfig.find((s) => s.id === sectionId);
        if (!srcSection || !destSection || !draggedItem) {
          out[sectionId] = 'none';
          return;
        }
        // allowed only if same section type and destination allows item type
        if (destSection.type === 'savedItems' || (draggedItem.sectionType === destSection.type && destSection.allowedItemTypes.includes(draggedItem.type))) {
          out[sectionId] = 'allowed';
        } else {
          out[sectionId] = 'forbidden';
        }
      });
      return out;
    });
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    const overId = over?.id;

    if (overId == null || active.id in items) return;

    const overZone = findZone(overId);
    const activeZone = findZone(active.id);

    if (!overZone || !activeZone) return;

    if (activeZone !== overZone) {
      const destSection = sectionsConfig.find((section) => section.id === overZone);
      const srcSection = sectionsConfig.find((section) => section.id === activeZone);

      // If either section not found, prevent move
      if (!destSection || !srcSection) return;

      // Get the item being dragged
      const draggedItem = itemsData[active.id];
      if (!draggedItem) return;

      // Only allow move if the destination section has the same `type` as the source section
      // AND the destination's allowedItemTypes includes the dragged item's type.
      if (destSection.type !== "savedItems" && destSection.type !== draggedItem.sectionType) return;
      if (!destSection.allowedItemTypes.includes(draggedItem.type)) return;

      const overItems = items[overZone];
      if (destSection && overItems.length >= getMaxItems(destSection)) return;

      setItems((items) => {
        const activeItems = items[activeZone];
        const overItems = items[overZone];
        const overIndex = overItems.indexOf(overId as string);
        const activeIndex = activeItems.indexOf(active.id as string);

        let newIndex: number;

        if (overId in items) {
          newIndex = overItems.length + 1;
        } else {
          const isBelowOverItem = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
          const modifier = isBelowOverItem ? 1 : 0;
          newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }

        recentlyMovedToNewZone.current = true;

        return {
          ...items,
          [activeZone]: items[activeZone].filter((item) => item !== active.id),
          [overZone]: [...items[overZone].slice(0, newIndex), items[activeZone][activeIndex], ...items[overZone].slice(newIndex, items[overZone].length)],
        };
      });
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const activeZone = findZone(active.id);

    const resetDrops = (opts?: { revert?: boolean }) => {
      setSectionDropStates((prev) => {
        const out = { ...prev };
        Object.keys(out).forEach((k) => (out[k] = 'none'));
        return out;
      });
      if (opts?.revert && clonedItems) setItems(clonedItems);
      setActiveId(null);
      setClonedItems(null);
    };

    if (!activeZone) {
      resetDrops();
      return;
    }

    const overId = over?.id;

    if (overId == null) {
      resetDrops();
      return;
    }

    const overZone = findZone(overId);

    if (overZone) {
      // Enforce same-section-type + allowedItemTypes on final drop as well.
      const destSection = sectionsConfig.find((section) => section.id === overZone);
      const srcSection = sectionsConfig.find((section) => section.id === activeZone);
      if (!destSection || !srcSection) {
        resetDrops();
        return;
      }

      const draggedItem = itemsData[active.id];
      if (!draggedItem) {
        resetDrops();
        return;
      }

      if (destSection.type !== 'savedItems' && (destSection.type !== draggedItem.sectionType || !destSection.allowedItemTypes.includes(draggedItem.type))) {
        // Not allowed to move to this section; revert to original
        resetDrops({ revert: true });
        return;
      }

      const activeIndex = items[activeZone].indexOf(active.id as string);
      const overIndex = items[overZone].indexOf(overId as string);

      if (activeIndex !== overIndex) {
        setItems((items) => ({ ...items, [overZone]: arrayMove(items[overZone], activeIndex, overIndex) }));
      }
    }

    // Always reset drops and clear active id at the end
    resetDrops();
  };

  const renderSortableItemDragOverlay = (
    id: UniqueIdentifier,
    ItemComponent: React.ComponentType<{
      value: React.ReactNode;
      handle?: boolean;
      style?: React.CSSProperties;
      color?: string;
      wrapperStyle?: React.CSSProperties;
      dragOverlay?: boolean;
    }>
  ) => {
    //const sectionInfo = sectionsConfig.find((s) => s.id === activeOriginalZone);
    const item = itemsData[id];

    const renderItemContent = () => {
      if (!item) return id;

      switch (item.type) {
        case 'text':
          return item.text || 'Introduce texto...';
        case 'character':
          return item.character || '?';
        case 'doubleText':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold' }}>{item.text1 || 'Título principal...'}</div>
              <div style={{ fontSize: '0.8em', color: '#666' }}>{item.text2 || 'Subtítulo...'}</div>
            </div>
          );
        default:
          return id;
      }
    };

    return (
      <ItemComponent
        value={renderItemContent()}
        handle={false}
        style={{}}
        wrapperStyle={{ width: '100%', height: '100%' }}
        dragOverlay
      />
    );
  };

  return {
    items,
    setItems,
    itemsData,
    setItemsData,
    addItemToSection,
    sensors,
    onDragCancel,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    activeId,
    renderSortableItemDragOverlay,
    handleItemUpdate,
    removeItem,
  sectionDropStates,
  } as const;
}
