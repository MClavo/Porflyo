import type { AnyCard, CardType, CardDto } from "./Cards.types";
import type { AboutSectionData } from "../components/sections/AboutSection.types";

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
  // Optional transient preview index used during drag-over to show insertion position
  previewIndex?: number | null;
  // Optional transient preview card used during drag-over to render exact preview
  previewCard?: AnyCard | null;
  
  // Special field for sections without cards (e.g., 'about')
  // Contains parsed structured data instead of card list
  parsedContent?: AboutSectionData | unknown;
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