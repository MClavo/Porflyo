import type { PortfolioItem, SavedItem } from '../types/itemDto';
import type { SectionType } from '../types/sectionDto';
import type { 
  PortfolioSection, 
  SavedSectionCreateDto,
  PublicSavedSectionDto 
} from '../types/savedSections.types';

/**
 * Maps a PortfolioItem to the API PortfolioSection format
 */
export const mapPortfolioItemToSection = (item: PortfolioItem): PortfolioSection => {
  // If it's a SavedItem, use the original item
  const actualItem = item.type === 'savedItem' ? (item as SavedItem).originalItem : item;

  let content: string;
  const media: string[] = [];

  switch (actualItem.type) {
    case 'text':
      content = JSON.stringify({
        text: actualItem.text,
      });
      break;
    
    case 'character':
      content = JSON.stringify({
        character: actualItem.character,
      });
      break;
    
    case 'doubleText':
      content = JSON.stringify({
        text1: actualItem.text1,
        text2: actualItem.text2,
      });
      break;
    
    default:
      content = JSON.stringify({});
      break;
  }

  return {
    sectionType: actualItem.sectionType,
    title: actualItem.type,
    content,
    media,
  };
};

/**
 * Maps a SavedItem to SavedSectionCreateDto for API creation
 */
export const mapSavedItemToCreateDto = (
  savedItem: SavedItem,
  customName?: string
): SavedSectionCreateDto => {
  const section = mapPortfolioItemToSection(savedItem.originalItem);
  
  return {
    name: customName || savedItem.savedName,
    section,
  };
};

/**
 * Maps a regular PortfolioItem to SavedSectionCreateDto for API creation
 */
export const mapPortfolioItemToCreateDto = (
  item: PortfolioItem,
  name: string
): SavedSectionCreateDto => {
  const section = mapPortfolioItemToSection(item);
  
  return {
    name,
    section,
  };
};

/**
 * Maps API PortfolioSection back to PortfolioItem
 */
export const mapSectionToPortfolioItem = (
  section: PortfolioSection,
  id: number = Date.now()
): PortfolioItem => {
  const parsedContent = JSON.parse(section.content);
  
  switch (section.title) {
    case 'text':
      return {
        id,
        type: 'text',
        sectionType: section.sectionType as SectionType,
        text: parsedContent.text || '',
      };
    
    case 'character':
      return {
        id,
        type: 'character',
        sectionType: section.sectionType as SectionType,
        character: parsedContent.character || '?',
      };
    
    case 'doubleText':
      return {
        id,
        type: 'doubleText',
        sectionType: section.sectionType as SectionType,
        text1: parsedContent.text1 || '',
        text2: parsedContent.text2 || '',
      };
    
    default:
      // Fallback to text type
      return {
        id,
        type: 'text',
        sectionType: section.sectionType as SectionType,
        text: parsedContent.text || 'Unknown item',
      };
  }
};

/**
 * Maps PublicSavedSectionDto to SavedItem
 */
export const mapPublicSavedSectionToSavedItem = (
  dto: PublicSavedSectionDto,
  id: number = Date.now()
): SavedItem => {
  const originalItem = mapSectionToPortfolioItem(dto.section, id);
  
  return {
    id,
    type: 'savedItem',
    sectionType: 'savedItems',
    savedName: dto.name,
    dbId: dto.id, // Store the database ID for deletion
    originalItem: originalItem as import('../types/itemDto').TextItem | import('../types/itemDto').CharacterItem | import('../types/itemDto').DoubleTextItem,
  };
};

/**
 * Helper to get item type from PortfolioItem for display purposes
 */
export const getItemTypeDisplayName = (item: PortfolioItem): string => {
  switch (item.type) {
    case 'text':
      return 'Texto';
    case 'character':
      return 'Carácter';
    case 'doubleText':
      return 'Texto doble';
    case 'savedItem':
      return 'Item guardado';
    default:
      return 'Desconocido';
  }
};

/**
 * Helper to get item content preview for display purposes
 */
export const getItemContentPreview = (item: PortfolioItem): string => {
  switch (item.type) {
    case 'text':
      return item.text || 'Sin texto';
    case 'character':
      return item.character || '?';
    case 'doubleText':
      return `${item.text1 || 'Sin título'} / ${item.text2 || 'Sin subtítulo'}`;
    case 'savedItem':
      return item.savedName || 'Item sin nombre';
    default:
      return 'Sin contenido';
  }
};
