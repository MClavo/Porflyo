// Layout (presentational) types — independent from DnD
import type { PortfolioItem } from '../../../types/itemDto';
import type { PortfolioSection } from '../../../types/sectionDto';

export type PortfolioItems = Record<string, string[]>; // sectionId -> array of itemIds
export type PortfolioItemsData = Record<string, PortfolioItem>; // itemId -> item data

export interface PortfolioZone {
  id: string;
  label: string;
  zoneType: 'about' | 'cards-grid' | 'list';
  allowed: string[];
  maxItems: number;
  color?: string;
}

export interface PresentationalItemProps {
  id: string | number;
  item: PortfolioItem;
  index: number;
  section: PortfolioSection;
  templateId?: string;
  onItemUpdate?: (id: string | number, updatedItem: Partial<PortfolioItem>) => void;
  onRemove?: (id: string | number) => void;
}

export interface DroppableZoneProps {
  children?: React.ReactNode;
  section: PortfolioSection;
  items: string[];
  itemsData: PortfolioItemsData;
  templateId?: string;
  onItemUpdate?: (id: string | number, updatedItem: Partial<PortfolioItem>) => void;
  onAddItem?: (sectionId: string, itemType?: import('../../../types/itemDto').ItemType) => void;
  onRemove?: (id: string | number) => void;
}
