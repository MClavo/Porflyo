import type { PortfolioState } from "../../state/Portfolio.types";
import { createDefaultAboutData } from "../sections/AboutSection.types";

/**
 * Creates a fresh initial empty portfolio state for creating new portfolios from scratch.
 * Contains all standard sections but no cards. Always returns a new object.
 */
export function createInitialEmptyPortfolio(): PortfolioState {
  return {
    template: "glass",
    title: "",
    sections: {
      about: {
        id: "about",
        type: "about",
        title: "About Me",
        allowedTypes: [],
        maxCards: 0,
        cardsById: {},
        cardsOrder: [],
        parsedContent: createDefaultAboutData(),
      },
      projects: {
        id: "projects",
        type: "projects",
        title: "Projects",
        allowedTypes: ["project", "job"],
        maxCards: 3,
        cardsById: {},
        cardsOrder: [],
      },
      experiences: {
        id: "experiences",
        type: "experiences", 
        title: "Experience",
        allowedTypes: ["job"],
        maxCards: 2,
        cardsById: {},
        cardsOrder: [],
      },
      text: {
        id: "text",
        type: "text",
        title: "Text",
        allowedTypes: ["text"],
        maxCards: 2,
        cardsById: {},
        cardsOrder: [],
      },
    },
  };
}

/**
 * @deprecated Use createInitialEmptyPortfolio() instead for guaranteed fresh objects
 */
export const initialEmptyPortfolio: PortfolioState = createInitialEmptyPortfolio();