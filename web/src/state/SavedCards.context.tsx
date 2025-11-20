import React, { useReducer, useCallback } from "react";
import { savedCardsReducer, initialSavedCardsState, saveCardToApi, deleteCardFromApi } from "./SavedCards.reducer";
import type { SavedCard } from "./SavedCards.types";
import type { AnyCard } from "./Cards.types";
import type { PublicSavedSectionDto } from "../api/types";
import { savedSectionToSavedCard } from "./SavedCards.utils";
import { SavedCardsContext } from "./SavedCards.createContext";

export function SavedCardsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(savedCardsReducer, initialSavedCardsState);

  const saveCard = useCallback(async (
    card: AnyCard,
    originSectionId: string,
    originSectionType: string,
    name: string
  ): Promise<PublicSavedSectionDto> => {
    try {
      // Save to backend first and get the complete saved section
      const savedSection = await saveCardToApi(card, originSectionType, name);
      
      // Then update local state
      dispatch({
        type: "SAVE_CARD",
        payload: { card, originSectionId, originSectionType, name, apiId: savedSection.id }
      });
      
      return savedSection;
    } catch (error) {
      console.error("Failed to save card:", error);
      throw error;
    }
  }, []);

  const removeCard = useCallback(async (savedCardId: string) => {
    try {
      const savedCard = state.savedCards[savedCardId];
      
      // Delete from backend if it has an apiId
      if (savedCard?.apiId) {
        await deleteCardFromApi(savedCard.apiId);
      }
      
      // Then update local state
      dispatch({
        type: "REMOVE_SAVED_CARD",
        payload: { savedCardId }
      });
    } catch (error) {
      console.error("Failed to remove card:", error);
      throw error;
    }
  }, [state.savedCards]);

  const loadFromSavedSections = useCallback((sections: PublicSavedSectionDto[]) => {
    const savedCards: Record<string, SavedCard> = {};
    
    for (const section of sections) {
      const savedCard = savedSectionToSavedCard(section);
      if (savedCard) {
        savedCards[savedCard.id] = savedCard;
      }
    }
    
    dispatch({
      type: "LOAD_SAVED_CARDS",
      payload: { savedCards }
    });
  }, []);

  return (
    <SavedCardsContext.Provider value={{ state, dispatch, saveCard, removeCard, loadFromSavedSections }}>
      {children}
    </SavedCardsContext.Provider>
  );
}
