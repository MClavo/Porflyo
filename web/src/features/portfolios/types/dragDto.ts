// Types for drag and drop functionality

export interface DragData {
  sectionId: string;
  itemId: number;
  itemType: import('./itemDto').ItemType;
  originalIndex: number;
}

export interface DropResult {
  sourceSectionId: string;
  targetSectionId: string;
  sourceIndex: number;
  targetIndex: number;
  itemId: number;
  itemType: import('./itemDto').ItemType;
}
