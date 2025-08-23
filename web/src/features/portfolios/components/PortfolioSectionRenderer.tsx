import React from 'react';
import type { SectionConfig, ItemType } from '../types/itemDto';
import type { ItemRendererCallbacks } from './PortfolioItemRenderer';
import { SectionHeader } from './SectionHeader';
import { DraggableItem } from '../dnd/DraggableItem';
import { DroppableSection } from '../dnd/DroppableSection';
import { DropZone } from '../dnd/DropZone';

// Type definitions for section renderer callback functions
export interface SectionRendererCallbacks extends ItemRendererCallbacks {
    addItem: (sectionId: string, itemType: ItemType) => void;
    removeItem: (sectionId: string, itemId: number) => void;
    openTypeDialog: (sectionId: string, position: { x: number; y: number }) => void;
}

// Class that handles rendering of portfolio sections with drag and drop support
export class PortfolioSectionRenderer {
    // Renders an individual section with its item logic and DnD support
    static renderSection(section: SectionConfig, callbacks: SectionRendererCallbacks): React.ReactNode {
        const canAddMore = section.items.length < section.maxItems;
        const hasMultipleTypes = section.allowedItemTypes.length > 1;

        const handleAddClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            if (hasMultipleTypes) {
                // Open dialog to choose item type
                const rect = event.currentTarget.getBoundingClientRect();
                callbacks.openTypeDialog(section.id, {
                    x: rect.left,
                    y: rect.top - 10 // Position dialog above the button
                });
            } else {
                // Direct add with the single allowed type
                callbacks.addItem(section.id, section.allowedItemTypes[0]);
            }
        };

        return (
            <DroppableSection key={section.id} section={section}>
                <div className="portfolio-editor-section">
                    <SectionHeader section={section} />
                    <div className="portfolio-editor-items">
                        {/* Drop zone at the beginning */}
                        <DropZone sectionId={section.id} index={0} />
                        
                        {section.items.map((item, index) => (
                            <React.Fragment key={`${section.id}-${item.id}`}>
                                <div className="portfolio-editor-item-wrapper">
                                    <DraggableItem
                                        item={item}
                                        sectionId={section.id}
                                        index={index}
                                        callbacks={callbacks}
                                    />
                                    <button 
                                        className="remove-btn"
                                        onClick={() => callbacks.removeItem(section.id, item.id)}
                                        aria-label={`Remove item from ${section.title}`}
                                    >
                                        -
                                    </button>
                                </div>
                                {/* Drop zone after each item */}
                                <DropZone sectionId={section.id} index={index + 1} />
                            </React.Fragment>
                        ))}
                        
                        {canAddMore && (
                            <button 
                                className={`add-btn ${hasMultipleTypes ? 'add-btn-dropdown' : ''}`}
                                onClick={handleAddClick}
                                aria-label={`Add new item to ${section.title}`}
                            >
                                +
                                {hasMultipleTypes && <span className="dropdown-arrow">▼</span>}
                            </button>
                        )}
                    </div>
                    
                    {!canAddMore && (
                        <p className="max-items-message">Maximum {section.maxItems} items reached</p>
                    )}
                </div>
            </DroppableSection>
        );
    }
}
