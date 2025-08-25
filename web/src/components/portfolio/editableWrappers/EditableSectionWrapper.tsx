import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, rectSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import type { EditorDroppableZoneProps } from '../dnd/EditorTypes';
import EditableItemWrapper from './EditableItemWrapper';

type Props = EditorDroppableZoneProps & {
  editorMode?: boolean;
  renderItem: (id: import('@dnd-kit/core').UniqueIdentifier) => React.ReactNode;
};

export const EditableSectionWrapper: React.FC<Props> = ({ section, items, itemsData, editorMode = false, renderItem, onRemove }) => {
  const { setNodeRef } = useDroppable({ id: section.id, data: { type: 'section' } });

  if (!editorMode) {
    // non-editor mode: just render the template's items
    return <>{items.map(id => renderItem(id))}</>;
  }

  const strategy = section.layoutType === 'grid' ? rectSortingStrategy : section.layoutType === 'row' ? horizontalListSortingStrategy : verticalListSortingStrategy;

  return (
    <div ref={setNodeRef as React.Ref<HTMLDivElement>} className={`editable-section section-${section.id}`}>
      <SortableContext items={items} strategy={strategy}>
        {items.map((id) => (
          <EditableItemWrapper key={String(id)} id={id} item={itemsData[id]} index={items.indexOf(id)} section={section} onRemove={onRemove} editorMode>
            {renderItem(id)}
          </EditableItemWrapper>
        ))}
      </SortableContext>
    </div>
  );
};

export default EditableSectionWrapper;
