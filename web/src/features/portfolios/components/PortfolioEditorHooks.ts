import { useState } from 'react';
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

    return {
        sections,
        setSections,
        typeDialog,
        setTypeDialog,
        sensors
    };
};
