import type { TemplateDefinition } from "../Template.types";
import AtsLayout from "./AtsLayout";

const def: TemplateDefinition = {
  id: "ats",
  title: "ATS",
  ThemeClass: "tpl-ats",
  sections: [
    {
      id: "about",
      type: "about",
      title: "About",
      maxCards: 1,
      allowedTypes: ["about"],
      cardsById: {},
      cardsOrder: [],
    },
    {
      id: "experiences",
      type: "experiences",
      title: "Experience",
      maxCards: 10,
      allowedTypes: ["job", "text"],
      cardsById: {},
      cardsOrder: [],
    },
    {
      id: "education",
      type: "education",
      title: "Education",
      maxCards: 5,
      allowedTypes: ["education", "text"],
      cardsById: {},
      cardsOrder: [],
    },
    {
      id: "projects", 
      type: "projects",
      title: "Projects",
      maxCards: 10,
      allowedTypes: ["project", "text"],
      cardsById: {},
      cardsOrder: [],
    },
    {
      id: "achievements",
      type: "achievements",
      title: "Certifications",
      maxCards: 10,
      allowedTypes: ["certificate", "text"],
      cardsById: {},
      cardsOrder: [],
    },
  ],
  Layout: AtsLayout,
};

export default def;
