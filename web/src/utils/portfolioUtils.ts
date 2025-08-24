import type { PortfolioItem, ItemType } from '../types/itemDto';
import type { PortfolioSection, SectionType } from '../types/sectionDto';
import { SECTION_DEFINITIONS } from '../types/sectionDto';

// Utility function to create a new empty portfolio section
export function createPortfolioSection(
  id: string,
  type: SectionType,
  overrides?: Partial<PortfolioSection>
): PortfolioSection {
  const definition = SECTION_DEFINITIONS[type];
  
  return {
    id,
    type,
    title: definition.title,
    layoutType: getDefaultZoneType(type),
    maxItems: definition.defaultMaxItems,
    allowedItemTypes: definition.defaultAllowedItemTypes,
    items: [],
    ...overrides,
  };
}

// Utility function to create a new portfolio item
export function createPortfolioItem(
  id: number,
  type: ItemType,
  initialData?: Record<string, unknown>
): PortfolioItem {
  switch (type) {
    case 'text':
      return {
        id,
        type: 'text',
        text: (typeof initialData?.text === 'string') ? initialData.text : '',
      };
    case 'character':
      return {
        id,
        type: 'character',
        character: (typeof initialData?.character === 'string') ? initialData.character : '?',
      };
    case 'doubleText':
      return {
        id,
        type: 'doubleText',
        text1: (typeof initialData?.text1 === 'string') ? initialData.text1 : '',
        text2: (typeof initialData?.text2 === 'string') ? initialData.text2 : '',
      };
    default:
      throw new Error(`Unknown item type: ${type}`);
  }
}

// Helper function to get default zone type for a section type
function getDefaultZoneType(sectionType: SectionType): 'grid' | 'column' | 'row' {
  switch (sectionType) {
    case 'user':
      return 'column';
    case 'projects':
    case 'skills':
      return 'grid';
    case 'experience':
    case 'education':
    case 'achievements':
    case 'contact':
      return 'row';
    case 'text':
      return 'column';
    default:
      return 'row';
  }
}


// Utility to validate if an item type is allowed in a section
export function isItemTypeAllowed(itemType: ItemType, section: PortfolioSection): boolean {
  return section.allowedItemTypes.includes(itemType);
}

// Utility to check if a section can accept more items
export function canSectionAcceptMoreItems(section: PortfolioSection): boolean {
  return section.items.length < section.maxItems;
}

// Utility to add an item to a section
export function addItemToSection(
  section: PortfolioSection,
  itemId: string
): PortfolioSection {
  if (!canSectionAcceptMoreItems(section)) {
    throw new Error(`Section ${section.id} is full (${section.maxItems} items max)`);
  }
  
  return {
    ...section,
    items: [...section.items, itemId],
  };
}

// Utility to remove an item from a section
export function removeItemFromSection(
  section: PortfolioSection,
  itemId: string
): PortfolioSection {
  return {
    ...section,
    items: section.items.filter(id => id !== itemId),
  };
}
