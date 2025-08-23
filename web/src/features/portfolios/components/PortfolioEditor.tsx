import React from 'react';
import '../../../styles/portfolio/portfolioEditor.css';
import type { SectionConfig, ItemType } from '../types/itemDto';
import { PortfolioEditorState } from './PortfolioEditorState';
import { PortfolioSectionRenderer, type SectionRendererCallbacks } from './PortfolioSectionRenderer';
import { ItemTypeDialog } from './ItemTypeDialog';

interface EditorState {
    sections: SectionConfig[];
    typeDialog: {
        isOpen: boolean;
        sectionId: string;
        position: { x: number; y: number };
        allowedTypes: ItemType[];
    };
}

// Main Portfolio Editor Component - orchestrates all the editor functionality
export default class PortfolioEditor extends React.Component<Record<string, unknown>, EditorState> {
    constructor(props: Record<string, unknown>) {
        super(props);
        this.state = {
            sections: PortfolioEditorState.getInitialSections(),
            typeDialog: {
                isOpen: false,
                sectionId: '',
                position: { x: 0, y: 0 },
                allowedTypes: []
            }
        };
    }

    // Callback handlers that delegate to the state management class
    private readonly callbacks: SectionRendererCallbacks = {
        addItem: (sectionId: string, itemType: ItemType) => {
            this.setState(prevState => ({
                sections: PortfolioEditorState.addItem(prevState.sections, sectionId, itemType)
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
        },

        openTypeDialog: (sectionId: string, position: { x: number; y: number }) => {
            const section = this.state.sections.find(s => s.id === sectionId);
            if (section && section.allowedItemTypes.length > 1) {
                this.setState({
                    typeDialog: {
                        isOpen: true,
                        sectionId,
                        position,
                        allowedTypes: section.allowedItemTypes
                    }
                });
            }
        }
    };

    private closeTypeDialog = () => {
        this.setState(prevState => ({
            typeDialog: {
                ...prevState.typeDialog,
                isOpen: false
            }
        }));
    };

    private handleTypeSelection = (itemType: ItemType) => {
        const { sectionId } = this.state.typeDialog;
        this.callbacks.addItem(sectionId, itemType);
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
        const { typeDialog } = this.state;

        return (
            <section className="portfolio-editor">
                {this.renderLogic()}
                
                <ItemTypeDialog
                    isOpen={typeDialog.isOpen}
                    allowedTypes={typeDialog.allowedTypes}
                    onSelectType={this.handleTypeSelection}
                    onClose={this.closeTypeDialog}
                    position={typeDialog.position}
                />
            </section>
        );
    }
}
