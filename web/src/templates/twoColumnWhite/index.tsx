import type { TemplateDefinition } from "../types";
import TwoColumnWhiteLayout from "./TwoColumnWhiteLayout";

const def: TemplateDefinition = {
  id: "white",
  title: "White",
  ThemeClass: "tpl-two-column-white",
  sections: [
    {
      id: "left",
      type: "user",
      title: "Left",
      columns: 1,
      rows: 2,
      allowedItemTypes: ["text"],
      items: [],
    },
    {
      id: "right",
      type: "projects",
      title: "Right",
      columns: 2,
      rows: 1,
      allowedItemTypes: ["text"],
      items: [],
    },
    {
      id: "bottom",
      type: "experience",
      title: "Bottom",
      columns: 3,
      rows: 2,
      allowedItemTypes: ["text", "doubleText"],
      items: [],
    },
  ],
  Layout: TwoColumnWhiteLayout,
};

export default def;
