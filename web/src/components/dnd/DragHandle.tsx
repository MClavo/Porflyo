import React from "react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import "./DragHandle.css";

interface DragHandleProps {
  listeners?: SyntheticListenerMap;
  attributes?: DraggableAttributes;
}

/**
 * Visual drag handle component that appears at the top of cards in edit mode.
 * Provides an intuitive grabbing area for reordering cards.
 */
const DragHandle: React.FC<DragHandleProps> = ({ listeners, attributes }) => {
  return (
    <div 
      className="drag-handle"
      {...listeners}
      {...attributes}
      role="button"
      aria-label="Drag to reorder"
      tabIndex={0}
    >
      <div className="drag-handle__grip">
        <span className="drag-handle__dot"></span>
        <span className="drag-handle__dot"></span>
        <span className="drag-handle__dot"></span>
        <span className="drag-handle__dot"></span>
        <span className="drag-handle__dot"></span>
        <span className="drag-handle__dot"></span>
        <span className="drag-handle__dot"></span>
        <span className="drag-handle__dot"></span>
        <span className="drag-handle__dot"></span>
        <span className="drag-handle__dot"></span>
      </div>
    </div>
  );
};

export default DragHandle;
