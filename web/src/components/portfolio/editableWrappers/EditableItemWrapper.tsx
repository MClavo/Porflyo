import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import type { EditorSortableItemProps } from '../dnd/EditorTypes';
import { Remove } from '../item/Remove';

type Props = EditorSortableItemProps & {
  children: React.ReactNode; // TemplateItem render output
  editorMode?: boolean;
};

export const EditableItemWrapper: React.FC<Props> = ({ id, children, editorMode = false, onRemove }) => {
  // Call hook unconditionally to satisfy rules of hooks
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  if (!editorMode) {
    return <>{children}</>;
  }

  return (
    <div ref={setNodeRef as React.Ref<HTMLDivElement>} style={{ transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined, transition }} data-dnd-item-id={String(id)}>
      {/* inject listeners/attributes on a wrapper so the template's internal markup remains untouched */}
      <div {...attributes} {...listeners}>
        {children}
      </div>
      {onRemove ? (
        <div className="editable-remove">
          <Remove onClick={() => onRemove(id)} />
        </div>
      ) : null}
    </div>
  );
};

export default EditableItemWrapper;
