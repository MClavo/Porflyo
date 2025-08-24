import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Container } from './Container';
import { PortfolioItem } from './PortfolioItem';
import type { DroppableZoneProps } from './portfolioGridTypes';

export function PortfolioZone({ zone, items, itemsData, onItemUpdate }: Omit<DroppableZoneProps, 'children'>) {
  const { setNodeRef, isOver } = useDroppable({
    id: zone.id,
    data: {
      type: 'zone',
      accepts: zone.allowed,
    },
  });

  const isFull = items.length >= zone.maxItems;
  const isValidDrop = isOver && !isFull;
  const isInvalidDrop = isOver && isFull;

  return (
    <Container
      ref={setNodeRef}
      style={{
        minHeight: '300px',
        backgroundColor: isInvalidDrop 
          ? '#fef2f2' 
          : isValidDrop 
            ? '#f0f9ff' 
            : '#fafafa',
        borderColor: isInvalidDrop 
          ? '#ef4444' 
          : isValidDrop 
            ? zone.color 
            : isFull 
              ? '#f59e0b' 
              : '#e5e7eb',
        borderWidth: '2px',
        borderStyle: (isValidDrop || isInvalidDrop) ? 'solid' : 'dashed',
      }}
      hover={isOver}
      label={`${zone.label} (${items.length}/${zone.maxItems})${isFull ? ' - LLENO' : ''}`}
      columns={zone.zoneType === 'cards-grid' ? 2 : 1}
    >
      <SortableContext 
        items={items} 
        strategy={zone.zoneType === 'cards-grid' ? rectSortingStrategy : verticalListSortingStrategy}
      >
        {items.map((itemId, index) => (
          <PortfolioItem
            key={itemId}
            id={itemId}
            item={itemsData[itemId]}
            index={index}
            zone={zone}
            onItemUpdate={onItemUpdate}
          />
        ))}
      </SortableContext>
    </Container>
  );
}
