import React from 'react';
import '../../../styles/portfolio/portfolioEditor.css';
import type { SectionConfig } from '../types/itemDto';
import { PortfolioEditorState } from './PortfolioEditorState';
import { PortfolioSectionRenderer, type SectionRendererCallbacks } from './PortfolioSectionRenderer';

interface EditorState {
    sections: SectionConfig[];
}

// Main Portfolio Editor Component - orchestrates all the editor functionality
export default class PortfolioEditor extends React.Component<Record<string, unknown>, EditorState> {
    constructor(props: Record<string, unknown>) {
        super(props);
        this.state = {
            sections: PortfolioEditorState.getInitialSections()
        };
    }

    // Callback handlers that delegate to the state management class
    private readonly callbacks: SectionRendererCallbacks = {
        addItem: (sectionId: string) => {
            this.setState(prevState => ({
                sections: PortfolioEditorState.addItem(prevState.sections, sectionId)
            }));
        },

        removeItem: (sectionId: string, itemId: number) => {
            this.setState(prevState => ({
                sections: PortfolioEditorState.removeItem(prevState.sections, sectionId, itemId)
            }));
        },

        updateTextItem: (sectionId: string, itemId: number, newText: string) => {
            this.setState(prevState => ({
                sections: PortfolioEditorState.updateTextItem(prevState.sections, sectionId, itemId, newText)
            }));
        },

        updateDoubleTextItem: (sectionId: string, itemId: number, field: 'text1' | 'text2', newText: string) => {
            this.setState(prevState => ({
                sections: PortfolioEditorState.updateDoubleTextItem(prevState.sections, sectionId, itemId, field, newText)
            }));
        }
    };

    // Main render method - delegates to section renderer
    private renderLogic(): React.ReactNode {
        const { sections } = this.state;

        return (
            <div className="portfolio-editor-container">
                {sections.map(section => 
                    PortfolioSectionRenderer.renderSection(section, this.callbacks)
                )}
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
