import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { PortfolioItem } from '../types/itemDto';
import type { DragData } from '../types/dragDto';
import { PortfolioItemRenderer, type ItemRendererCallbacks } from './PortfolioItemRenderer';

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
  
  const dragData: DragData = {
    sectionId,
    itemId: item.id,
    itemType: item.type,
    originalIndex: index
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: dragId,
    data: dragData
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    transition: 'none', // Remove transitions during drag for immediate response
    willChange: 'transform, opacity', // Optimize for frequent changes
  } : {
    opacity: 1,
    transition: 'none',
    willChange: 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`draggable-item ${isDragging ? 'dragging' : ''}`}
      {...listeners}
      {...attributes}
    >
      <div className="drag-handle">⋮⋮</div>
      <div className="item-content">
        {PortfolioItemRenderer.renderItem(item, sectionId, callbacks)}
      </div>
    </div>
  );
};
