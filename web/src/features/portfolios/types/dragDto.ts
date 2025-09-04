/* // Types for drag and drop functionality

export interface DragData {
  sectionId: string;
  itemId: number;
  itemType: import('../../../types/itemDto').ItemType;
  originalIndex: number;
}

export interface DropResult {
  sourceSectionId: string;
  targetSectionId: string;
  sourceIndex: number;
  targetIndex: number;
  itemId: number;
  itemType: import('../../../types/itemDto').ItemType;
}

export type DropTargetType = 
  | 'item' // Dropping on top of another item
  | 'section' // Dropping on section (append to end)
  | 'drop-zone'; // Dropping on specific position

export interface DropTargetData {
  type: DropTargetType;
  sectionId: string;
  itemId?: number; // Only for 'item' type
  index?: number; // For 'drop-zone' type, or calculated for 'item' type
}
 */