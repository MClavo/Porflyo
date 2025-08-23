import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { SectionConfig } from '../types/itemDto';

interface DroppableSectionProps {
  section: SectionConfig;
  children: React.ReactNode;
}

export const DroppableSection: React.FC<DroppableSectionProps> = ({ 
  section, 
  children 
}) => {
  const {
    isOver,
    setNodeRef
  } = useDroppable({
    id: section.id,
    data: {
      sectionId: section.id,
      allowedTypes: section.allowedItemTypes,
      maxItems: section.maxItems,
      currentItemCount: section.items.length
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`droppable-section ${isOver ? 'drop-target-active' : ''}`}
    >
      {children}
    </div>
  );
};
