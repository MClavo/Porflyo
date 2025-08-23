import type { ItemType } from '../types/itemDto';

export interface TypeDialogState {
    isOpen: boolean;
    sectionId: string;
    position: { x: number; y: number };
    allowedTypes: ItemType[];
}
