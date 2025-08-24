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
import { createRange } from '../../utils/createRange';
import { PORTFOLIO_ZONES } from './portfolioGridData';
import type { PortfolioItems } from './portfolioGridTypes';

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
  // Initialize with sample data for each zone
  const [items, setItems] = useState<PortfolioItems>(() => ({
    profile: createRange(2, (index) => `profile_${index + 1}`),
    projects: createRange(4, (index) => `project_${index + 1}`),
    experience: createRange(3, (index) => `skill_${index + 1}`),
  }));
  
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewZone = useRef(false);

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
        // If we're over a zone, check if it has items
        if (overId in items) {
          const zoneItems = items[overId];

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
    [items]
  );

  const [clonedItems, setClonedItems] = useState<PortfolioItems | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: multipleContainersCoordinateGetter,
    })
  );

  const findZone = (id: UniqueIdentifier) => {
    if (id in items) {
      return id as string;
    }
    return Object.keys(items).find((key) => items[key].includes(id));
  };

  const onDragCancel = () => {
    if (clonedItems) {
      setItems(clonedItems);
    }
    setActiveId(null);
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
      return;
    }

    const overId = over?.id;

    if (overId == null) {
      setActiveId(null);
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
  };

  const renderSortableItemDragOverlay = (id: UniqueIdentifier) => {
    const zone = findZone(id);
    const zoneInfo = PORTFOLIO_ZONES.find(z => z.id === zone);
    
    return (
      <Item
        value={id}
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
