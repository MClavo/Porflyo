import type { UniqueIdentifier } from '@dnd-kit/core';
import type { PortfolioItem } from '../../features/portfolios/types/itemDto';

// Keep IDs simple for DnD, but also track the actual portfolio items
export type PortfolioItems = Record<string, UniqueIdentifier[]>;
export type PortfolioItemsData = Record<UniqueIdentifier, PortfolioItem>;

export interface PortfolioZone {
  id: string;
  label: string;
  zoneType: 'about' | 'cards-grid' | 'list';
  allowed: string[];
  maxItems: number;
  color: string;
}

export interface SortableItemProps {
  id: UniqueIdentifier;
  item: PortfolioItem;
  index: number;
  zone: PortfolioZone;
  onItemUpdate: (id: UniqueIdentifier, updatedItem: PortfolioItem) => void;
}

export interface DroppableZoneProps {
  children: React.ReactNode;
  zone: PortfolioZone;
  items: UniqueIdentifier[];
  itemsData: PortfolioItemsData;
  onItemUpdate: (id: UniqueIdentifier, updatedItem: PortfolioItem) => void;
}
