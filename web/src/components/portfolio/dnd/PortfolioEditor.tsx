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
import { useEffect } from 'react';

import { dropAnimation as exportedDropAnimation, usePortfolioGrid } from '../../../hooks/portfolio/index';
import { getTemplate } from '../../../templates/registry';
import type { PortfolioItem } from '../../../types/itemDto';
import type { PortfolioSection } from '../../../types/sectionDto';
import { SaveItemDialog } from '../dialogs/SaveItemDialog';
import { DeleteConfirmDialog } from '../dialogs/DeleteConfirmDialog';
import { Item } from '../item/Item';
import { PortfolioLayout } from '../layout/PortfolioLayout';
import { PortfolioZone } from '../section/PortfolioZone';

export function PortfolioEditor({ 
  templateId = 'template-example',
  portfolioId,
  onSectionUpdate,
  onGetCurrentData,
  initialSections,
  initialItems,
  initialItemsData
}: { 
  templateId?: string;
  portfolioId?: string;
  onSectionUpdate?: (sections: PortfolioSection[]) => void;
  onGetCurrentData?: (getCurrentData: () => { sections: PortfolioSection[], items: Record<string, string[]>, itemsData: Record<string, PortfolioItem> }) => void;
  initialSections?: PortfolioSection[];
  initialItems?: Record<string, string[]>;
  initialItemsData?: Record<string, PortfolioItem>;
} = {}) {
  // Load template and merge sections (no savedSections for now)
  const template = getTemplate(templateId);
  const tpl = template ? template : getTemplate('dark');

  // Append a saved-items section to the template sections if not present.
  const templateSections = tpl.sections.some((s) => s.id === 'saved-items')
    ? tpl.sections
    : ([
        ...tpl.sections,
        ({
          id: 'saved-items',
          type: 'savedItems' as const,
          title: 'Saved',
          columns: 1,
          rows: 10,
          // ensure a mutable array type matches PortfolioSection.allowedItemTypes
          allowedItemTypes: ['text', 'doubleText', 'character'] as import('../../../types/itemDto').ItemType[],
          items: [],
        } as PortfolioSection),
      ] as PortfolioSection[]);


  // Merge initial sections with template sections if provided
  const finalSections = initialSections && initialSections.length > 0 
    ? [...initialSections, ...(templateSections.filter(ts => ts.id === 'saved-items'))] // Add only the saved-items section from template
    : templateSections;

  // console.log('PortfolioEditor - Initial data:', { initialSections, initialItems, initialItemsData });
  // console.log('PortfolioEditor - Template sections:', templateSections);
  // console.log('PortfolioEditor - Final sections:', finalSections);

  const {
    sections,
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
    showSaveDialog,
    pendingSaveItem,
    handleSaveItem,
    handleCancelSave,
    isUploading,
    uploadProgress,
    showDeleteDialog,
    pendingDeleteItem,
    handleConfirmDelete,
    handleCancelDelete,
    onSectionTitleUpdate,
  } = usePortfolioGrid(finalSections, {
    portfolioId,
    onSectionUpdate,
    initialItems,
    initialItemsData,
    initialSections,
  });

  // Expose current data getter to parent component
  useEffect(() => {
    if (onGetCurrentData) {
      const getCurrentData = () => {
        // Convert UniqueIdentifier to string for consistency
        const stringItems = Object.keys(items).reduce((acc, sectionId) => {
          acc[sectionId] = (items[sectionId] || []).map((id) => String(id));
          return acc;
        }, {} as Record<string, string[]>);

        const stringItemsData = Object.keys(itemsData).reduce((acc, id) => {
          acc[String(id)] = itemsData[id];
          return acc;
        }, {} as Record<string, PortfolioItem>);

        return {
          sections,
          items: stringItems,
          itemsData: stringItemsData
        };
      };
      
      onGetCurrentData(getCurrentData);
    }
  }, [sections, items, itemsData, onGetCurrentData]);

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
        templateId={templateId}
        siteComponent={tpl ? <tpl.Layout sections={sections} itemMap={{}} itemDataMap={{}} themeClass={tpl.ThemeClass} onSectionTitleUpdate={onSectionTitleUpdate} /> : undefined}
        onItemUpdate={(id, updated) => handleItemUpdate(id, updated as PortfolioItem)}
        onAddItem={(sectionId, itemType) => addItemToSection(sectionId, itemType)}
        onRemove={(id) => removeItem(id as import('@dnd-kit/core').UniqueIdentifier)}
        onSectionTitleUpdate={onSectionTitleUpdate}
        renderSection={(section) => (
          <PortfolioZone
            section={section}
            items={((items[section.id] || []) as Array<import('@dnd-kit/core').UniqueIdentifier>).map((id) => String(id))}
            itemsData={itemsData}
            templateId={templateId}
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

      <SaveItemDialog
        isOpen={showSaveDialog}
        onSave={handleSaveItem}
        onCancel={handleCancelSave}
        itemPreview={pendingSaveItem ? getItemPreview(pendingSaveItem.item) : undefined}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        itemName={pendingDeleteItem?.item.type === 'savedItem' ? pendingDeleteItem.item.savedName : undefined}
        itemPreview={pendingDeleteItem ? getItemPreview(pendingDeleteItem.item) : undefined}
      />
    </DndContext>
  );
}

function getItemPreview(item: PortfolioItem): string {
  switch (item.type) {
    case 'text':
      return item.text || 'Texto';
    case 'character':
      return item.character || 'Carácter';
    case 'doubleText':
      return `${item.text1 || 'Título'} / ${item.text2 || 'Subtítulo'}`;
    case 'savedItem':
      return item.savedName || 'Item guardado';
    default:
      return 'Item';
  }
}

export default PortfolioEditor;
