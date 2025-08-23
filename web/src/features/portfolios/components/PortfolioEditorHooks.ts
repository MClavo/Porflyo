import { useState, useEffect } from 'react';
import { 
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { SectionConfig } from '../types/itemDto';
import type { TypeDialogState } from './PortfolioEditorTypes';
import { PortfolioEditorState } from './PortfolioEditorState';

export const usePortfolioEditor = () => {
    const [sections, setSections] = useState<SectionConfig[]>(
        PortfolioEditorState.getInitialSections()
    );
    
    const [activeId, setActiveId] = useState<string | null>(null);
    
    // Estado virtual para mostrar posiciones durante el drag (sin cambiar IDs originales)
    const [previewSections, setPreviewSections] = useState<SectionConfig[]>(
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

    // Sincronizar previewSections cuando sections cambie (excepto durante drag activo)
    useEffect(() => {
        if (!activeId) {
            setPreviewSections([...sections]);
        }
    }, [sections, activeId]);

    return {
        sections,
        setSections,
        activeId,
        setActiveId,
        previewSections,
        setPreviewSections,
        typeDialog,
        setTypeDialog,
        sensors
    };
};
