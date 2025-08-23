import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DropZoneProps {
  sectionId: string;
  index: number;
  isVisible?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ 
  sectionId, 
  index, 
  isVisible = false 
}) => {
  const dropId = `${sectionId}-drop-${index}`;
  
  const {
    isOver,
    setNodeRef
  } = useDroppable({
    id: dropId,
    data: {
      sectionId,
      index,
      type: 'drop-zone'
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`drop-zone ${isOver ? 'drop-zone-active' : ''} ${isVisible ? 'drop-zone-visible' : ''}`}
      style={{
        height: isOver ? '20px' : '4px',
        transition: 'none', // Remove transition for immediate response
        backgroundColor: isOver ? '#3b82f6' : 'transparent',
        borderRadius: '2px',
        margin: '2px 0'
      }}
    />
  );
};
