import type { PortfolioState } from "../../state/Portfolio.types";

/**
 * Initial empty portfolio state for creating new portfolios from scratch.
 * Contains all standard sections but no cards.
 */
export const initialEmptyPortfolio: PortfolioState = {
  template: "template1",
  title: "",
  sections: {
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