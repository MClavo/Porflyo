import type { Template } from "../../../../../Users/mauro/Desktop/Nueva carpeta/components/portfolio/types";
import CLEAN_01 from "./clean-01/template";
import BOLD_01 from "./bold-01/template";

// Template registry
export const TEMPLATE_REGISTRY: Record<string, Template> = {
  [CLEAN_01.id]: CLEAN_01,
  [BOLD_01.id]: BOLD_01,
};

// Template utility functions
export function getTemplateById(id: string): Template | undefined {
  return TEMPLATE_REGISTRY[id];
}

export function getDefaultTemplateId(): string {
  return "clean-01";
}

// Export theme components for direct import
export { CleanTheme } from "./clean-01/TemplateTheme";
export { BoldTheme } from "./bold-01/TemplateTheme";

// Export template objects
export { CLEAN_01, BOLD_01};
