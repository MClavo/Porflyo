import type { Template } from "../../../../../../Users/mauro/Desktop/Nueva carpeta/components/portfolio/types";

export const CLEAN_01: Template = {
  id: "clean-01",
  version: 1,
  name: "Clean",
  zones: [
    {
      id: "hero",
      label: "Hero",
      zoneType: "hero",
      allowed: ["profileHeader"],
      maxItems: 1,
      variants: ["minimal", "photo-left"],
      defaultVariant: "minimal"
    },
    {
      id: "about",
      label: "About",
      zoneType: "about",
      allowed: ["about", "markdown"],
      maxItems: 1,
      variants: ["text-only", "text+image-right"],
      defaultVariant: "text-only"
    },
    {
      id: "projects",
      label: "Projects",
      zoneType: "cards-grid",
      allowed: ["project"],
      maxItems: 4,
      variants: ["2x2", "carousel"],
      defaultVariant: "2x2"
    },
    {
      id: "skills",
      label: "Skills",
      zoneType: "list",
      allowed: ["skillGroup"],
      maxItems: 12,
      variants: ["chips", "grouped-columns"],
      defaultVariant: "chips"
    },
    {
      id: "socials",
      label: "Socials",
      zoneType: "socials",
      allowed: ["socialLinks"],
      maxItems: 1,
      variants: ["inline", "centered"],
      defaultVariant: "inline"
    }
  ]
};

export default CLEAN_01;
