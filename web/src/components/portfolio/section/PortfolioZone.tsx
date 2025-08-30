import { useDroppable } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { useEffect, useRef, useState } from 'react';
import { PortfolioItem } from '../item/PortfolioItem';
import AddItemPopup from '../layout/AddItemPopup';
import type { DroppableZoneProps } from '../layout/LayoutTypes';
import { Container } from './Container';
import { getMaxItems } from '../../../types/sectionDto';

export function PortfolioZone({ section, items, itemsData, templateId, onItemUpdate, onAddItem, onRemove, dropState, readOnly }: Omit<DroppableZoneProps, 'children'> & { onAddItem?: (sectionId: string, itemType?: import('../../../types/itemDto').ItemType) => void; onRemove?: (id: string | number) => void; dropState?: 'allowed' | 'forbidden' | 'none'; readOnly?: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    // remove any previous classes
    parent.classList.remove('drop-allowed', 'drop-forbidden');

    if (dropState && dropState !== 'none') {
      parent.classList.add(`drop-${dropState}`);
    }

    return () => {
      parent.classList.remove('drop-allowed', 'drop-forbidden');
    };
  }, [dropState]);

  return (
    <Container
      ref={(el) => {
        setNodeRef(el as HTMLElement | null);
        containerRef.current = el as HTMLDivElement | null;
      }}
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
            templateId={templateId}
            onItemUpdate={onItemUpdate}
            onRemove={onRemove}
            preview={readOnly}
            draggable={!readOnly}
          />
        ))}
      </SortableContext>
      {/* Footer add button: centered, does not interfere with the items list */}
  {!isFull && onAddItem && !readOnly ? (
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
