import type { AnyCard } from "./Cards.types";

export type SavedCard = {
  id: string;
  name: string;
  card: AnyCard;
  originSectionId: string;
  originSectionType: string;
  createdAt: number;
  apiId?: string; // ID from the backend API
};

export type SavedCardsState = {
  savedCards: Record<string, SavedCard>;
};

export type SavedCardsAction =
  | { type: "SAVE_CARD"; payload: { card: AnyCard; originSectionId: string; originSectionType: string; name: string; apiId?: string } }
  | { type: "REMOVE_SAVED_CARD"; payload: { savedCardId: string } }
  | { type: "CLEAR_ALL_SAVED_CARDS" }
  | { type: "LOAD_SAVED_CARDS"; payload: { savedCards: Record<string, SavedCard> } };
