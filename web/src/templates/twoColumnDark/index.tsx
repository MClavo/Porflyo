import type { TemplateDefinition } from "../types";
import TwoColumnDarkLayout from "./TwoColumnDarkLayout";

const def: TemplateDefinition = {
  id: "dark",
  title: "Dark",
  ThemeClass: "tpl-two-column-dark",
  sections: [
    {
      id: "left",
      type: "text",
      title: "Left",
      columns: 1,
      rows: 2,
      allowedItemTypes: ["text"],
      items: [],
    },
    {
      id: "right",
      type: "text",
      title: "Right",
      columns: 2,
      rows: 1,
      allowedItemTypes: ["text"],
      items: [],
    },
    {
      id: "bottom",
      type: "text",
      title: "Bottom",
      columns: 3,
      rows: 2,
      allowedItemTypes: ["text", "doubleText"],
      items: [],
    },
  ],
  Layout: TwoColumnDarkLayout,
};

export default def;
