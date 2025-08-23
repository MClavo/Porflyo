import type { TemplateMeta, TemplateId, TemplatesRegistry } from './types';
import { DefaultTemplate } from './default/DefaultTemplate';
import { AtsTemplate } from './ats/AtsTemplate';
import { SlotsTemplate } from './slots/SlotsTemplate';
import MvpTemplate from '../../../templates/mvp-01/MvpTemplate';

// Re-export types
export type { TemplateMeta, TemplateId, TemplatesRegistry } from './types';

/**
 * Default template - vertical stack; responsive; shows images if present
 */
const defaultTemplateMeta: TemplateMeta = {
  id: 'default',
  name: 'Default',
  supportsImages: true,
  layout: 'vertical',
  notes: 'Clean, professional layout with vertical sections',
  Render: DefaultTemplate,
};

/**
 * ATS template - text-only (no images). Auto-includes user social + email; 
 * banner "ATS template: text-only"
 */
const atsTemplateMeta: TemplateMeta = {
  id: 'ats',
  name: 'ATS Optimized',
  supportsImages: false,
  layout: 'vertical',
  notes: 'Text-only format optimized for Applicant Tracking Systems',
  constraints: {
    forbidImages: true,
  },
  Render: AtsTemplate,
};

/**
 * Slots template - rows that can host 2–3 sections horizontally; 
 * on mobile collapse to vertical
 */
const slotsTemplateMeta: TemplateMeta = {
  id: 'slots',
  name: 'Grid Slots',
  supportsImages: true,
  layout: 'grid',
  notes: 'Modern card-based grid layout with 2-3 sections per row',
  Render: SlotsTemplate,
};

/**
 * MVP-01 template - minimal zones for editor MVP
 */
const mvpTemplateMeta: TemplateMeta = {
  id: 'mvp-01',
  name: 'MVP 01',
  supportsImages: true,
  layout: 'vertical',
  notes: 'Minimal MVP template with profile, projects and experience zones',
  Render: MvpTemplate,
};

/**
 * Registry of all available templates
 */
export const TEMPLATES: TemplatesRegistry = {
  default: defaultTemplateMeta,
  ats: atsTemplateMeta,
  slots: slotsTemplateMeta,
  'mvp-01': mvpTemplateMeta,
};

/**
 * Default template ID
 */
export const DEFAULT_TEMPLATE: TemplateId = 'default';

/**
 * Get template metadata by ID
 */
export function getTemplate(id: TemplateId): TemplateMeta {
  return TEMPLATES[id];
}

/**
 * Get all available template IDs
 */
export function getTemplateIds(): TemplateId[] {
  return Object.keys(TEMPLATES) as TemplateId[];
}

/**
 * Get all template metadata
 */
export function getAllTemplates(): TemplateMeta[] {
  return Object.values(TEMPLATES);
}

/**
 * Check if a template supports images
 */
export function templateSupportsImages(id: TemplateId): boolean {
  return TEMPLATES[id].supportsImages;
}

/**
 * Check if a template forbids images
 */
export function templateForbidsImages(id: TemplateId): boolean {
  return TEMPLATES[id].constraints?.forbidImages === true;
}
