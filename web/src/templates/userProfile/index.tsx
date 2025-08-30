import type { TemplateDefinition } from "../types";
import UserProfileLayout from "./UserProfileLayout";

const def: TemplateDefinition = {
  id: "userProfile",
  title: "User Profile",
  ThemeClass: "tpl-user-profile",
  sections: [
    {
      id: "user",
      type: "user",
      title: "User Information",
      columns: 1,
      rows: 1,
      allowedItemTypes: ["userProfile"],
      items: [],
    },
    {
      id: "experience",
      type: "experience",
      title: "Experience",
      columns: 1,
      rows: 3,
      allowedItemTypes: ["text", "doubleText"],
      items: [],
    },
    {
      id: "projects", 
      type: "projects",
      title: "Projects",
      columns: 2,
      rows: 2,
      allowedItemTypes: ["text", "doubleText", "textPhoto"],
      items: [],
    },
    {
      id: "skills",
      type: "skills", 
      title: "Skills",
      columns: 3,
      rows: 2,
      allowedItemTypes: ["text", "character"],
      items: [],
    },
  ],
  Layout: UserProfileLayout,
};

export default def;
