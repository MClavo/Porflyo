import type { SectionConfig, PortfolioItem, ItemType } from '../types/itemDto';
import type { DropResult } from '../types/dragDto';
import { SectionDefinitions } from './SectionDefinitions';

// Class that handles all state operations for portfolio sections
export class PortfolioEditorState {
    // Creates a new item based on the specified item type
    static createNewItem(itemType: ItemType, nextId: number): PortfolioItem {
        switch (itemType) {
            case 'text':
                return { id: nextId, type: 'text', text: '' };
            case 'character':
                return { id: nextId, type: 'character', character: 'X' };
            case 'doubleText':
                return { id: nextId, type: 'doubleText', text1: '', text2: '' };
            default:
                throw new Error(`Unknown item type: ${itemType}`);
        }
    }

    // Adds a new item to a specific section with the specified type
    static addItem(sections: SectionConfig[], sectionId: string, itemType: ItemType): SectionConfig[] {
        return sections.map(section => {
            if (section.id === sectionId && section.items.length < section.maxItems) {
                // Verify the item type is allowed for this section
                if (!section.allowedItemTypes.includes(itemType)) {
                    throw new Error(`Item type ${itemType} is not allowed in section ${sectionId}`);
                }
                
                const newItem = this.createNewItem(itemType, section.nextId);
                return {
                    ...section,
                    items: [...section.items, newItem],
                    nextId: section.nextId + 1
                };
            }
            return section;
        });
    }

    // Removes a specific item from a section
    static removeItem(sections: SectionConfig[], sectionId: string, itemId: number): SectionConfig[] {
        return sections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    items: section.items.filter(item => item.id !== itemId)
                };
            }
            return section;
        });
    }

    // Updates a text item
    static updateTextItem(sections: SectionConfig[], sectionId: string, itemId: number, newText: string): SectionConfig[] {
        const limitedText = newText.slice(0, 100);
        
        return sections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    items: section.items.map(item => 
                        item.id === itemId && item.type === 'text'
                            ? { ...item, text: limitedText }
                            : item
                    )
                };
            }
            return section;
        });
    }

    // Updates a double text item
    static updateDoubleTextItem(sections: SectionConfig[], sectionId: string, itemId: number, field: 'text1' | 'text2', newText: string): SectionConfig[] {
        const limitedText = newText.slice(0, 100);
        
        return sections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    items: section.items.map(item => 
                        item.id === itemId && item.type === 'doubleText'
                            ? { ...item, [field]: limitedText }
                            : item
                    )
                };
            }
            return section;
        });
    }

    // Gets initial sections configuration with multiple allowed item types
    static getInitialSections(): SectionConfig[] {
        return SectionDefinitions.getInitialSections();
    }

    // Moves an item within the same section or between sections
    static moveItem(sections: SectionConfig[], dropResult: DropResult): SectionConfig[] {
        const { sourceSectionId, targetSectionId, sourceIndex, targetIndex, itemId, itemType } = dropResult;
        
        // Find source and target sections
        const sourceSection = sections.find(s => s.id === sourceSectionId);
        const targetSection = sections.find(s => s.id === targetSectionId);
        
        if (!sourceSection || !targetSection) {
            return sections;
        }

        // Find the item to move
        const itemToMove = sourceSection.items.find(item => item.id === itemId);
        if (!itemToMove) {
            return sections;
        }

        // Check if the item type is allowed in the target section
        if (sourceSectionId !== targetSectionId && !targetSection.allowedItemTypes.includes(itemType)) {
            return sections;
        }

        // Check if target section has space (only for cross-section moves)
        if (sourceSectionId !== targetSectionId && targetSection.items.length >= targetSection.maxItems) {
            return sections;
        }

        return sections.map(section => {
            if (section.id === sourceSectionId) {
                // Remove item from source section
                const newItems = section.items.filter(item => item.id !== itemId);
                
                // If moving within the same section, insert at new position
                if (sourceSectionId === targetSectionId) {
                    const adjustedTargetIndex = targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;
                    newItems.splice(adjustedTargetIndex, 0, itemToMove);
                    
                    return {
                        ...section,
                        items: newItems
                        // nextId remains the same for same-section moves
                    };
                }
                
                // Cross-section move: just remove from source
                return {
                    ...section,
                    items: newItems
                    // nextId remains the same when removing items
                };
            } else if (section.id === targetSectionId && sourceSectionId !== targetSectionId) {
                // Cross-section move: add item to target section with new ID
                const newItemId = section.nextId;
                const newItem = { ...itemToMove, id: newItemId };
                
                const newItems = [...section.items];
                newItems.splice(targetIndex, 0, newItem);
                
                return {
                    ...section,
                    items: newItems,
                    nextId: section.nextId + 1 // Increment counter for next item
                };
            }
            return section;
        });
    }

    // Helper method to create a unique drag ID for an item
    static createDragId(sectionId: string, itemId: number): string {
        return `${sectionId}-${itemId}`;
    }

    // Helper method to parse a drag ID back to section and item IDs
    static parseDragId(dragId: string): { sectionId: string; itemId: number } | null {
        const parts = dragId.split('-');
        if (parts.length < 2) return null;
        
        const itemId = parseInt(parts[parts.length - 1]);
        const sectionId = parts.slice(0, -1).join('-');
        
        if (isNaN(itemId)) return null;
        
        return { sectionId, itemId };
    }
}
