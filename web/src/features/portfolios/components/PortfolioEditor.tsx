import React from 'react';
import '../../../styles/portfolio/portfolioEditor.css';
import { DndContext, pointerWithin } from '@dnd-kit/core';
import { PortfolioSectionRenderer } from './PortfolioSectionRenderer';
import { ItemTypeDialog } from './ItemTypeDialog';
import { usePortfolioEditor } from './PortfolioEditorHooks';
import { usePortfolioCallbacks } from './PortfolioEditorCallbacks';

// Main Portfolio Editor Component - orchestrates all the editor functionality
const PortfolioEditor: React.FC = () => {
    // Custom hooks for state management
    const {
        sections,
        setSections,
        activeId,
        setActiveId,
        previewSections,
        setPreviewSections,
        typeDialog,
        setTypeDialog,
        sensors
    } = usePortfolioEditor();

    // Custom hooks for callbacks and event handlers
    const {
        callbacks,
        closeTypeDialog,
        handleTypeSelection,
        handleDragStart,
        handleDragOver,
        handleDragEnd
    } = usePortfolioCallbacks({
        sections,
        setSections,
        activeId,
        setActiveId,
        previewSections,
        setPreviewSections,
        typeDialog,
        setTypeDialog
    });

    const renderLogic = (): React.ReactNode => {
        // Usar previewSections durante el drag para mostrar posiciones en tiempo real
        // Usar sections normales cuando no hay drag activo
        const sectionsToRender = activeId ? previewSections : sections;
        
        return (
            <div className="portfolio-editor-container">
                {sectionsToRender.map(section => 
                    PortfolioSectionRenderer.renderSection(section, callbacks)
                )}
            </div>
        );
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
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
