import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import type { DroppableZoneProps } from '../layout/LayoutTypes';
import { PortfolioItem } from '../item/PortfolioItem';
import { Container } from './Container';

export function PortfolioZone({ section, items, itemsData, onItemUpdate, onAddItem, onRemove }: Omit<DroppableZoneProps, 'children'> & { onAddItem?: (sectionId: string) => void; onRemove?: (id: string | number) => void }) {
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
            onRemove={onRemove}
          />
        ))}
      </SortableContext>
      {/* Footer add button: centered, does not interfere with the items list */}
      {!isFull && onAddItem ? (
        <div className="zone-add-button-wrapper" role="presentation">
          <button
            type="button"
            className="zone-add-button"
            onClick={() => onAddItem(section.id)}
            aria-label={`Add item to ${section.title}`}
          >
            +
          </button>
        </div>
      ) : null}
    </Container>
  );
}
