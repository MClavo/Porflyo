import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  closestCenter,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
  DndContext,
  DragOverlay,
  type DropAnimation,
  getFirstCollision,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensors,
  useSensor,
  MeasuringStrategy,
  defaultDropAnimationSideEffects,
  type DragOverEvent,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { coordinateGetter as multipleContainersCoordinateGetter } from './multipleContainersKeyboardCoordinates';

import { Item } from './Item';
import { PortfolioZone } from './PortfolioZone';
import { PORTFOLIO_ZONES } from './portfolioGridData';
import type { PortfolioItems, PortfolioItemsData } from './portfolioGridTypes';
import type { PortfolioItem } from '../../features/portfolios/types/itemDto';

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

export function PortfolioGrid() {
  // Initialize with sample data using simple IDs
  const [items, setItems] = useState<PortfolioItems>(() => ({
    profile: ['item_1', 'item_2'],
    projects: ['item_3', 'item_4', 'item_5', 'item_6'],
    experience: ['item_7', 'item_8', 'item_9'],
  }));

  // Separate state for the actual portfolio item data
  const [itemsData, setItemsData] = useState<PortfolioItemsData>(() => ({
    'item_1': { id: 1, type: 'text', text: 'Full Stack Developer' },
    'item_2': { id: 2, type: 'character', character: '🚀' },
    'item_3': { id: 3, type: 'doubleText', text1: 'Portfolio App', text2: 'React + TypeScript' },
    'item_4': { id: 4, type: 'text', text: 'E-commerce Platform' },
    'item_5': { id: 5, type: 'doubleText', text1: 'API Gateway', text2: 'Node.js + AWS' },
    'item_6': { id: 6, type: 'character', character: '💻' },
    'item_7': { id: 7, type: 'doubleText', text1: 'Senior Developer', text2: '2020-2024' },
    'item_8': { id: 8, type: 'text', text: 'JavaScript Expert' },
    'item_9': { id: 9, type: 'character', character: '⭐' },
  }));
  
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeOriginalZone, setActiveOriginalZone] = useState<string | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewZone = useRef(false);

  // Function to update item data
  const handleItemUpdate = useCallback((id: UniqueIdentifier, updatedItem: PortfolioItem) => {
    setItemsData(prev => ({
      ...prev,
      [id]: updatedItem
    }));
  }, []);

  const findZone = useCallback((id: UniqueIdentifier) => {
    if (id in items) {
      return id as string;
    }
    return Object.keys(items).find((key) => items[key].includes(id));
  }, [items]);

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, 'id');

      if (overId != null) {
        // Check if we're trying to move between zones
        const activeZone = args.active ? findZone(args.active.id) : null;
        
        // If we're over a zone, check constraints
        if (overId in items) {
          const zoneItems = items[overId];
          const zoneConfig = PORTFOLIO_ZONES.find(zone => zone.id === overId);
          
          // Don't allow drop on a full zone when moving from a different zone
          if (activeZone && activeZone !== overId && zoneConfig && zoneItems.length >= zoneConfig.maxItems) {
            return [];
          }

          // If zone has items, find the closest item within the zone
          if (zoneItems.length > 0) {
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  zoneItems.includes(container.id)
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;
        return [{ id: overId }];
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [items, findZone]
  );

  const [clonedItems, setClonedItems] = useState<PortfolioItems | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: multipleContainersCoordinateGetter,
    })
  );

  const onDragCancel = () => {
    if (clonedItems) {
      setItems(clonedItems);
    }
    setActiveId(null);
    setActiveOriginalZone(null);
    setClonedItems(null);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewZone.current = false;
    });
  }, [items]);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id);
    setActiveOriginalZone(findZone(active.id) || null);
    setClonedItems(items);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    const overId = over?.id;

    if (overId == null || active.id in items) {
      return;
    }

    const overZone = findZone(overId);
    const activeZone = findZone(active.id);

    if (!overZone || !activeZone) {
      return;
    }

    if (activeZone !== overZone) {
      // Check if the destination zone has reached its maximum capacity
      const zoneConfig = PORTFOLIO_ZONES.find(zone => zone.id === overZone);
      const overItems = items[overZone];
      
      if (zoneConfig && overItems.length >= zoneConfig.maxItems) {
        // Don't allow drop if zone is at capacity
        return;
      }

      setItems((items) => {
        const activeItems = items[activeZone];
        const overItems = items[overZone];
        const overIndex = overItems.indexOf(overId);
        const activeIndex = activeItems.indexOf(active.id);

        let newIndex: number;

        if (overId in items) {
          newIndex = overItems.length + 1;
        } else {
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top >
              over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;

          newIndex =
            overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }

        recentlyMovedToNewZone.current = true;

        return {
          ...items,
          [activeZone]: items[activeZone].filter(
            (item) => item !== active.id
          ),
          [overZone]: [
            ...items[overZone].slice(0, newIndex),
            items[activeZone][activeIndex],
            ...items[overZone].slice(
              newIndex,
              items[overZone].length
            ),
          ],
        };
      });
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const activeZone = findZone(active.id);

    if (!activeZone) {
      setActiveId(null);
      setActiveOriginalZone(null);
      return;
    }

    const overId = over?.id;

    if (overId == null) {
      setActiveId(null);
      setActiveOriginalZone(null);
      return;
    }

    const overZone = findZone(overId);

    if (overZone) {
      const activeIndex = items[activeZone].indexOf(active.id);
      const overIndex = items[overZone].indexOf(overId);

      if (activeIndex !== overIndex) {
        setItems((items) => ({
          ...items,
          [overZone]: arrayMove(
            items[overZone],
            activeIndex,
            overIndex
          ),
        }));
      }
    }

    setActiveId(null);
    setActiveOriginalZone(null);
  };

  const renderSortableItemDragOverlay = (id: UniqueIdentifier) => {
    // Use the original zone instead of the current zone during drag
    const zoneInfo = PORTFOLIO_ZONES.find(z => z.id === activeOriginalZone);
    const item = itemsData[id];
    
    // Function to render the content based on item type (static version for drag overlay)
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
      <Item
        value={renderItemContent()}
        handle={false}
        style={{}}
        color={zoneInfo?.color}
        wrapperStyle={{
          width: zoneInfo?.zoneType === 'cards-grid' ? 150 : 300,
          height: 100,
        }}
        dragOverlay
      />
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={onDragCancel}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '20px',
          padding: '20px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {PORTFOLIO_ZONES.map((zone) => (
          <PortfolioZone
            key={zone.id}
            zone={zone}
            items={items[zone.id]}
            itemsData={itemsData}
            onItemUpdate={handleItemUpdate}
          />
        ))}
      </div>
      
      {createPortal(
        <DragOverlay adjustScale={false} dropAnimation={dropAnimation}>
          {activeId ? renderSortableItemDragOverlay(activeId) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
