import type { SectionType, SectionDefinition } from '../types/sectionDto';
import { SECTION_DEFINITIONS } from '../types/sectionDto';
import type { SectionConfig } from '../types/itemDto';

// Class that manages section definitions and creates section configurations
export class SectionDefinitions {
    // Get all available section definitions
    static getAllDefinitions(): Record<SectionType, SectionDefinition> {
        return SECTION_DEFINITIONS;
    }

    // Get a specific section definition by type
    static getDefinition(sectionType: SectionType): SectionDefinition {
        const definitions = this.getAllDefinitions();
        const definition = definitions[sectionType];
        if (!definition) {
            throw new Error(`Section type ${sectionType} not found`);
        }
        return definition;
    }

    // Create a section configuration from a section definition
    static createSectionConfig(
        sectionType: SectionType, 
        customOptions?: {
            id?: string;
            title?: string;
            maxItems?: number;
            allowedItemTypes?: import('../types/itemDto').ItemType[];
        }
    ): SectionConfig {
        const definition = this.getDefinition(sectionType);
        
        return {
            id: customOptions?.id || `section_${sectionType}_${Date.now()}`,
            title: customOptions?.title || definition.title,
            sectionType: sectionType,
            allowedItemTypes: customOptions?.allowedItemTypes || definition.defaultAllowedItemTypes,
            maxItems: customOptions?.maxItems || definition.defaultMaxItems,
            items: [],
            nextId: 1
        };
    }

    // Get predefined section configurations for initial setup
    static getInitialSections(): SectionConfig[] {
        return [
            this.createSectionConfig('text', { 
                id: 'section1', 
                title: 'About Me',
                maxItems: 2,
                allowedItemTypes: ['text']
            }),
            this.createSectionConfig('skills', { 
                id: 'section2', 
                title: 'Technical Skills',
                maxItems: 6,
                allowedItemTypes: ['character', 'doubleText']
            }),
            this.createSectionConfig('projects', { 
                id: 'section3', 
                title: 'Featured Projects',
                maxItems: 2,
                allowedItemTypes: ['text', 'character', 'doubleText']
            })
        ];
    }

    // Get section types that are commonly used together
    static getRecommendedSections(): SectionType[] {
        return ['user', 'experience', 'projects', 'skills', 'education', 'contact'];
    }

    // Get section description for tooltips/help
    static getSectionDescription(sectionType: SectionType): string {
        const definition = this.getDefinition(sectionType);
        return definition.description;
    }
}
