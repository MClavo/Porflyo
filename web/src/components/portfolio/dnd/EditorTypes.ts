import type { UniqueIdentifier } from '@dnd-kit/core';
import type { PortfolioItem } from '../../../types/itemDto';
import type { PortfolioSection } from '../../../types/sectionDto';

// Editor-specific types that depend on DnD
export type EditorPortfolioItems = Record<string, UniqueIdentifier[]>; // sectionId -> dnd ids
export type EditorPortfolioItemsData = Record<UniqueIdentifier, PortfolioItem>;

export interface EditorSortableItemProps {
  id: UniqueIdentifier;
  item: PortfolioItem;
  index: number;
  section: PortfolioSection;
  onItemUpdate?: (id: UniqueIdentifier, updatedItem: Partial<PortfolioItem>) => void;
}

export interface EditorDroppableZoneProps {
  children?: React.ReactNode;
  section: PortfolioSection;
  items: UniqueIdentifier[];
  itemsData: EditorPortfolioItemsData;
  onItemUpdate?: (id: UniqueIdentifier, updatedItem: Partial<PortfolioItem>) => void;
}
