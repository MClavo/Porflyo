/**
 * PortfolioEditor (DnD wrapper)
 *
 * This component provides the drag-and-drop editing capabilities. It is a
 * thin wrapper that configures @dnd-kit (sensors, collision detection,
 * measuring, and overlay) and then renders the presentational
 * `PortfolioLayout` component.
 *
 * Key ideas:
 * - Presentation (layout) is handled by `PortfolioLayout`.
 * - Editing behavior (drag, drop, reordering) is applied by wrapping the
 *   layout with DnD context and using droppable/sortable wrappers where
 *   necessary (inside Zone/Item components or via dedicated wrappers).
 */
import { DndContext, DragOverlay, MeasuringStrategy } from '@dnd-kit/core';
import { createPortal } from 'react-dom';

import { dropAnimation as exportedDropAnimation, usePortfolioGrid } from '../../../hooks/portfolio/usePortfolioGrid';
import { getTemplate } from '../../../templates/registry';
import type { PortfolioItem } from '../../../types/itemDto';
import { Item } from '../item/Item';
import { PortfolioLayout } from '../layout/PortfolioLayout';
import { PortfolioZone } from '../section/PortfolioZone';

export function PortfolioEditor({ templateId = 'template-example' }: { templateId?: string } = {}) {
  // Load template and merge sections (no savedSections for now)
  const template = getTemplate(templateId);
  const tpl = template ? template : getTemplate('dark');

  const sections = tpl.sections;


  const {
    items,
    itemsData,
    sensors,
    onDragCancel,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    activeId,
    renderSortableItemDragOverlay,
  handleItemUpdate,
  sectionDropStates,
  addItemToSection,
  removeItem,
  } = usePortfolioGrid(sections);

  // Convert UniqueIdentifier -> string for the presentational component.
  const presentationalItems = Object.keys(items).reduce((acc, sectionId) => {
    acc[sectionId] = (items[sectionId] || []).map((id) => String(id));
    return acc;
  }, {} as Record<string, string[]>);

  const presentationalItemsData = Object.keys(itemsData).reduce((acc, id) => {
    acc[String(id)] = itemsData[id];
    return acc;
  }, {} as Record<string, PortfolioItem>);

  return (
    <DndContext
      sensors={sensors}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={onDragCancel}
    >
      {/* Render the template site (if available) as the `siteComponent` and
          always use PortfolioLayout to control how sections are injected so
          the editor can portal editable zones into template placeholders. */}
      <PortfolioLayout
        sections={sections}
        itemMap={presentationalItems}
        itemDataMap={presentationalItemsData}
        siteComponent={tpl ? <tpl.Layout sections={sections} itemMap={{}} itemDataMap={{}} themeClass={tpl.ThemeClass} /> : undefined}
        onItemUpdate={(id, updated) => handleItemUpdate(id, updated as PortfolioItem)}
        onAddItem={(sectionId, itemType) => addItemToSection(sectionId, itemType)}
        onRemove={(id) => removeItem(id as import('@dnd-kit/core').UniqueIdentifier)}
        renderSection={(section) => (
          <PortfolioZone
            section={section}
            items={((items[section.id] || []) as Array<import('@dnd-kit/core').UniqueIdentifier>).map((id) => String(id))}
            itemsData={itemsData}
            onItemUpdate={(id, updated) => handleItemUpdate(id as import('@dnd-kit/core').UniqueIdentifier, updated as PortfolioItem)}
            onAddItem={(secId, type) => addItemToSection(secId, type)}
            onRemove={(id) => removeItem(id as import('@dnd-kit/core').UniqueIdentifier)}
            dropState={sectionDropStates ? sectionDropStates[section.id] : 'none'}
          />
        )}
      />

      {createPortal(
        <DragOverlay adjustScale={false} dropAnimation={exportedDropAnimation}>
          {activeId ? renderSortableItemDragOverlay(activeId, Item) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}

export default PortfolioEditor;
