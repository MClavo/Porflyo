import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, rectSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import type { EditorDroppableZoneProps } from '../dnd/EditorTypes';
import EditableItemWrapper from './EditableItemWrapper';
import AddItemPopup from '../layout/AddItemPopup';

type Props = EditorDroppableZoneProps & {
  editorMode?: boolean;
  renderItem: (id: import('@dnd-kit/core').UniqueIdentifier) => React.ReactNode;
};

export const EditableSectionWrapper: React.FC<Props> = ({ section, items, itemsData, editorMode = false, renderItem, onRemove, onAddItem }) => {
  const { setNodeRef } = useDroppable({ id: section.id, data: { type: 'section' } });
  const [popupOpen, setPopupOpen] = useState(false);

  if (!editorMode) {
    // non-editor mode: just render the template's items
    return <>{items.map(id => renderItem(id))}</>;
  }

  const strategy = section.layoutType === 'grid' ? rectSortingStrategy : section.layoutType === 'row' ? horizontalListSortingStrategy : verticalListSortingStrategy;
  const isFull = items.length >= (section.maxItems ?? Infinity);

  return (
    <div className={`editable-section section-${section.id}`}>
      {/* tpl-section-items is where templates expect items to live; attach droppable to it */}
      <div ref={setNodeRef as React.Ref<HTMLDivElement>} className="tpl-section-items editable-tpl-items">
        <SortableContext items={items} strategy={strategy}>
          {items.map((id) => (
            <EditableItemWrapper key={String(id)} id={id} item={itemsData[id]} index={items.indexOf(id)} section={section} onRemove={onRemove} editorMode>
              {renderItem(id)}
            </EditableItemWrapper>
          ))}
        </SortableContext>
      </div>

      {/* Add button area (editor only) - positioned relative to the section so it's fixed at bottom-center */}
      {!isFull && onAddItem ? (
        <div className="editable-section-add">
          <button
            type="button"
            className="zone-add-button"
            onClick={() => {
              if ((section.allowedItemTypes || []).length <= 1) {
                onAddItem(section.id, section.allowedItemTypes?.[0]);
              } else {
                setPopupOpen(v => !v);
              }
            }}
          >
            +
          </button>
          {popupOpen && (section.allowedItemTypes || []).length > 1 && (
            <div className="editable-section-popup-wrapper">
              <AddItemPopup
                sectionId={section.id}
                allowedItemTypes={section.allowedItemTypes || []}
                onSelect={(secId, type) => {
                  if (onAddItem) onAddItem(secId, type);
                  setPopupOpen(false);
                }}
                onClose={() => setPopupOpen(false)}
              />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default EditableSectionWrapper;
