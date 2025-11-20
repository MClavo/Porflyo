import { createContext } from "react";
import type { SavedCardsState, SavedCardsAction } from "./SavedCards.types";
import type { AnyCard } from "./Cards.types";
import type { PublicSavedSectionDto } from "../api/types";

export type SavedCardsContextType = {
  state: SavedCardsState;
  dispatch: React.Dispatch<SavedCardsAction>;
  saveCard: (card: AnyCard, originSectionId: string, originSectionType: string, name: string) => Promise<PublicSavedSectionDto>;
  removeCard: (savedCardId: string) => Promise<void>;
  loadFromSavedSections: (sections: PublicSavedSectionDto[]) => void;
};

export const SavedCardsContext = createContext<SavedCardsContextType | null>(null);
