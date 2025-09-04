import type { TemplateDefinition } from "../types";
import TemplateLayout from "./TemplateLayout";

// Export the template definition directly. Do not attempt to register via a
// side-effect call to the registry — that causes a circular import/runtime
// initialization issue. The registry should import known templates directly.
const def: TemplateDefinition = {
  id: "template-example",
  title: "Template Example",
  ThemeClass: "tpl-example",
  sections: [
    {
      id: "user",
      type: "user",
      title: "Perfil",
      columns: 3,
      rows: 1,
      allowedItemTypes: ["text"],
      items: [],
    },
    {
      id: "projects",
      type: "projects",
      title: "Proyectos",
      columns: 2,
      rows: 3,
      allowedItemTypes: ["doubleText", "text"],
      items: [],
    },
    {
      id: "experience",
      type: "experience",
      title: "Experiencia",
      columns: 1,
      rows: 5,
      allowedItemTypes: ["text", "character"],
      items: [],
    },
  ],
  Layout: TemplateLayout,
};

export default def;
