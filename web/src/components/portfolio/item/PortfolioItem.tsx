import { useSortable, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
// Use section.color from the section config for item coloring
import type { EditorSortableItemProps as SortableItemProps } from '../dnd/EditorTypes';
import { Item } from './Item';

export function PortfolioItem({ id, item, index, section, onItemUpdate, onRemove }: SortableItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const {
    setNodeRef,
    listeners,
    isDragging,
    isSorting,
    transform,
    transition,
  } = useSortable({
    id,
    disabled: isEditing, // Disable dragging when editing
    animateLayoutChanges: (args) => defaultAnimateLayoutChanges({ ...args, wasDragging: true }),
  });
  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;

  const itemWidth = section.layoutType === 'grid' ? 150 : 300;

  // Common input style function
  const getInputStyle = (extraStyle = {}): React.CSSProperties => ({
    border: `1px solid ${isEditing ? '#3b82f6' : isHovering ? '#94a3b8' : '#e2e8f0'}`,
    borderRadius: '4px',
    background: isEditing ? '#fff' : isHovering ? '#f1f5f9' : '#f8fafc',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
    pointerEvents: 'auto' as const,
    transition: 'all 0.2s ease',
    boxShadow: isEditing ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
    cursor: 'text',
    ...extraStyle,
  });

  // Function to render editable content based on item type
  const renderItemContent = () => {
    switch (item.type) {
      case 'text':
        return (
          <input
            type="text"
            value={item.text}
            onChange={(e) => {
              onItemUpdate?.(id, { ...item, text: e.target.value });
            }}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            placeholder="Introduce texto..."
            style={getInputStyle({
              padding: '8px 12px',
              fontSize: 'inherit',
            })}
          />
        );
      case 'character':
        return (
          <input
            type="text"
            value={item.character}
            onChange={(e) => {
              onItemUpdate?.(id, { ...item, character: e.target.value });
            }}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            placeholder="🎯"
            maxLength={10}
            style={getInputStyle({
              padding: '8px 12px',
              textAlign: 'center',
              fontSize: '1.5em',
            })}
          />
        );
      case 'doubleText':
        return (
          <div 
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <input
              type="text"
              value={item.text1}
              onChange={(e) => {
                onItemUpdate?.(id, { ...item, text1: e.target.value });
              }}
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
              placeholder="Título principal..."
              style={getInputStyle({
                padding: '6px 10px',
                fontWeight: 'bold',
                fontSize: '0.9em',
              })}
            />
            <input
              type="text"
              value={item.text2}
                onChange={(e) => {
                onItemUpdate?.(id, { ...item, text2: e.target.value });
              }}
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
              placeholder="Subtítulo..."
              style={getInputStyle({
                padding: '6px 10px',
                fontSize: '0.8em',
                color: '#666',
              })}
            />
          </div>
        );
      default:
        return id;
    }
  };

  return (
    <Item
      ref={setNodeRef}
      value={renderItemContent()}
      dragging={isDragging}
      sorting={isSorting}
      handle={false}
      index={index}
      wrapperStyle={{
        width: itemWidth,
        height: 100,
      }}
      style={{}}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
  listeners={isEditing ? undefined : listeners} // Only pass listeners when not editing
  onRemove={onRemove ? () => onRemove(id) : undefined}
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
