import { produce } from 'immer';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { 
  DndSectionConfig, 
  ItemsMap, 
  SectionsMap
} from './types';
import type { SectionConfig, PortfolioItem } from '../types/itemDto';

/**
 * Immutable state helpers for DnD operations following MultipleContainers pattern
 * All functions use Immer's produce for immutable updates
 */

export class DndStateHelpers {
  /**
   * Converts legacy sections to DnD format
   */
  static convertToSectionsMap(sections: SectionConfig[]): SectionsMap {
    const sectionsMap: SectionsMap = {};
    
    sections.forEach(section => {
      sectionsMap[section.id] = section.items.map(item => String(item.id));
    });
    
    return sectionsMap;
  }

  /**
   * Converts legacy sections to items map
   */
  static convertToItemsMap(sections: SectionConfig[]): ItemsMap {
    const itemsMap: ItemsMap = {};
    
    sections.forEach(section => {
      section.items.forEach(item => {
        itemsMap[String(item.id)] = item;
      });
    });
    
    return itemsMap;
  }

  /**
   * Converts legacy sections to DnD sections config
   */
  static convertToDndSections(sections: SectionConfig[]): DndSectionConfig[] {
    return sections.map(section => ({
      ...section,
      items: section.items.map(item => String(item.id))
    }));
  }

  /**
   * Finds which section contains an item
   */
  static findContainer(itemId: UniqueIdentifier, sectionsMap: SectionsMap): UniqueIdentifier | undefined {
    // If itemId is already a section, return it
    if (itemId in sectionsMap) {
      return itemId;
    }

    // Find the section that contains this item
    return Object.keys(sectionsMap).find(sectionId => 
      sectionsMap[sectionId].includes(itemId)
    );
  }

  /**
   * Gets the index of an item within its section
   */
  static getItemIndex(itemId: UniqueIdentifier, sectionsMap: SectionsMap): number {
    const containerId = DndStateHelpers.findContainer(itemId, sectionsMap);
    
    if (!containerId) {
      return -1;
    }

    return sectionsMap[containerId].indexOf(itemId);
  }

  /**
   * Moves an item within the same section
   */
  static moveItemWithinSection(
    sectionsMap: SectionsMap,
    sectionId: UniqueIdentifier,
    fromIndex: number,
    toIndex: number
  ): SectionsMap {
    return produce(sectionsMap, (draft) => {
      const section = draft[sectionId];
      if (!section) return;

      const [movedItem] = section.splice(fromIndex, 1);
      section.splice(toIndex, 0, movedItem);
    });
  }

  /**
   * Moves an item between different sections
   */
  static moveItemBetweenSections(
    sectionsMap: SectionsMap,
    fromSectionId: UniqueIdentifier,
    toSectionId: UniqueIdentifier,
    fromIndex: number,
    toIndex: number
  ): SectionsMap {
    return produce(sectionsMap, (draft) => {
      const fromSection = draft[fromSectionId];
      const toSection = draft[toSectionId];
      
      if (!fromSection || !toSection) return;

      const [movedItem] = fromSection.splice(fromIndex, 1);
      toSection.splice(toIndex, 0, movedItem);
    });
  }

  /**
   * Removes an item from its section
   */
  static removeItem(
    sectionsMap: SectionsMap,
    itemsMap: ItemsMap,
    itemId: UniqueIdentifier
  ): { sectionsMap: SectionsMap; itemsMap: ItemsMap } {
    const newSectionsMap = produce(sectionsMap, (draft) => {
      Object.keys(draft).forEach(sectionId => {
        const itemIndex = draft[sectionId].indexOf(itemId);
        if (itemIndex !== -1) {
          draft[sectionId].splice(itemIndex, 1);
        }
      });
    });

    const newItemsMap = produce(itemsMap, (draft) => {
      delete draft[itemId];
    });

    return { sectionsMap: newSectionsMap, itemsMap: newItemsMap };
  }

  /**
   * Adds a new item to a section
   */
  static addItemToSection(
    sectionsMap: SectionsMap,
    itemsMap: ItemsMap,
    sectionId: UniqueIdentifier,
    item: PortfolioItem,
    position?: number
  ): { sectionsMap: SectionsMap; itemsMap: ItemsMap } {
    const itemId = String(item.id);

    const newSectionsMap = produce(sectionsMap, (draft) => {
      const section = draft[sectionId];
      if (!section) return;

      if (position !== undefined) {
        section.splice(position, 0, itemId);
      } else {
        section.push(itemId);
      }
    });

    const newItemsMap = produce(itemsMap, (draft) => {
      draft[itemId] = item;
    });

    return { sectionsMap: newSectionsMap, itemsMap: newItemsMap };
  }

  /**
   * Converts DnD state back to legacy format for compatibility
   */
  static convertToLegacyFormat(
    dndSections: DndSectionConfig[],
    itemsMap: ItemsMap
  ): SectionConfig[] {
    return dndSections.map(section => ({
      ...section,
      items: section.items.map(itemId => itemsMap[itemId]).filter(Boolean)
    }));
  }

  /**
   * Deep clones sections map for revert operations
   */
  static cloneSectionsMap(sectionsMap: SectionsMap): SectionsMap {
    return produce(sectionsMap, () => {});
  }

  /**
   * Deep clones items map for revert operations
   */
  static cloneItemsMap(itemsMap: ItemsMap): ItemsMap {
    return produce(itemsMap, () => {});
  }
}
