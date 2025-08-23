import React from 'react';
import type { SectionConfig, ItemType } from '../types/itemDto';
import { PortfolioItemRenderer, type ItemRendererCallbacks } from './PortfolioItemRenderer';

// Type definitions for section renderer callback functions
export interface SectionRendererCallbacks extends ItemRendererCallbacks {
    addItem: (sectionId: string, itemType: ItemType) => void;
    removeItem: (sectionId: string, itemId: number) => void;
    openTypeDialog: (sectionId: string, position: { x: number; y: number }) => void;
}

// Class that handles rendering of portfolio sections
export class PortfolioSectionRenderer {
    // Renders an individual section with its item logic
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
            <div key={section.id} className="portfolio-editor-section">
                <h3 className="section-title">{section.title} ({section.items.length}/{section.maxItems})</h3>
                <div className="portfolio-editor-items">
                    {section.items.map(item => (
                        <div key={`${section.id}-${item.id}`} className="portfolio-editor-item">
                            {PortfolioItemRenderer.renderItem(item, section.id, callbacks)}
                            <button 
                                className="remove-btn"
                                onClick={() => callbacks.removeItem(section.id, item.id)}
                                aria-label={`Remove item from ${section.title}`}
                            >
                                -
                            </button>
                        </div>
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
        );
    }
}
