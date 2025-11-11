import { produce } from "immer";
import type { PortfolioState } from "./Portfolio.types";
import type { Action } from "./Portfolio.actions";
import type { AboutSectionData } from "../components/sections/AboutSection.types";
//import { cardFactories } from "../Templates"; // factories per card type
import { createCard } from "./Cards.registry";
// import type { CardPatchByType } from "./Cards.types";
/* import { sectionRulesByTemplate } from "../templates"; */

// TODO: Define TemplateKey type from available templates

// runtime-only IDs are created by createCard helper when needed

export const portfolioReducer = (state: PortfolioState, action: Action): PortfolioState =>
  produce(state, (draft) => {
    switch (action.type) {
      case "LOAD_PORTFOLIO":
        return action.payload;

      case "SWITCH_TEMPLATE": {
        const template = action.payload.template;
        draft.template = template; // only switch template key
        return;
      }

      case "UPDATE_TITLE": {
        draft.title = action.payload.title;
        return;
      }

      case "RENAME_SECTION": {
        const s = draft.sections[action.payload.sectionId];
        if (s) s.title = action.payload.title;
        return;
      }


      case "CONFIGURE_SECTION": {
        const s = draft.sections[action.payload.sectionId];
        if (!s) return;
        s.allowedTypes = action.payload.allowedTypes.slice();
        s.maxCards = action.payload.maxCards;
        return;
      }


      case "ADD_CARD": {
        const { sectionId, cardType, initialData } = action.payload;
        const s = draft.sections[sectionId];
        if (!s) return;
        if (!s.allowedTypes.includes(cardType)) return;
        if (typeof s.maxCards === "number" && s.cardsOrder.length >= s.maxCards) return;
        const { id, card } = createCard(cardType);

        // If initialData is provided, merge into the newly created card data
        if (initialData && typeof initialData === "object") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (card.data as any) = { ...card.data, ...(initialData as any) };
        }

        s.cardsById[id] = card;
        s.cardsOrder.push(id);
        return;
      }


      case "REMOVE_CARD": {
        const { sectionId, cardId } = action.payload;
        const s = draft.sections[sectionId];
        if (!s) return;
        delete s.cardsById[cardId];
        s.cardsOrder = s.cardsOrder.filter((x) => x !== cardId);
        return;
      }


      case "MOVE_CARD": {
        const { sectionId, from, to } = action.payload;
        const s = draft.sections[sectionId];
        if (!s) return;
        const arr = s.cardsOrder;
        if (from < 0 || to < 0 || from >= arr.length || to >= arr.length) return;
        const [item] = arr.splice(from, 1);
        arr.splice(to, 0, item);
        return;
      }


      case "PATCH_CARD": {
        const { sectionId, cardId, cardType, patch } = action.payload;
        const s = draft.sections[sectionId];
        if (!s) return;
        const existing = s.cardsById[cardId];
        if (!existing || existing.type !== cardType) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (existing.data as any) = { ...existing.data, ...(patch as any) };
        return;
      }

      case "REPLACE_IMAGE_URLS": {
        const { urlMapping } = action.payload;

        // Replace URLs in all cards across all sections
        Object.values(draft.sections).forEach(section => {
          Object.values(section.cardsById).forEach(card => {
            if (card.data) {
              replaceUrlsInCardData(card.data as Record<string, unknown>, urlMapping);
            }
          });
        });
        return;
      }

      case "PATCH_SECTION_CONTENT": {
        const { sectionId, data } = action.payload;
        const s = draft.sections[sectionId];
        if (!s) return;

        // Merge partial data into existing parsedContent
        if (s.parsedContent && typeof s.parsedContent === 'object') {
          s.parsedContent = { ...s.parsedContent, ...data } as AboutSectionData;
        } else {
          s.parsedContent = data as AboutSectionData;
        }
        return;
      }
    }
  });

/**
 * Recursively replace URLs in card data
 */
function replaceUrlsInCardData(obj: Record<string, unknown>, urlMapping: Record<string, string>): void {
  Object.keys(obj).forEach(key => {
    const value = obj[key];

    if (typeof value === 'string' && urlMapping[value]) {
      obj[key] = urlMapping[value];
    } else if (Array.isArray(value)) {
      obj[key] = value.map(item =>
        typeof item === 'string' && urlMapping[item] ? urlMapping[item] : item
      );
    } else if (value && typeof value === 'object') {
      replaceUrlsInCardData(value as Record<string, unknown>, urlMapping);
    }
  });
}