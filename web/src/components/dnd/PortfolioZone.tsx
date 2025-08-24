import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Container } from './Container';
import { PortfolioItem } from './PortfolioItem';
import type { DroppableZoneProps } from './portfolioGridTypes';

export function PortfolioZone({ zone, items }: Omit<DroppableZoneProps, 'children'>) {
  const { setNodeRef, isOver } = useDroppable({
    id: zone.id,
    data: {
      type: 'zone',
      accepts: zone.allowed,
    },
  });

  return (
    <Container
      ref={setNodeRef}
      style={{
        minHeight: '300px',
        backgroundColor: isOver ? '#f0f9ff' : '#fafafa',
        borderColor: isOver ? zone.color : '#e5e7eb',
        borderWidth: '2px',
        borderStyle: isOver ? 'solid' : 'dashed',
      }}
      hover={isOver}
      label={`${zone.label} (${items.length}/${zone.maxItems})`}
      columns={zone.zoneType === 'cards-grid' ? 2 : 1}
    >
      <SortableContext 
        items={items} 
        strategy={zone.zoneType === 'cards-grid' ? rectSortingStrategy : verticalListSortingStrategy}
      >
        {items.map((value, index) => (
          <PortfolioItem
            key={value}
            id={value}
            index={index}
            zone={zone}
          />
        ))}
      </SortableContext>
    </Container>
  );
}
