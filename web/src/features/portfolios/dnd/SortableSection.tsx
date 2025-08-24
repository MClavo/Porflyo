import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { AnimateLayoutChanges } from '@dnd-kit/sortable';
import { defaultAnimateLayoutChanges } from '@dnd-kit/sortable';
import type { DndSectionConfig, ItemsMap } from '../dnd/types';
import type { PortfolioItem } from '../types/itemDto';

/**
 * Animation configuration following MultipleContainers pattern
 */
const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

/**
 * Props for the sortable section container
 */
interface SortableSectionProps {
  section: DndSectionConfig;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  onSectionAction?: (sectionId: string, action: string) => void;
}

/**
 * Sortable section container that can be dragged and contains sortable items
 * Based on DroppableContainer from MultipleContainers example
 */
export function SortableSection({
  section,
  children,
  className = '',
  style,
  disabled = false,
  onSectionAction
}: SortableSectionProps) {
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
    id: section.id,
    data: {
      type: 'section',
      children: section.items,
    },
    animateLayoutChanges,
    disabled
  });

  // Determine if this section is being hovered over during drag
  const isOverContainer = over
    ? (section.id === over.id && active?.data.current?.type !== 'section') ||
      section.items.includes(over.id)
    : false;

  // Combine styles
  const combinedStyle: React.CSSProperties = {
    ...style,
    transition,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : undefined,
  };

  // Combine class names
  const combinedClassName = [
    'sortable-section',
    className,
    isOverContainer ? 'section-hover' : '',
    isDragging ? 'section-dragging' : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={disabled ? undefined : setNodeRef}
      style={combinedStyle}
      className={combinedClassName}
      data-section-id={section.id}
    >
      {/* Section Header */}
      <div 
        className="section-header"
        {...attributes}
        {...listeners}
      >
        <h3 className="section-title">{section.title}</h3>
        <div className="section-controls">
          <button
            type="button"
            className="section-action-btn"
            onClick={() => onSectionAction?.(section.id, 'add')}
            onPointerDown={(e) => e.stopPropagation()} // Prevent drag
          >
            +
          </button>
          <button
            type="button"
            className="section-action-btn"
            onClick={() => onSectionAction?.(section.id, 'delete')}
            onPointerDown={(e) => e.stopPropagation()} // Prevent drag
          >
            ×
          </button>
        </div>
      </div>

      {/* Section Content */}
      <div className="section-content">
        {children}
        
        {/* Empty state when no items */}
        {section.items.length === 0 && (
          <div className="section-empty-state">
            <p>Drop items here or click + to add</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Props for section drag overlay
 */
interface SectionDragOverlayProps {
  section: DndSectionConfig;
  itemsMap: ItemsMap;
  renderItem: (itemId: UniqueIdentifier, item: PortfolioItem) => React.ReactNode;
}

/**
 * Drag overlay for sections being dragged
 */
export function SectionDragOverlay({
  section,
  itemsMap,
  renderItem
}: SectionDragOverlayProps) {
  return (
    <div className="section-drag-overlay">
      <div className="section-header">
        <h3 className="section-title">{section.title}</h3>
      </div>
      <div className="section-content">
        {section.items.map((itemId) => {
          const item = itemsMap[itemId];
          return item ? (
            <div key={itemId} className="item-drag-preview">
              {renderItem(itemId, item)}
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}
