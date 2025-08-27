import type { PortfolioItem, SavedItem } from '../types/itemDto';
import { 
  mapPortfolioItemToCreateDto, 
  mapSavedItemToCreateDto,
  mapPublicSavedSectionToSavedItem,
  getItemContentPreview,
  getItemTypeDisplayName
} from '../mappers/savedSections.mapper';
import { 
  createSavedSection, 
  getSavedSections, 
  deleteSavedSection 
} from '../api/clients/savedSections.api';
import type { PublicSavedSectionDto } from '../types/savedSections.types';

/**
 * Service class for managing saved sections with high-level operations
 */
export class SavedSectionsService {
  /**
   * Save a PortfolioItem to the database with a custom name
   */
  static async saveItem(item: PortfolioItem, name: string): Promise<PublicSavedSectionDto> {
    console.log('🔄 SavedSectionsService.saveItem called - calling API directly (not using React Query mutations)');
    const createDto = mapPortfolioItemToCreateDto(item, name);
    const response = await createSavedSection(createDto);
    return response.data;
  }

  /**
   * Save a SavedItem to the database (used when updating existing saved items)
   */
  static async saveSavedItem(savedItem: SavedItem, customName?: string): Promise<PublicSavedSectionDto> {
    const createDto = mapSavedItemToCreateDto(savedItem, customName);
    const response = await createSavedSection(createDto);
    return response.data;
  }

  /**
   * Get all saved sections from the database
   */
  static async getAllSavedSections(): Promise<PublicSavedSectionDto[]> {
    const response = await getSavedSections();
    return response.data;
  }

  /**
   * Get all saved sections converted to SavedItems for use in the editor
   */
  static async getAllSavedItems(): Promise<SavedItem[]> {
    const sections = await this.getAllSavedSections();
    return sections.map(section => mapPublicSavedSectionToSavedItem(section));
  }

  /**
   * Delete a saved section by ID
   */
  static async deleteSavedSection(itemId: string): Promise<void> {
    console.log('🔄 SavedSectionsService.deleteSavedSection called - calling API directly (not using React Query mutations)');
    await deleteSavedSection(itemId);
  }

  /**
   * Get a preview of what will be saved for a given item
   */
  static getItemPreviewForSave(item: PortfolioItem): {
    type: string;
    content: string;
    preview: string;
  } {
    return {
      type: getItemTypeDisplayName(item),
      content: getItemContentPreview(item),
      preview: `${getItemTypeDisplayName(item)}: ${getItemContentPreview(item)}`,
    };
  }

  /**
   * Validate if an item can be saved
   */
  static canSaveItem(item: PortfolioItem): { canSave: boolean; reason?: string } {
    // Check if it's already a saved item
    if (item.type === 'savedItem') {
      return { canSave: true };
    }

    // Check if item has meaningful content
    switch (item.type) {
      case 'text':
        if (!item.text || item.text.trim().length === 0) {
          return { canSave: false, reason: 'El texto está vacío' };
        }
        break;
      
      case 'character':
        if (!item.character || item.character.trim().length === 0) {
          return { canSave: false, reason: 'El carácter está vacío' };
        }
        break;
      
      case 'doubleText':
        if ((!item.text1 || item.text1.trim().length === 0) && 
            (!item.text2 || item.text2.trim().length === 0)) {
          return { canSave: false, reason: 'Ambos textos están vacíos' };
        }
        break;
      
      default:
        return { canSave: false, reason: 'Tipo de item no soportado' };
    }

    return { canSave: true };
  }

  /**
   * Get statistics about saved sections
   */
  static async getSavedSectionsStats(): Promise<{
    totalCount: number;
    typeBreakdown: Record<string, number>;
  }> {
    const sections = await this.getAllSavedSections();
    
    const typeBreakdown: Record<string, number> = {};
    
    sections.forEach(section => {
      const type = section.section.title;
      typeBreakdown[type] = (typeBreakdown[type] || 0) + 1;
    });

    return {
      totalCount: sections.length,
      typeBreakdown,
    };
  }
}

// Export as default and named export
export default SavedSectionsService;
