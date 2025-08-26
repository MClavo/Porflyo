import { useSortable, defaultAnimateLayoutChanges } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
// Use section.color from the section config for item coloring
import type { EditorSortableItemProps as SortableItemProps } from '../dnd/EditorTypes';
import { Item } from './Item';
import ItemRenderer from '../render';
import type { PortfolioItem as PortfolioItemType } from '../../../types/itemDto';

export function PortfolioItem(props: SortableItemProps & { preview?: boolean; draggable?: boolean }) {
  const { id, item, index, onItemUpdate, onRemove, preview = false, draggable = true } = props;
  const [isEditing, setIsEditing] = useState(false);
  const {
    setNodeRef,
    listeners,
    isDragging,
    isSorting,
    transform,
    transition,
  } = useSortable({
    id,
    disabled: !draggable || isEditing, // Disable dragging when editing or when not draggable
    animateLayoutChanges: (args) => defaultAnimateLayoutChanges({ ...args, wasDragging: true }),
  });
  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;
  // We delegate rendering of the actual item UI to ItemRenderer so templates can vary.

  return (
    <Item
      ref={setNodeRef}
      value={
        <ItemRenderer
          id={String(id)}
          item={item as PortfolioItemType | undefined}
          // editable should depend only on preview (view mode), not on isEditing.
          // isEditing is used to disable dragging/listeners, but keeping editable=false
          // while isEditing=true caused the input to disappear on focus.
          editable={!preview}
          onItemUpdate={onItemUpdate}
          onStartEdit={() => setIsEditing(true)}
          onEndEdit={() => setIsEditing(false)}
        />
      }
      dragging={isDragging}
      sorting={isSorting}
      handle={false}
      index={index}
      wrapperStyle={{
        width: '100%',
        height: 100,
      }}
      style={{}}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
  listeners={isEditing || !draggable ? undefined : listeners} // Only pass listeners when not editing and draggable
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
