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

import { PortfolioLayout } from '../layout/PortfolioLayout';
import { Item } from '../item/Item';
import { DEFAULT_SECTIONS as PORTFOLIO_SECTIONS } from '../../../types/sectionDto';
import { usePortfolioGrid, dropAnimation as exportedDropAnimation } from '../../../hooks/portfolio/usePortfolioGrid';
import type { PortfolioItem } from '../../../types/itemDto';

export function PortfolioEditor() {
  const {
    items,
    itemsData,
    sensors,
    collisionDetectionStrategy,
    onDragCancel,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    activeId,
    renderSortableItemDragOverlay,
  handleItemUpdate,
  addItemToSection,
  } = usePortfolioGrid();

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
      collisionDetection={collisionDetectionStrategy}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={onDragCancel}
    >
      <PortfolioLayout
        sections={PORTFOLIO_SECTIONS}
        itemMap={presentationalItems}
        itemDataMap={presentationalItemsData}
        onItemUpdate={(id, updated) => handleItemUpdate(id, updated as PortfolioItem)}
  onAddItem={(sectionId) => addItemToSection(sectionId)}
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
