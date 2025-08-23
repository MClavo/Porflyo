import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { SectionConfig } from '../types/itemDto';
import type { DropTargetData } from '../types/dragDto';

interface DroppableSectionProps {
  section: SectionConfig;
  children: React.ReactNode;
}

export const DroppableSection: React.FC<DroppableSectionProps> = ({ 
  section, 
  children 
}) => {
  const dropData: DropTargetData = {
    type: 'section',
    sectionId: section.id
  };

  const {
    isOver,
    setNodeRef
  } = useDroppable({
    id: `section-${section.id}`,
    data: dropData
  });

  return (
    <div
      ref={setNodeRef}
      className={`droppable-section ${isOver ? 'drop-target-active' : ''}`}
      style={{
        position: 'relative',
        minHeight: '50px', // Ensure minimum height for dropping
        width: '100%',
        // Add padding to make the drop area larger
        padding: '8px',
        boxSizing: 'border-box'
      }}
    >
      {children}
    </div>
  );
};
