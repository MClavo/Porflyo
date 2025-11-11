import type { TemplateDefinition } from "../Template.types";
import GlassLayout from "./GlassLayout";

const def: TemplateDefinition = {
  id: "glass",
  title: "Glass",
  ThemeClass: "tpl-glass",
  sections: [
    {
      id: "experiences",
      type: "experiences",
      title: "Experience",
      maxCards: 3,
      allowedTypes: ["job", "text"],
      cardsById: {},
      cardsOrder: [],
    },
    {
      id: "projects", 
      type: "projects",
      title: "Projects",
      maxCards: 6,
      allowedTypes: ["project", "text"],
      cardsById: {},
      cardsOrder: [],
    },
    {
      id: "text",
      type: "text", 
      title: "Skills",
      maxCards: 4,
      allowedTypes: ["text"],
      cardsById: {},
      cardsOrder: [],
    },
    {
      id: "about",
      type: "about",
      title: "About",
      maxCards: 1,
      allowedTypes: ["about"],
      cardsById: {},
      cardsOrder: [],
    },
  ],
  Layout: GlassLayout,
};

export default def;