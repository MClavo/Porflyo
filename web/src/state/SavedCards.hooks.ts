import { useContext } from "react";
import { SavedCardsContext } from "./SavedCards.context";

export function useSavedCards() {
  const context = useContext(SavedCardsContext);
  if (!context) {
    throw new Error("useSavedCards must be used within a SavedCardsProvider");
  }
  return context;
}
