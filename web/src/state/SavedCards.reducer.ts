import { produce } from "immer";
import type { SavedCardsState, SavedCardsAction } from "./SavedCards.types";
import { createSavedSection, deleteSavedSection } from "../api/clients/savedSections.api";
import type { SavedSectionCreateDto, PortfolioSection } from "../api/types";
import type { AnyCard } from "./Cards.types";

const genId = () => crypto.randomUUID();

/**
 * Convert AnyCard to PortfolioSection format for API
 * Adds createdAt timestamp to the content
 */
function cardToPortfolioSection(card: AnyCard, sectionType: string, createdAt: number): PortfolioSection {
  // Add createdAt to the card content before stringifying
  const cardWithTimestamp = {
    ...card,
    createdAt
  };
  
  return {
    sectionType,
    title: "", // Not used for saved cards
    content: JSON.stringify(cardWithTimestamp),
    media: []
  };
}

/**
 * Save card to backend API
 * Returns the complete PublicSavedSectionDto
 */
export async function saveCardToApi(
  card: AnyCard,
  originSectionType: string,
  name: string
): Promise<import("../api/types").PublicSavedSectionDto> {
  const createdAt = Date.now();
  const section = cardToPortfolioSection(card, originSectionType, createdAt);
  const createDto: SavedSectionCreateDto = {
    name: name.trim() || `${card.type} - ${new Date().toLocaleString()}`,
    section
  };
  
  const response = await createSavedSection(createDto);
  if (!response.data) {
    throw new Error("Failed to save card: no data returned");
  }
  
  return response.data;
}

/**
 * Delete card from backend API
 */
export async function deleteCardFromApi(apiId: string): Promise<void> {
  await deleteSavedSection(apiId);
}

export const savedCardsReducer = (state: SavedCardsState, action: SavedCardsAction): SavedCardsState =>
  produce(state, (draft) => {
    switch (action.type) {
      case "SAVE_CARD": {
        const { card, originSectionId, originSectionType, name, apiId } = action.payload;
        const savedCardId = genId();
        
        // Crear una copia profunda del card
        const cardCopy = {
          ...card,
          id: genId(), // Nuevo ID para la copia
          data: JSON.parse(JSON.stringify(card.data)) // Deep copy de los datos
        };

        draft.savedCards[savedCardId] = {
          id: savedCardId,
          name: name.trim() || `${card.type} - ${new Date().toLocaleString()}`,
          card: cardCopy,
          originSectionId,
          originSectionType,
          createdAt: Date.now(),
          apiId
        };
        return;
      }

      case "REMOVE_SAVED_CARD": {
        const { savedCardId } = action.payload;
        delete draft.savedCards[savedCardId];
        return;
      }

      case "LOAD_SAVED_CARDS": {
        const { savedCards } = action.payload;
        draft.savedCards = savedCards;
        return;
      }

      case "CLEAR_ALL_SAVED_CARDS": {
        draft.savedCards = {};
        return;
      }
    }
  });

export const initialSavedCardsState: SavedCardsState = {
  savedCards: {}
};
