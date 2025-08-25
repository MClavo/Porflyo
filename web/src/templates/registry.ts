import type { TemplateDefinition } from './types';

const registry: Record<string, TemplateDefinition> = {};

export function registerTemplate(t: TemplateDefinition) {
  registry[t.id] = t;
}

export function getTemplate(id: string) {
  return registry[id];
}

export function listTemplates() {
  return Object.values(registry);
}
