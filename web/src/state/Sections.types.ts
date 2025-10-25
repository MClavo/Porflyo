import type { AnyCard, CardType, CardDto } from "./Cards.types";

export type SectionId = string;
export type CardId = string;

export type SectionType = 
  | 'savedItems'
  | 'user' 
  | 'about'
  | 'experiences' 
  | 'projects' 
  | 'education' 
  | 'skills' 
  | 'text' 
  | 'achievements' 
  | 'contact';


export type SectionState = {
  id: SectionId;
  type: SectionType;
  title: string;
 /*  columns: number;
  rows: number; */
  maxCards?: number;  // Computed as rows * columns
  allowedTypes: CardType[];
  cardsById: Record<CardId, AnyCard>;
  cardsOrder: CardId[];
}

/* Compute max items for a section as rows * columns. */
/* export function getMaxItems(section: SectionState): number {
  return section.columns * section.rows;
} */


/* export type SectionsState = {
  sectionsById: Record<SectionId, SectionState>;
  sectionsOrder: SectionId[];
} */

export type SectionDto = {
  id: SectionId;        // persisted (fixed ID across templates)
  title: string;        // persisted
  items: CardDto[];     // persisted (No runtime IDs)
}