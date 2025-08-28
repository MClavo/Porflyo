// Types for different kinds of items that can be added to portfolio sections

export type ItemType = 'text' | 'character' | 'doubleText' | 'savedItem' | 'textPhoto';

export interface BaseItem {
  id: number;
  type: ItemType;
  sectionType: import('./sectionDto').SectionType;
}

export interface TextItem extends BaseItem {
  type: 'text';
  text: string;
}

export interface CharacterItem extends BaseItem {
  type: 'character';
  character: string;
}

export interface DoubleTextItem extends BaseItem {
  type: 'doubleText';
  text1: string;
  text2: string;
}

export interface TextPhotoItem extends BaseItem {
  type: 'textPhoto';
  text1: string;
  text2: string;
  imageUrl: string;
}

export interface SavedItem extends BaseItem {
  type: 'savedItem';
  savedName: string;
  dbId?: string; // ID from the database - optional for backward compatibility or error cases
  originalItem: TextItem | CharacterItem | DoubleTextItem | TextPhotoItem;
}

export type PortfolioItem = TextItem | CharacterItem | DoubleTextItem | SavedItem | TextPhotoItem;