import { produce } from "immer";
import type { SavedCardsState, SavedCardsAction } from "./SavedCards.types";

const genId = () => crypto.randomUUID();

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
