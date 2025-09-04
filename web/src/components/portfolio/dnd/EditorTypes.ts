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
  templateId?: string;
  onItemUpdate?: (id: UniqueIdentifier, updatedItem: Partial<PortfolioItem>) => void;
  onRemove?: (id: UniqueIdentifier) => void;
}

export interface EditorDroppableZoneProps {
  children?: React.ReactNode;
  section: PortfolioSection;
  items: UniqueIdentifier[];
  itemsData: EditorPortfolioItemsData;
  templateId?: string;
  onItemUpdate?: (id: UniqueIdentifier, updatedItem: Partial<PortfolioItem>) => void;
  onRemove?: (id: UniqueIdentifier) => void;
  onAddItem?: (sectionId: string, itemType?: import('../../../types/itemDto').ItemType) => void;
}
