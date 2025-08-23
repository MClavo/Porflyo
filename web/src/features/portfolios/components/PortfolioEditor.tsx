import React from 'react';
import '../../../styles/portfolio/portfolioEditor.css';
import type { SectionConfig, PortfolioItem } from '../types/itemDto';

interface EditorState {
    sections: SectionConfig[];
}

// Class that handles the logic of the editor with 3 different sections
export default class PortfolioEditor extends React.Component<Record<string, unknown>, EditorState> {
    constructor(props: Record<string, unknown>) {
        super(props);
        this.state = {
            sections: [
                { id: 'section1', title: 'Section Text', itemType: 'text', maxItems: 3, items: [], nextId: 1 },
                { id: 'section2', title: 'Section X', itemType: 'character', maxItems: 6, items: [], nextId: 1 },
                { id: 'section3', title: 'Section Double', itemType: 'doubleText', maxItems: 2, items: [], nextId: 1 }
            ]
        };
    }

    // Creates a new item based on the section's item type
    private createNewItem = (sectionId: string, nextId: number): PortfolioItem => {
        const section = this.state.sections.find(s => s.id === sectionId);
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
    };

    // Adds a new item to a specific section
    private addItem = (sectionId: string): void => {
        this.setState(prevState => ({
            sections: prevState.sections.map(section => {
                if (section.id === sectionId && section.items.length < section.maxItems) {
                    const newItem = this.createNewItem(sectionId, section.nextId);
                    return {
                        ...section,
                        items: [...section.items, newItem],
                        nextId: section.nextId + 1
                    };
                }
                return section;
            })
        }));
    };

    // Removes a specific item from a section
    private removeItem = (sectionId: string, itemId: number): void => {
        this.setState(prevState => ({
            sections: prevState.sections.map(section => {
                if (section.id === sectionId) {
                    return {
                        ...section,
                        items: section.items.filter(item => item.id !== itemId)
                    };
                }
                return section;
            })
        }));
    };

    // Updates a text item
    private updateTextItem = (sectionId: string, itemId: number, newText: string): void => {
        const limitedText = newText.slice(0, 100);
        
        this.setState(prevState => ({
            sections: prevState.sections.map(section => {
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
            })
        }));
    };

    // Updates a double text item
    private updateDoubleTextItem = (sectionId: string, itemId: number, field: 'text1' | 'text2', newText: string): void => {
        const limitedText = newText.slice(0, 100);
        
        this.setState(prevState => ({
            sections: prevState.sections.map(section => {
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
            })
        }));
    };

    // Renders different types of items based on their type
    private renderItem = (item: PortfolioItem, sectionId: string): React.ReactNode => {
        switch (item.type) {
            case 'text':
                return (
                    <>
                        <input
                            type="text"
                            className="item-input"
                            value={item.text}
                            onChange={(e) => this.updateTextItem(sectionId, item.id, e.target.value)}
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
                            onChange={(e) => this.updateDoubleTextItem(sectionId, item.id, 'text1', e.target.value)}
                            placeholder="First text (max 100 chars)"
                            maxLength={100}
                        />
                        <span className="char-counter">{item.text1.length}/100</span>
                        <input
                            type="text"
                            className="item-input"
                            value={item.text2}
                            onChange={(e) => this.updateDoubleTextItem(sectionId, item.id, 'text2', e.target.value)}
                            placeholder="Second text (max 100 chars)"
                            maxLength={100}
                        />
                        <span className="char-counter">{item.text2.length}/100</span>
                    </>
                );
            
            default:
                return <span>Unknown item type</span>;
        }
    };

    // Renders an individual section with its item logic
    private renderSection = (section: SectionConfig): React.ReactNode => {
        const canAddMore = section.items.length < section.maxItems;

        return (
            <div key={section.id} className="portfolio-editor-section">
                <h3 className="section-title">{section.title} ({section.items.length}/{section.maxItems})</h3>
                <div className="portfolio-editor-items">
                    {section.items.map(item => (
                        <div key={`${section.id}-${item.id}`} className="portfolio-editor-item">
                            {this.renderItem(item, section.id)}
                            <button 
                                className="remove-btn"
                                onClick={() => this.removeItem(section.id, item.id)}
                                aria-label={`Remove item from ${section.title}`}
                            >
                                -
                            </button>
                        </div>
                    ))}
                    
                    {canAddMore && (
                        <button 
                            className="add-btn"
                            onClick={() => this.addItem(section.id)}
                            aria-label={`Add new item to ${section.title}`}
                        >
                            +
                        </button>
                    )}
                </div>
                
                {!canAddMore && (
                    <p className="max-items-message">Maximum {section.maxItems} items reached</p>
                )}
            </div>
        );
    };

    // Method where the editor logic is rendered
    private renderLogic(): React.ReactNode {
        const { sections } = this.state;

        return (
            <div className="portfolio-editor-container">
                {sections.map(section => this.renderSection(section))}
            </div>
        );
    }

    render(): React.ReactNode {
        return (
            <section className="portfolio-editor">
                {this.renderLogic()}
            </section>
        );
    }
}
