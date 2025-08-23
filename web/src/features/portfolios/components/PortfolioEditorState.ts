import type { SectionConfig, PortfolioItem } from '../types/itemDto';

// Class that handles all state operations for portfolio sections
export class PortfolioEditorState {
    // Creates a new item based on the section's item type
    static createNewItem(sectionId: string, nextId: number, sections: SectionConfig[]): PortfolioItem {
        const section = sections.find(s => s.id === sectionId);
        if (!section) throw new Error(`Section ${sectionId} not found`);

        switch (section.itemType) {
            case 'text':
                return { id: nextId, type: 'text', text: '' };
            case 'character':
                return { id: nextId, type: 'character', character: 'X' };
            case 'doubleText':
                return { id: nextId, type: 'doubleText', text1: '', text2: '' };
            default:
                throw new Error(`Unknown item type: ${section.itemType}`);
        }
    }

    // Adds a new item to a specific section
    static addItem(sections: SectionConfig[], sectionId: string): SectionConfig[] {
        return sections.map(section => {
            if (section.id === sectionId && section.items.length < section.maxItems) {
                const newItem = this.createNewItem(sectionId, section.nextId, sections);
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

    // Gets initial sections configuration
    static getInitialSections(): SectionConfig[] {
        return [
            { id: 'section1', title: 'Section Text', itemType: 'text', maxItems: 3, items: [], nextId: 1 },
            { id: 'section2', title: 'Section X', itemType: 'character', maxItems: 6, items: [], nextId: 1 },
            { id: 'section3', title: 'Section Double', itemType: 'doubleText', maxItems: 2, items: [], nextId: 1 }
        ];
    }
}
