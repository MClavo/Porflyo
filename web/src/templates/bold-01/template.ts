import type { Template } from "../../../../../../Users/mauro/Desktop/Nueva carpeta/components/portfolio/types";

export const BOLD_01: Template = {
  id: "bold-01",
  version: 1,
  name: "Bold",
  zones: [
    {
      id: "hero",
      label: "Hero Section",
      zoneType: "hero",
      allowed: ["profileHeader"],
      maxItems: 1,
      variants: ["minimal", "photo-left"],
      defaultVariant: "minimal"
    },
    {
      id: "about",
      label: "About Section",
      zoneType: "about",
      allowed: ["about", "markdown"],
      maxItems: 1,
      variants: ["text-only", "text+image-right"],
      defaultVariant: "text-only"
    },
    {
      id: "projects",
      label: "Featured Projects",
      zoneType: "cards-grid",
      allowed: ["project"],
      maxItems: 4,
      variants: ["2x2", "carousel"],
      defaultVariant: "carousel"
    },
    {
      id: "skills",
      label: "Skills & Expertise",
      zoneType: "list",
      allowed: ["skillGroup"],
      maxItems: 12,
      variants: ["chips", "grouped-columns"],
      defaultVariant: "grouped-columns"
    },
    {
      id: "socials",
      label: "Connect",
      zoneType: "socials",
      allowed: ["socialLinks"],
      maxItems: 1,
      variants: ["inline", "centered"],
      defaultVariant: "inline"
    }
  ]
};

export default BOLD_01;
