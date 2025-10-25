import type { TemplateKey } from "./Template.types";
import type { TemplateLayoutComponentProps } from "./Template.types";
import Template1Layout from "./template1/template1Layout";
import Template2Layout from "./template2/template2Layout";
import GlassLayout from "./glass/GlassLayout";

// return a React component for a given template key; fallback to template1
export const getLayout = (templateId: TemplateKey): React.FC<TemplateLayoutComponentProps> => {
  const map: Record<TemplateKey, React.FC<TemplateLayoutComponentProps>> = {
    template1: Template1Layout,
    template2: Template2Layout as React.FC<TemplateLayoutComponentProps>,
    glass: GlassLayout as React.FC<TemplateLayoutComponentProps>,
  };
  return map[templateId] ?? Template1Layout;
};


