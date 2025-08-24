import type { UniqueIdentifier } from '@dnd-kit/core';

export type PortfolioItems = Record<string, UniqueIdentifier[]>;

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
  index: number;
  zone: PortfolioZone;
}

export interface DroppableZoneProps {
  children: React.ReactNode;
  zone: PortfolioZone;
  items: UniqueIdentifier[];
}
