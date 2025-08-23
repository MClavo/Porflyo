import type { SectionConfig, PortfolioItem, ItemType } from '../types/itemDto';
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
}
