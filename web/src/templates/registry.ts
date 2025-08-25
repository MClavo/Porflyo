import type { TemplateDefinition } from './types';

// Import templates here so they register themselves when this module is imported.
// Add new template imports as you create new templates.
// Instead of self-registering templates (which causes circular import/runtime
// initialization errors), import known template definitions and build a
// static registry map. Add new templates here as they are created.
import templateExample from './templateExample';
import twoColumnDark from './twoColumnDark';

const registry: Record<string, TemplateDefinition> = {
  [templateExample.id]: templateExample,
  [twoColumnDark.id]: twoColumnDark,
};

export function getTemplate(id: string) {
  return registry[id];
}

export function listTemplates() {
  return Object.values(registry);
}
