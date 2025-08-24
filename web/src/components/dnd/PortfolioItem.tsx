import { useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { Item } from './Item';
import { getItemColor } from './portfolioGridData';
import type { SortableItemProps } from './portfolioGridTypes';

export function PortfolioItem({ id, index, zone }: SortableItemProps) {
  const {
    setNodeRef,
    listeners,
    isDragging,
    isSorting,
    transform,
    transition,
  } = useSortable({
    id,
  });
  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;

  const itemWidth = zone.zoneType === 'cards-grid' ? 150 : 300;

  return (
    <Item
      ref={setNodeRef}
      value={id}
      dragging={isDragging}
      sorting={isSorting}
      handle={false}
      index={index}
      wrapperStyle={{
        width: itemWidth,
        height: 100,
      }}
      style={{}}
      color={getItemColor(id)}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
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
