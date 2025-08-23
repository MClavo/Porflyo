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
        handleDragEnd
    } = usePortfolioCallbacks({
        sections,
        setSections,
        typeDialog,
        setTypeDialog
    });

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
            collisionDetection={pointerWithin}
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
