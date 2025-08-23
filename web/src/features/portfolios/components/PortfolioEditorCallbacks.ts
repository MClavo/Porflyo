import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import type { SectionConfig, ItemType } from '../types/itemDto';
import type { DropResult, DropTargetData } from '../types/dragDto';
import type { TypeDialogState } from './PortfolioEditorTypes';
import type { SectionRendererCallbacks } from './PortfolioSectionRenderer';
import { PortfolioEditorState } from './PortfolioEditorState';

interface UsePortfolioCallbacksProps {
    sections: SectionConfig[];
    setSections: React.Dispatch<React.SetStateAction<SectionConfig[]>>;
    typeDialog: TypeDialogState;
    setTypeDialog: React.Dispatch<React.SetStateAction<TypeDialogState>>;
}

export const usePortfolioCallbacks = ({
    sections,
    setSections,
    typeDialog,
    setTypeDialog
}: UsePortfolioCallbacksProps) => {
    
    // Callback handlers that delegate to the state management class
    const callbacks: SectionRendererCallbacks = {
        addItem: (sectionId: string, itemType: ItemType) => {
            setSections(prevSections => 
                PortfolioEditorState.addItem(prevSections, sectionId, itemType)
            );
        },

        removeItem: (sectionId: string, itemId: number) => {
            setSections(prevSections => 
                PortfolioEditorState.removeItem(prevSections, sectionId, itemId)
            );
        },

        updateTextItem: (sectionId: string, itemId: number, newText: string) => {
            setSections(prevSections => 
                PortfolioEditorState.updateTextItem(prevSections, sectionId, itemId, newText)
            );
        },

        updateDoubleTextItem: (sectionId: string, itemId: number, field: 'text1' | 'text2', newText: string) => {
            setSections(prevSections => 
                PortfolioEditorState.updateDoubleTextItem(prevSections, sectionId, itemId, field, newText)
            );
        },

        openTypeDialog: (sectionId: string, position: { x: number; y: number }) => {
            const section = sections.find(s => s.id === sectionId);
            if (section && section.allowedItemTypes.length > 1) {
                setTypeDialog({
                    isOpen: true,
                    sectionId,
                    position,
                    allowedTypes: section.allowedItemTypes
                });
            }
        }
    };

    const closeTypeDialog = () => {
        setTypeDialog(prev => ({
            ...prev,
            isOpen: false
        }));
    };

    const handleTypeSelection = (itemType: ItemType) => {
        const { sectionId } = typeDialog;
        callbacks.addItem(sectionId, itemType);
        closeTypeDialog();
    };

    // DnD handlers
    const handleDragStart = (event: DragStartEvent) => {
        // Could be used for visual feedback during drag
        console.log('Drag started:', event.active.id);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const dragId = String(active.id);

        // Parse the drag ID to get source information
        const dragData = PortfolioEditorState.parseDragId(dragId);
        if (!dragData) return;

        const { sectionId: sourceSectionId, itemId } = dragData;
        
        // Get the drop target data
        const dropTargetData = over.data.current as DropTargetData;
        if (!dropTargetData) return;

        const { type: dropType, sectionId: targetSectionId } = dropTargetData;

        // Find the item being moved and source section
        const sourceSection = sections.find(s => s.id === sourceSectionId);
        const targetSection = sections.find(s => s.id === targetSectionId);
        const item = sourceSection?.items.find(i => i.id === itemId);
        
        if (!item || !sourceSection || !targetSection) return;

        const sourceIndex = sourceSection.items.findIndex(i => i.id === itemId);

        // Handle different drop types
        let targetIndex: number;

        if (dropType === 'item') {
            // Dropping on top of another item
            const targetItemId = dropTargetData.itemId!;
            targetIndex = targetSection.items.findIndex(i => i.id === targetItemId);
            
            // If dropping on the same section and same item, do nothing
            if (sourceSectionId === targetSectionId && sourceIndex === targetIndex) {
                return;
            }
        } else if (dropType === 'section') {
            // Dropping on section (not on an item) - check compatibility and space
            if (sourceSectionId === targetSectionId) {
                // Same section - do nothing if dropped on empty area
                return;
            }
            
            // Different section - check if item type is allowed
            if (!targetSection.allowedItemTypes.includes(item.type)) {
                return;
            }
            
            // Check if target section has space
            if (targetSection.items.length >= targetSection.maxItems) {
                return;
            }
            
            // Add to end of target section
            targetIndex = targetSection.items.length;
        } else if (dropType === 'drop-zone') {
            // Dropping on a specific drop zone
            targetIndex = dropTargetData.index!;
            
            // If dropping on the same section and adjacent positions, do nothing
            if (sourceSectionId === targetSectionId) {
                if (targetIndex === sourceIndex || targetIndex === sourceIndex + 1) {
                    return;
                }
            } else {
                // Different section - check compatibility and space
                if (!targetSection.allowedItemTypes.includes(item.type)) {
                    return;
                }
                
                if (targetSection.items.length >= targetSection.maxItems) {
                    return;
                }
            }
        } else {
            return;
        }

        // Create drop result and execute the move
        const dropResult: DropResult = {
            sourceSectionId,
            targetSectionId,
            sourceIndex,
            targetIndex,
            itemId,
            itemType: item.type
        };

        setSections(prevSections => 
            PortfolioEditorState.moveItem(prevSections, dropResult)
        );
    };

    return {
        callbacks,
        closeTypeDialog,
        handleTypeSelection,
        handleDragStart,
        handleDragEnd
    };
};
