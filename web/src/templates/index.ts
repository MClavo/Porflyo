import type { TemplateKey } from "./Template.types";
import type { TemplateLayoutComponentProps } from "./Template.types";
import GlassLayout from "./glass/GlassLayout";
import AtsLayout from "./ats/AtsLayout";

// return a React component for a given template key; default to GlassLayout
export const getLayout = (templateId: TemplateKey): React.FC<TemplateLayoutComponentProps> => {
  const map: Record<TemplateKey, React.FC<TemplateLayoutComponentProps>> = {
    glass: GlassLayout as React.FC<TemplateLayoutComponentProps>,
    ats: AtsLayout as React.FC<TemplateLayoutComponentProps>,
  };
  return map[templateId] ?? GlassLayout;
};


