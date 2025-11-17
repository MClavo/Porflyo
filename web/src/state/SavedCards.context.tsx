import React, { createContext, useReducer, useCallback } from "react";
import { savedCardsReducer, initialSavedCardsState, saveCardToApi, deleteCardFromApi } from "./SavedCards.reducer";
import type { SavedCardsState, SavedCardsAction, SavedCard } from "./SavedCards.types";
import type { AnyCard } from "./Cards.types";
import type { PublicSavedSectionDto } from "../api/types";

type SavedCardsContextType = {
  state: SavedCardsState;
  dispatch: React.Dispatch<SavedCardsAction>;
  saveCard: (card: AnyCard, originSectionId: string, originSectionType: string, name: string) => Promise<PublicSavedSectionDto>;
  removeCard: (savedCardId: string) => Promise<void>;
  loadFromSavedSections: (sections: PublicSavedSectionDto[]) => void;
};

export const SavedCardsContext = createContext<SavedCardsContextType | null>(null);

/**
 * Convert PublicSavedSectionDto to SavedCard
 * Extracts createdAt from the card content and removes it
 */
function savedSectionToSavedCard(section: PublicSavedSectionDto): SavedCard | null {
  try {
    // Parse the content which should be a JSON string containing the card with createdAt
    const cardWithTimestamp = JSON.parse(section.section.content) as AnyCard & { createdAt?: number };
    
    // Extract createdAt and remove it from the card
    const { createdAt, ...card } = cardWithTimestamp;
    
    return {
      id: crypto.randomUUID(), // Generate a local ID
      name: section.name,
      card: card as AnyCard,
      originSectionId: "", // Not stored in saved sections
      originSectionType: section.section.sectionType,
      createdAt: createdAt || Date.now(), // Use extracted createdAt or fallback to current time
      apiId: section.id // Store the backend ID
    };
  } catch (error) {
    console.error("Failed to parse saved section:", error);
    return null;
  }
}

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
