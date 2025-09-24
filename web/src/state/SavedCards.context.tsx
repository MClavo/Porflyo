import React, { createContext, useReducer } from "react";
import { savedCardsReducer, initialSavedCardsState } from "./SavedCards.reducer";
import type { SavedCardsState, SavedCardsAction } from "./SavedCards.types";

type SavedCardsContextType = {
  state: SavedCardsState;
  dispatch: React.Dispatch<SavedCardsAction>;
};

export const SavedCardsContext = createContext<SavedCardsContextType | null>(null);

export function SavedCardsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(savedCardsReducer, initialSavedCardsState);

  return (
    <SavedCardsContext.Provider value={{ state, dispatch }}>
      {children}
    </SavedCardsContext.Provider>
  );
}
