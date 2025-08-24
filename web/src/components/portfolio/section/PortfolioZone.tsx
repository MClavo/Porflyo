import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import type { DroppableZoneProps } from '../layout/LayoutTypes';
import { PortfolioItem } from '../item/PortfolioItem';
import { Container } from './Container';

export function PortfolioZone({ section, items, itemsData, onItemUpdate, onAddItem }: Omit<DroppableZoneProps, 'children'> & { onAddItem?: (sectionId: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: section.id,
    data: {
      type: 'section',
      accepts: section.allowedItemTypes,
    },
  });

  const isFull = items.length >= section.maxItems;
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
            ? '#3b82f6' 
            : '#e5e7eb',
        borderWidth: '2px',
        borderStyle: (isValidDrop || isInvalidDrop) ? 'solid' : 'dashed',
      }}
      hover={isOver}
      label={`${section.title} (${items.length}/${section.maxItems})${isFull ? ' - LLENO' : ''}`}
      columns={section.layoutType === 'grid' ? 2 : 1}
      horizontal={section.layoutType === 'row'}
    >
      {/* Add button: only show when section is not full */}
      {!isFull && onAddItem ? (
        <div style={{ marginBottom: '8px' }}>
          <button
            type="button"
            onClick={() => onAddItem(section.id)}
            aria-label={`Add item to ${section.title}`}
            style={{ padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}
          >
            Add {section.allowedItemTypes[0] ?? 'item'}
          </button>
        </div>
      ) : null}
      <SortableContext 
        items={items} 
        strategy={
          section.layoutType === 'grid'
            ? rectSortingStrategy
            : section.layoutType === 'row'
              ? horizontalListSortingStrategy
              : verticalListSortingStrategy
        }
      >
        {items.map((itemId, index) => (
          <PortfolioItem
            key={itemId}
            id={itemId}
            item={itemsData[itemId]}
            index={index}
            section={section}
            onItemUpdate={onItemUpdate}
          />
        ))}
      </SortableContext>
    </Container>
  );
}
