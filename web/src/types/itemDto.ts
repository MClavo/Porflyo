// Types for different kinds of items that can be added to portfolio sections

export type ItemType = 'text' | 'character' | 'doubleText';

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

export type PortfolioItem = TextItem | CharacterItem | DoubleTextItem;