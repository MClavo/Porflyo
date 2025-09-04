import type { UniqueIdentifier } from '@dnd-kit/core';
import type { PortfolioItem } from '../../types/itemDto';
import type {
  EditorPortfolioItems as PortfolioItems,
  EditorPortfolioItemsData as PortfolioItemsData,
} from '../../components/portfolio/dnd/EditorTypes';

export type DropState = 'allowed' | 'forbidden' | 'none';

export interface PendingSave {
  item: PortfolioItem;
  targetZone: string;
  targetId: string;
  originalItemId?: UniqueIdentifier; // ID del item original para sincronización
}

export interface PendingDelete {
  id: UniqueIdentifier;
  item: PortfolioItem;
}

export type SectionDropStates = Record<string, DropState>;

export type ItemsRef = {
  items: PortfolioItems;
  setItems: React.Dispatch<React.SetStateAction<PortfolioItems>>;
  itemsData: PortfolioItemsData;
  setItemsData: React.Dispatch<React.SetStateAction<PortfolioItemsData>>;
};
