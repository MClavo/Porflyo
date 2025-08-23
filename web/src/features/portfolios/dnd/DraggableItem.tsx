import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { PortfolioItem } from '../types/itemDto';
import type { DragData, DropTargetData } from '../types/dragDto';
import { PortfolioItemRenderer, type ItemRendererCallbacks } from '../components/PortfolioItemRenderer';

interface DraggableItemProps {
  item: PortfolioItem;
  sectionId: string;
  index: number;
  callbacks: ItemRendererCallbacks;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  item,
  sectionId,
  index,
  callbacks
}) => {
  const dragId = `${sectionId}-${item.id}`;
  const dropId = `item-${sectionId}-${item.id}`;
  
  const dragData: DragData = {
    sectionId,
    itemId: item.id,
    itemType: item.type,
    originalIndex: index
  };

  const dropData: DropTargetData = {
    type: 'item',
    sectionId,
    itemId: item.id,
    index
  };

  const {
    attributes,
    listeners,
    setNodeRef: setDragNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: dragId,
    data: dragData
  });

  const {
    isOver,
    setNodeRef: setDropNodeRef
  } = useDroppable({
    id: dropId,
    data: dropData,
    disabled: isDragging // Disable drop when this item is being dragged
  });

  // Combine refs for both drag and drop functionality
  const setNodeRef = (node: HTMLElement | null) => {
    setDragNodeRef(node);
    setDropNodeRef(node);
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    transition: 'none',
    willChange: 'transform, opacity',
    pointerEvents: (isDragging ? 'none' : 'auto') as React.CSSProperties['pointerEvents'],
  } : {
    opacity: 1,
    transition: 'none',
    willChange: 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`draggable-item ${isDragging ? 'dragging' : ''} ${isOver && !isDragging ? 'drop-target' : ''}`}
      {...(!isDragging ? listeners : {})} // Only apply listeners when not dragging
      {...(!isDragging ? attributes : {})}
    >
      <div className="drag-handle" {...(isDragging ? {} : listeners)} {...(isDragging ? {} : attributes)}>
        ⋮⋮
      </div>
      <div className="item-content">
        {PortfolioItemRenderer.renderItem(item, sectionId, callbacks)}
      </div>
    </div>
  );
};
