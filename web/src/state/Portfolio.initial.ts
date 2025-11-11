import type { TemplateKey } from "../templates/Template.types";
import type { PortfolioState } from "./Portfolio.types";


export const buildInitialState = (template:TemplateKey): PortfolioState => {

  return {
    template: template,
    title: "",
    sections: {
      projects: {
        id: "projects",
        type: "projects",
        title: "Projects",
        allowedTypes: ["project", "job"],
        maxCards: 4,
        cardsById: {},
        cardsOrder: [],
      },
      experiences: {
        id: "experiences",
        type: "experiences", 
        title: "Experience",
        allowedTypes: ["job"],
        maxCards: 3,
        cardsById: {},
        cardsOrder: [],
      },
      contact: {
        id: "text",
        type: "text",
        title: "text",
        allowedTypes: ["text"],
        maxCards: 4,
        cardsById: {},
        cardsOrder: [],
      },
    }
  }
}