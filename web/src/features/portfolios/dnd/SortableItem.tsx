import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { PortfolioItem } from '../types/itemDto';

/**
 * Props for sortable item
 */
interface SortableItemProps {
  id: UniqueIdentifier;
  item: PortfolioItem;
  containerId: UniqueIdentifier;
  index: number;
  disabled?: boolean;
  handle?: boolean;
  className?: string;
  style?: React.CSSProperties;
  renderItem?: (item: PortfolioItem, props: SortableItemRenderProps) => React.ReactNode;
  onItemChange?: (itemId: UniqueIdentifier, newData: Partial<PortfolioItem>) => void;
  onItemDelete?: (itemId: UniqueIdentifier) => void;
}

/**
 * Props passed to custom item renderers
 */
export interface SortableItemRenderProps {
  isDragging: boolean;
  isSorting: boolean;
  isOverlay?: boolean;
  transform: string | undefined;
  transition: string | undefined;
  listeners: Record<string, unknown>;
  attributes: Record<string, unknown>;
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
}

/**
 * Hook to track mount status for fade-in animation
 */
function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);
    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}

/**
 * Sortable item component that can be dragged within and between sections
 */
export function SortableItem({
  id,
  item,
  containerId,
  index,
  disabled = false,
  handle = false,
  className = '',
  style,
  renderItem,
  onItemChange,
  onItemDelete
}: SortableItemProps) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    isDragging,
    isSorting,
    transform,
    transition,
    attributes,
  } = useSortable({
    id,
    data: {
      type: 'item',
      containerId,
      index,
      item
    },
    disabled
  });

  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;

  // Combine styles
  const combinedStyle: React.CSSProperties = {
    ...style,
    transition,
    transform: CSS.Translate.toString(transform),
    opacity: mountedWhileDragging ? 0 : undefined,
  };

  // Combine class names
  const combinedClassName = [
    'sortable-item',
    className,
    isDragging ? 'item-dragging' : '',
    isSorting ? 'item-sorting' : '',
    mountedWhileDragging ? 'item-fade-in' : ''
  ].filter(Boolean).join(' ');

  // Props to pass to custom renderer
  const renderProps: SortableItemRenderProps = {
    isDragging,
    isSorting,
    transform: CSS.Translate.toString(transform),
    transition: transition || undefined,
    listeners: handle ? {} : (listeners || {}),
    attributes: { ...attributes },
    setActivatorNodeRef: handle ? setActivatorNodeRef : undefined
  };

  // Default item renderer
  const defaultRenderer = (item: PortfolioItem) => {
    switch (item.type) {
      case 'text':
        return (
          <div className="item-text">
            <input
              type="text"
              value={item.text}
              onChange={(e) => onItemChange?.(id, { text: e.target.value })}
              onPointerDown={(e) => e.stopPropagation()} // Prevent drag on input
              placeholder="Enter text..."
            />
          </div>
        );
        
      case 'character':
        return (
          <div className="item-character">
            <input
              type="text"
              value={item.character}
              onChange={(e) => onItemChange?.(id, { character: e.target.value.slice(0, 1) })}
              onPointerDown={(e) => e.stopPropagation()} // Prevent drag on input
              maxLength={1}
              placeholder="?"
            />
          </div>
        );
        
      case 'doubleText':
        return (
          <div className="item-double-text">
            <input
              type="text"
              value={item.text1}
              onChange={(e) => onItemChange?.(id, { text1: e.target.value })}
              onPointerDown={(e) => e.stopPropagation()} // Prevent drag on input
              placeholder="Text 1..."
            />
            <input
              type="text"
              value={item.text2}
              onChange={(e) => onItemChange?.(id, { text2: e.target.value })}
              onPointerDown={(e) => e.stopPropagation()} // Prevent drag on input
              placeholder="Text 2..."
            />
          </div>
        );
        
      default:
        return <div>Unknown item type</div>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      className={combinedClassName}
      data-item-id={id}
      data-container-id={containerId}
    >
      {/* Drag handle if enabled */}
      {handle && (
        <div
          ref={setActivatorNodeRef}
          className="item-drag-handle"
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </div>
      )}

      {/* Item content */}
      <div className="item-content">
        {renderItem ? renderItem(item, renderProps) : defaultRenderer(item)}
      </div>

      {/* Item controls */}
      <div className="item-controls">
        {!handle && (
          <div
            className="item-drag-handle-inline"
            {...attributes}
            {...listeners}
          >
            ⋮⋮
          </div>
        )}
        <button
          type="button"
          className="item-delete-btn"
          onClick={() => onItemDelete?.(id)}
          onPointerDown={(e) => e.stopPropagation()} // Prevent drag
        >
          ×
        </button>
      </div>
    </div>
  );
}

/**
 * Item drag overlay component
 */
interface ItemDragOverlayProps {
  item: PortfolioItem;
  className?: string;
  style?: React.CSSProperties;
}

export function ItemDragOverlay({
  item,
  className = '',
  style
}: ItemDragOverlayProps) {
  const combinedClassName = [
    'item-drag-overlay',
    className
  ].filter(Boolean).join(' ');

  // Simplified renderer for overlay
  const renderOverlayContent = () => {
    switch (item.type) {
      case 'text':
        return <div className="overlay-text">{item.text || 'Text Item'}</div>;
      case 'character':
        return <div className="overlay-character">{item.character || '?'}</div>;
      case 'doubleText':
        return (
          <div className="overlay-double-text">
            <span>{item.text1 || 'Text 1'}</span>
            <span>{item.text2 || 'Text 2'}</span>
          </div>
        );
      default:
        return <div>Item</div>;
    }
  };

  return (
    <div
      className={combinedClassName}
      style={{
        ...style,
        opacity: 0.8,
        pointerEvents: 'none'
      }}
    >
      {renderOverlayContent()}
    </div>
  );
}
