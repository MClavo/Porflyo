import type { TemplateDefinition, TemplateSectionDefinition } from '../types';
import type { PortfolioSection } from '../../types/sectionDto';

type SavedSectionPartial = Partial<PortfolioSection> & { id: string };

/**
 * Merge template default sections with saved sections from storage.
 * - Template provides the canonical section ids, allowed types, defaults.
 * - Saved sections can override title, layoutType, maxItems, allowedItemTypes and items order.
 */
export function mergeSavedSectionsWithTemplate(template: TemplateDefinition, savedSections?: SavedSectionPartial[]): PortfolioSection[] {
  const savedMap = (savedSections || []).reduce<Record<string, SavedSectionPartial>>((acc, s) => {
    acc[s.id] = s;
    return acc;
  }, {});

  return template.defaultSections.map((def: TemplateSectionDefinition) => {
    const saved = savedMap[def.id];

    const section: PortfolioSection = {
      id: def.id,
      // Prefer saved.type if present, otherwise try to infer from def.id (best-effort)
      type: (saved?.type ?? (def.id as unknown)) as PortfolioSection['type'],
      title: saved?.title ?? def.title,
      layoutType: (saved?.layoutType ?? def.layoutType ?? 'column') as PortfolioSection['layoutType'],
      maxItems: saved?.maxItems ?? def.maxItems ?? 1,
      allowedItemTypes: saved?.allowedItemTypes ?? def.allowedItemTypes ?? [],
      items: saved?.items ?? [],
    };

    return section;
  });
}

export default mergeSavedSectionsWithTemplate;
