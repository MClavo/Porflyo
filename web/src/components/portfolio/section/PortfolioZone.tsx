import { useDroppable } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { useState } from 'react';
import { PortfolioItem } from '../item/PortfolioItem';
import AddItemPopup from '../layout/AddItemPopup';
import type { DroppableZoneProps } from '../layout/LayoutTypes';
import { Container } from './Container';
import { getMaxItems } from '../../../types/sectionDto';

export function PortfolioZone({ section, items, itemsData, onItemUpdate, onAddItem, onRemove }: Omit<DroppableZoneProps, 'children'> & { onAddItem?: (sectionId: string, itemType?: import('../../../types/itemDto').ItemType) => void; onRemove?: (id: string | number) => void }) {
  const { setNodeRef, /* isOver */ } = useDroppable({
    id: section.id,
    data: {
      type: 'section',
      accepts: section.allowedItemTypes,
    },
  });

  // Determine if the section is full
  const isFull = items.length >= getMaxItems(section);
  //const isValidDrop = isOver && !isFull;
  //const isInvalidDrop = isOver && isFull;

  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <Container
      ref={setNodeRef}
      /* style={{
        minHeight: '300px',
        backgroundColor: isInvalidDrop 
          ? '#00ff44' 
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
      }} */
      //hover={isOver}
      //label={`${section.title} (${items.length}/${section.maxItems})${isFull ? ' - LLENO' : ''}`}
      /* columns={section.layoutType === 'grid' ? 2 : 1}
      horizontal={section.layoutType === 'row'} */
      columns={section.columns}
      
    >
      <SortableContext 
        items={items} 
        /* strategy={
          section.layoutType === 'grid'
            ? rectSortingStrategy
            : section.layoutType === 'row'
              ? horizontalListSortingStrategy
              : verticalListSortingStrategy
        } */
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
          <div className="zone-add-button-inner">
            <button
              type="button"
              className="zone-add-button"
              onClick={() => {
                if (section.allowedItemTypes.length <= 1) {
                  onAddItem(section.id, section.allowedItemTypes[0]);
                } else {
                  setPopupOpen(v => !v);
                }
              }}
              aria-label={`Add item to ${section.title}`}
            >
              +
            </button>
            {popupOpen && section.allowedItemTypes.length > 1 && (
              <AddItemPopup
                sectionId={section.id}
                allowedItemTypes={section.allowedItemTypes}
                onSelect={(secId, type) => {
                  if (onAddItem) onAddItem(secId, type);
                  setPopupOpen(false);
                }}
                onClose={() => setPopupOpen(false)}
              />
            )}
          </div>
        </div>
      ) : null}
    </Container>
  );
}
