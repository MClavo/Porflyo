import React from 'react';
import type { PortfolioItem } from '../types/itemDto';

// Type definitions for the item renderer callback functions
export interface ItemRendererCallbacks {
    updateTextItem: (sectionId: string, itemId: number, newText: string) => void;
    updateDoubleTextItem: (sectionId: string, itemId: number, field: 'text1' | 'text2', newText: string) => void;
}

// Class that handles rendering of different item types
export class PortfolioItemRenderer {
    // Renders different types of items based on their type
    static renderItem(item: PortfolioItem, sectionId: string, callbacks: ItemRendererCallbacks): React.ReactNode {
        switch (item.type) {
            case 'text':
                return (
                    <>
                        <input
                            type="text"
                            className="item-input"
                            value={item.text}
                            onChange={(e) => callbacks.updateTextItem(sectionId, item.id, e.target.value)}
                            placeholder="Enter text (max 100 chars)"
                            maxLength={100}
                        />
                        <span className="char-counter">{item.text.length}/100</span>
                    </>
                );
            
            case 'character':
                return (
                    <span className="item-character">{item.character}</span>
                );
            
            case 'doubleText':
                return (
                    <>
                        <input
                            type="text"
                            className="item-input"
                            value={item.text1}
                            onChange={(e) => callbacks.updateDoubleTextItem(sectionId, item.id, 'text1', e.target.value)}
                            placeholder="First text (max 100 chars)"
                            maxLength={100}
                        />
                        <span className="char-counter">{item.text1.length}/100</span>
                        <input
                            type="text"
                            className="item-input"
                            value={item.text2}
                            onChange={(e) => callbacks.updateDoubleTextItem(sectionId, item.id, 'text2', e.target.value)}
                            placeholder="Second text (max 100 chars)"
                            maxLength={100}
                        />
                        <span className="char-counter">{item.text2.length}/100</span>
                    </>
                );
            
            default:
                return <span>Unknown item type</span>;
        }
    }
}
