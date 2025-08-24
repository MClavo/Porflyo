import type { UniqueIdentifier } from '@dnd-kit/core';
import type { SectionConfig, PortfolioItem } from '../types/itemDto';

// Types for the new DnD implementation following MultipleContainers pattern

export type ContainerType = 'section';
export type ItemDataType = 'item';

export interface DragData {
  type: ContainerType | ItemDataType;
  children?: UniqueIdentifier[]; // For containers, list of item IDs
}

export interface DndSectionConfig extends Omit<SectionConfig, 'items'> {
  items: UniqueIdentifier[]; // Array of item IDs instead of full objects
}

// Map of item IDs to actual item data
export type ItemsMap = Record<UniqueIdentifier, PortfolioItem>;

// Map of section IDs to arrays of item IDs (following MultipleContainers pattern)
export type SectionsMap = Record<UniqueIdentifier, UniqueIdentifier[]>;

export interface PortfolioDndState {
  sections: DndSectionConfig[];
  itemsById: ItemsMap;
  sectionsMap: SectionsMap; // For quick DnD operations
}

export interface DragStartEvent {
  activeId: UniqueIdentifier;
  sectionsSnapshot: SectionsMap;
  itemsSnapshot: ItemsMap;
}

export interface CollisionStrategy {
  name: 'pointer' | 'rect' | 'cached';
  lastOverId?: UniqueIdentifier | null;
}
