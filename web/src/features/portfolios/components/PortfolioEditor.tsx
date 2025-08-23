import React, { useState } from 'react';
import '../../../styles/portfolio/portfolioEditor.css';
import type { SectionConfig, ItemType } from '../types/itemDto';
import type { DropResult } from '../types/dragDto';
import { PortfolioEditorState } from './PortfolioEditorState';
import { PortfolioSectionRenderer, type SectionRendererCallbacks } from './PortfolioSectionRenderer';
import { ItemTypeDialog } from './ItemTypeDialog';
import { 
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
    MouseSensor,
    TouchSensor,
} from '@dnd-kit/core';
import { 
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

interface TypeDialogState {
    isOpen: boolean;
    sectionId: string;
    position: { x: number; y: number };
    allowedTypes: ItemType[];
}

// Main Portfolio Editor Component - orchestrates all the editor functionality
const PortfolioEditor: React.FC = () => {
    const [sections, setSections] = useState<SectionConfig[]>(
        PortfolioEditorState.getInitialSections()
    );
    const [typeDialog, setTypeDialog] = useState<TypeDialogState>({
        isOpen: false,
        sectionId: '',
        position: { x: 0, y: 0 },
        allowedTypes: []
    });

    // DnD sensors for handling different input methods with optimized settings
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 0, // Start dragging immediately
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 0, // No delay for touch
                tolerance: 0,
            },
        }),
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 0, // Start dragging immediately
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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
        const overId = String(over.id);

        // Parse the drag ID to get source information
        const dragData = PortfolioEditorState.parseDragId(dragId);
        if (!dragData) return;

        const { sectionId: sourceSectionId, itemId } = dragData;

        // Check if we're dropping on a drop zone
        if (overId.includes('-drop-')) {
            const dropZoneData = overId.split('-drop-');
            const targetSectionId = dropZoneData[0];
            const targetIndex = parseInt(dropZoneData[1]);

            if (!isNaN(targetIndex)) {
                // Find the item being moved
                const sourceSection = sections.find(s => s.id === sourceSectionId);
                const item = sourceSection?.items.find(i => i.id === itemId);
                
                if (item && sourceSection) {
                    const sourceIndex = sourceSection.items.findIndex(i => i.id === itemId);
                    
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
                }
            }
        }
    };

    const renderLogic = (): React.ReactNode => {
        return (
            <div className="portfolio-editor-container">
                {sections.map(section => 
                    PortfolioSectionRenderer.renderSection(section, callbacks)
                )}
            </div>
        );
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <section className="portfolio-editor">
                {renderLogic()}
                
                <ItemTypeDialog
                    isOpen={typeDialog.isOpen}
                    allowedTypes={typeDialog.allowedTypes}
                    onSelectType={handleTypeSelection}
                    onClose={closeTypeDialog}
                    position={typeDialog.position}
                />
            </section>
        </DndContext>
    );
};

export default PortfolioEditor;
