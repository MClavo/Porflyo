import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import type { SectionConfig, ItemType } from '../types/itemDto';
import type { DropResult, DropTargetData } from '../types/dragDto';
import type { TypeDialogState } from './PortfolioEditorTypes';
import type { SectionRendererCallbacks } from './PortfolioSectionRenderer';
import { PortfolioEditorState } from './PortfolioEditorState';
import { arrayMove } from '@dnd-kit/sortable';

interface UsePortfolioCallbacksProps {
    sections: SectionConfig[];
    setSections: React.Dispatch<React.SetStateAction<SectionConfig[]>>;
    activeId: string | null;
    setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
    previewSections: SectionConfig[];
    setPreviewSections: React.Dispatch<React.SetStateAction<SectionConfig[]>>;
    typeDialog: TypeDialogState;
    setTypeDialog: React.Dispatch<React.SetStateAction<TypeDialogState>>;
}

export const usePortfolioCallbacks = ({
    sections,
    setSections,
    activeId,
    setActiveId,
    previewSections,
    setPreviewSections,
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
        setActiveId(String(event.active.id));
        // Inicializar preview con el estado actual (sin cambiar IDs)
        setPreviewSections([...sections]);
        console.log('Drag started:', event.active.id);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        
        if (!over || !activeId) return;

        const dragId = String(active.id);
        const dragData = PortfolioEditorState.parseDragId(dragId);
        if (!dragData) return;

        const { sectionId: sourceSectionId, itemId } = dragData;
        const dropTargetData = over.data.current as DropTargetData;
        if (!dropTargetData) return;

        const { type: dropType, sectionId: targetSectionId } = dropTargetData;

        // Solo actualizar si es un drop válido
        const sourceSection = previewSections.find(s => s.id === sourceSectionId);
        const targetSection = previewSections.find(s => s.id === targetSectionId);
        const item = sourceSection?.items.find(i => i.id === itemId);
        
        if (!item || !sourceSection || !targetSection) return;

        // Verificar compatibilidad de tipos
        if (sourceSectionId !== targetSectionId && !targetSection.allowedItemTypes.includes(item.type)) {
            return;
        }

        const sourceIndex = sourceSection.items.findIndex(i => i.id === itemId);
        let targetIndex: number;

        if (dropType === 'item') {
            const targetItemId = dropTargetData.itemId!;
            targetIndex = targetSection.items.findIndex(i => i.id === targetItemId);
        } else if (dropType === 'section') {
            if (sourceSectionId === targetSectionId) return;
            targetIndex = targetSection.items.length;
        } else {
            return;
        }

        // Actualizar las posiciones de preview SIN cambiar IDs originales
        setPreviewSections(prevSections => {
            const newSections = [...prevSections];
            
            if (sourceSectionId === targetSectionId) {
                // Mismo sección - reordenar con arrayMove (preserva IDs)
                const sectionIndex = newSections.findIndex(s => s.id === sourceSectionId);
                if (sectionIndex !== -1) {
                    const newItems = arrayMove(newSections[sectionIndex].items, sourceIndex, targetIndex);
                    newSections[sectionIndex] = { ...newSections[sectionIndex], items: newItems };
                }
            } else {
                // Diferente sección - mover entre secciones MANTENIENDO la ID original durante preview
                const sourceSectionIndex = newSections.findIndex(s => s.id === sourceSectionId);
                const targetSectionIndex = newSections.findIndex(s => s.id === targetSectionId);
                
                if (sourceSectionIndex !== -1 && targetSectionIndex !== -1) {
                    // Verificar límites de espacio
                    if (newSections[targetSectionIndex].items.length >= newSections[targetSectionIndex].maxItems) {
                        return prevSections; // No cambiar si no hay espacio
                    }
                    
                    // Remover del origen
                    const newSourceItems = [...newSections[sourceSectionIndex].items];
                    const [movedItem] = newSourceItems.splice(sourceIndex, 1);
                    
                    // Agregar al destino CON LA MISMA ID (solo para preview visual)
                    const newTargetItems = [...newSections[targetSectionIndex].items];
                    newTargetItems.splice(targetIndex, 0, movedItem);
                    
                    newSections[sourceSectionIndex] = { ...newSections[sourceSectionIndex], items: newSourceItems };
                    newSections[targetSectionIndex] = { ...newSections[targetSectionIndex], items: newTargetItems };
                }
            }
            
            return newSections;
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || !activeId) {
            // Resetear si no hay drop válido
            setActiveId(null);
            setPreviewSections([...sections]);
            return;
        }

        const dragId = String(active.id);
        const dragData = PortfolioEditorState.parseDragId(dragId);
        if (!dragData) {
            setActiveId(null);
            setPreviewSections([...sections]);
            return;
        }

        const { sectionId: sourceSectionId, itemId } = dragData;
        const dropTargetData = over.data.current as DropTargetData;
        if (!dropTargetData) {
            setActiveId(null);
            setPreviewSections([...sections]);
            return;
        }

        const { type: dropType, sectionId: targetSectionId } = dropTargetData;

        // Encontrar el item y validar el movimiento usando sections (no previewSections)
        const sourceSection = sections.find(s => s.id === sourceSectionId);
        const targetSection = sections.find(s => s.id === targetSectionId);
        const item = sourceSection?.items.find(i => i.id === itemId);
        
        if (!item || !sourceSection || !targetSection) {
            setActiveId(null);
            setPreviewSections([...sections]);
            return;
        }

        const sourceIndex = sourceSection.items.findIndex(i => i.id === itemId);
        let targetIndex: number;

        if (dropType === 'item') {
            const targetItemId = dropTargetData.itemId!;
            targetIndex = targetSection.items.findIndex(i => i.id === targetItemId);
            
            if (sourceSectionId === targetSectionId && sourceIndex === targetIndex) {
                setActiveId(null);
                setPreviewSections([...sections]);
                return;
            }
        } else if (dropType === 'section') {
            if (sourceSectionId === targetSectionId) {
                setActiveId(null);
                setPreviewSections([...sections]);
                return;
            }
            
            if (!targetSection.allowedItemTypes.includes(item.type)) {
                setActiveId(null);
                setPreviewSections([...sections]);
                return;
            }
            
            if (targetSection.items.length >= targetSection.maxItems) {
                setActiveId(null);
                setPreviewSections([...sections]);
                return;
            }
            
            targetIndex = targetSection.items.length;
        } else if (dropType === 'drop-zone') {
            targetIndex = dropTargetData.index!;
            
            if (sourceSectionId === targetSectionId) {
                if (targetIndex === sourceIndex || targetIndex === sourceIndex + 1) {
                    setActiveId(null);
                    setPreviewSections([...sections]);
                    return;
                }
            } else {
                if (!targetSection.allowedItemTypes.includes(item.type)) {
                    setActiveId(null);
                    setPreviewSections([...sections]);
                    return;
                }
                
                if (targetSection.items.length >= targetSection.maxItems) {
                    setActiveId(null);
                    setPreviewSections([...sections]);
                    return;
                }
            }
        } else {
            setActiveId(null);
            setPreviewSections([...sections]);
            return;
        }

        // Crear drop result y ejecutar el movimiento usando PortfolioEditorState (maneja IDs correctamente)
        const dropResult: DropResult = {
            sourceSectionId,
            targetSectionId,
            sourceIndex,
            targetIndex,
            itemId,
            itemType: item.type
        };

        // Aplicar el cambio real con IDs correctas (cross-section moves obtienen nuevas IDs)
        setSections(prevSections => 
            PortfolioEditorState.moveItem(prevSections, dropResult)
        );
        
        // Limpiar el estado de drag
        setActiveId(null);
    };

    return {
        callbacks,
        closeTypeDialog,
        handleTypeSelection,
        handleDragStart,
        handleDragOver,
        handleDragEnd
    };
};
