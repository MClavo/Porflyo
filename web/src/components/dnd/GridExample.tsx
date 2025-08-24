import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal, unstable_batchedUpdates } from 'react-dom';
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
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { coordinateGetter as multipleContainersCoordinateGetter } from './multipleContainersKeyboardCoordinates';

import { Item } from './Item';
import { Container } from './Container';
import { createRange } from '../../utils/createRange';

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

type Items = Record<UniqueIdentifier, UniqueIdentifier[]>;

const TRASH_ID = 'void';
const PLACEHOLDER_ID = 'placeholder';
const empty: UniqueIdentifier[] = [];

function DroppableContainer({
  children,
  columns = 1,
  disabled,
  id,
  items,
  style,
  ...props
}: {
  children: React.ReactNode;
  columns?: number;
  disabled?: boolean;
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
  style?: React.CSSProperties;
  [key: string]: unknown;
}) {
  const {
    active,
    attributes,
    isDragging,
    listeners,
    over,
    setNodeRef,
    transition,
    transform,
  } = useSortable({
    id,
    data: {
      type: 'container',
      children: items,
    },
    animateLayoutChanges: () => false,
  });
  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== 'container') ||
      items.includes(over.id)
    : false;

  return (
    <Container
      ref={disabled ? undefined : setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
      }}
      hover={isOverContainer}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      columns={columns}
      {...props}
    >
      {children}
    </Container>
  );
}

export function GridExample() {
  const [items, setItems] = useState<Items>(() => ({
    A: createRange(3, (index) => `A${index + 1}`),
    B: createRange(3, (index) => `B${index + 1}`),
    C: createRange(3, (index) => `C${index + 1}`),
    D: createRange(3, (index) => `D${index + 1}`),
  }));
  const [containers, setContainers] = useState(
    Object.keys(items) as UniqueIdentifier[]
  );
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const isSortingContainer =
    activeId != null ? containers.includes(activeId) : false;

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeId && activeId in items) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in items
          ),
        });
      }

      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, 'id');

      if (overId != null) {
        if (overId === TRASH_ID) {
          return intersections;
        }

        if (overId in items) {
          const containerItems = items[overId];

          if (containerItems.length > 0) {
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  containerItems.includes(container.id)
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;
        return [{ id: overId }];
      }

      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, items]
  );

  const [clonedItems, setClonedItems] = useState<Items | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: multipleContainersCoordinateGetter,
    })
  );

  const findContainer = (id: UniqueIdentifier) => {
    if (id in items) {
      return id;
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
      recentlyMovedToNewContainer.current = false;
    });
  }, [items]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={({ active }) => {
        setActiveId(active.id);
        setClonedItems(items);
      }}
      onDragOver={({ active, over }) => {
        const overId = over?.id;

        if (overId == null || overId === TRASH_ID || active.id in items) {
          return;
        }

        const overContainer = findContainer(overId);
        const activeContainer = findContainer(active.id);

        if (!overContainer || !activeContainer) {
          return;
        }

        if (activeContainer !== overContainer) {
          setItems((items) => {
            const activeItems = items[activeContainer];
            const overItems = items[overContainer];
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

            recentlyMovedToNewContainer.current = true;

            return {
              ...items,
              [activeContainer]: items[activeContainer].filter(
                (item) => item !== active.id
              ),
              [overContainer]: [
                ...items[overContainer].slice(0, newIndex),
                items[activeContainer][activeIndex],
                ...items[overContainer].slice(
                  newIndex,
                  items[overContainer].length
                ),
              ],
            };
          });
        }
      }}
      onDragEnd={({ active, over }) => {
        if (active.id in items && over?.id) {
          setContainers((containers) => {
            const activeIndex = containers.indexOf(active.id);
            const overIndex = containers.indexOf(over.id);

            return arrayMove(containers, activeIndex, overIndex);
          });
        }

        const activeContainer = findContainer(active.id);

        if (!activeContainer) {
          setActiveId(null);
          return;
        }

        const overId = over?.id;

        if (overId == null) {
          setActiveId(null);
          return;
        }

        if (overId === TRASH_ID) {
          setItems((items) => ({
            ...items,
            [activeContainer]: items[activeContainer].filter(
              (id) => id !== activeId
            ),
          }));
          setActiveId(null);
          return;
        }

        if (overId === PLACEHOLDER_ID) {
          const newContainerId = getNextContainerId();

          unstable_batchedUpdates(() => {
            setContainers((containers) => [...containers, newContainerId]);
            setItems((items) => ({
              ...items,
              [activeContainer]: items[activeContainer].filter(
                (id) => id !== activeId
              ),
              [newContainerId]: [active.id],
            }));
            setActiveId(null);
          });
          return;
        }

        const overContainer = findContainer(overId);

        if (overContainer) {
          const activeIndex = items[activeContainer].indexOf(active.id);
          const overIndex = items[overContainer].indexOf(overId);

          if (activeIndex !== overIndex) {
            setItems((items) => ({
              ...items,
              [overContainer]: arrayMove(
                items[overContainer],
                activeIndex,
                overIndex
              ),
            }));
          }
        }

        setActiveId(null);
      }}
      onDragCancel={onDragCancel}
    >
      <div
        style={{
          display: 'inline-grid',
          boxSizing: 'border-box',
          padding: 20,
          gridAutoFlow: 'column',
        }}
      >
        <SortableContext
          items={[...containers, PLACEHOLDER_ID]}
          strategy={horizontalListSortingStrategy}
        >
          {containers.map((containerId) => (
            <DroppableContainer
              key={containerId}
              id={containerId}
              label={`Column ${containerId}`}
              columns={2}
              items={items[containerId]}
              onRemove={() => handleRemove(containerId)}
            >
              <SortableContext items={items[containerId]} strategy={rectSortingStrategy}>
                {items[containerId].map((value, index) => {
                  return (
                    <SortableItem
                      disabled={isSortingContainer}
                      key={value}
                      id={value}
                      index={index}
                      handle={false}
                      wrapperStyle={() => ({
                        width: 150,
                        height: 150,
                      })}
                    />
                  );
                })}
              </SortableContext>
            </DroppableContainer>
          ))}
          <DroppableContainer
            id={PLACEHOLDER_ID}
            disabled={isSortingContainer}
            items={empty}
            onClick={handleAddColumn}
            placeholder
          >
            + Add column
          </DroppableContainer>
        </SortableContext>
      </div>
      {createPortal(
        <DragOverlay adjustScale={false} dropAnimation={dropAnimation}>
          {activeId
            ? containers.includes(activeId)
              ? renderContainerDragOverlay(activeId)
              : renderSortableItemDragOverlay(activeId)
            : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );

  function renderSortableItemDragOverlay(id: UniqueIdentifier) {
    return (
      <Item
        value={id}
        handle={false}
        style={{}}
        color={getColor(id)}
        wrapperStyle={{
          width: 150,
          height: 150,
        }}
        dragOverlay
      />
    );
  }

  function renderContainerDragOverlay(containerId: UniqueIdentifier) {
    return (
      <Container
        label={`Column ${containerId}`}
        columns={2}
        style={{
          height: '100%',
        }}
        shadow
        unstyled={false}
      >
        {items[containerId].map((item) => (
          <Item
            key={item}
            value={item}
            handle={false}
            style={{}}
            color={getColor(item)}
            wrapperStyle={{ width: 150, height: 150 }}
          />
        ))}
      </Container>
    );
  }

  function handleRemove(containerID: UniqueIdentifier) {
    setContainers((containers) =>
      containers.filter((id) => id !== containerID)
    );
  }

  function handleAddColumn() {
    const newContainerId = getNextContainerId();

    unstable_batchedUpdates(() => {
      setContainers((containers) => [...containers, newContainerId]);
      setItems((items) => ({
        ...items,
        [newContainerId]: [],
      }));
    });
  }

  function getNextContainerId() {
    const containerIds = Object.keys(items);
    const lastContainerId = containerIds[containerIds.length - 1];

    return String.fromCharCode(lastContainerId.charCodeAt(0) + 1);
  }
}

function getColor(id: UniqueIdentifier) {
  switch (String(id)[0]) {
    case 'A':
      return '#7193f1';
    case 'B':
      return '#ffda6c';
    case 'C':
      return '#00bcd4';
    case 'D':
      return '#ef769f';
  }

  return undefined;
}

interface SortableItemProps {
  id: UniqueIdentifier;
  index: number;
  handle: boolean;
  disabled?: boolean;
  wrapperStyle(): React.CSSProperties;
}

function SortableItem({
  disabled,
  id,
  index,
  handle,
  wrapperStyle,
}: SortableItemProps) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    isDragging,
    isSorting,
    transform,
    transition,
  } = useSortable({
    id,
  });
  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;

  return (
    <Item
      ref={disabled ? undefined : setNodeRef}
      value={id}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      handleProps={handle ? setActivatorNodeRef : undefined}
      index={index}
      wrapperStyle={wrapperStyle()}
      style={{}}
      color={getColor(id)}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
    />
  );
}

function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);
    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}
