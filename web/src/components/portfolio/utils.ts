import type { 
  PortfolioSection, 
  PublicPortfolioDto, 
  PortfolioCreateDto, 
  PortfolioPatchDto 
} from "../../types/dto";
import type { 
  SectionMeta, 
  PortfolioDraft, 
  Template, 
  EditorSectionType,
  ZoneType
} from "./types";

/**
 * Safely read section metadata
 */
export function readMeta(section: PortfolioSection): SectionMeta | null {
  if (!section._meta || typeof section._meta !== 'object') {
    return null;
  }
  
  const meta = section._meta as Record<string, unknown>;
  
  // Validate required fields
  if (!meta.sectionType || typeof meta.sectionType !== 'string') {
    return null;
  }
  
  return {
    sectionType: meta.sectionType as EditorSectionType,
    zoneId: meta.zoneId as string,
    zoneType: meta.zoneType as ZoneType,
    variant: meta.variant as string,
    version: meta.version as number
  };
}

/**
 * Write metadata to a section (returns shallow clone)
 */
export function writeMeta(section: PortfolioSection, meta: SectionMeta): PortfolioSection {
  return {
    ...section,
    _meta: meta
  };
}

/**
 * Initialize a draft from a template, optionally placing existing sections
 */
export function initDraftFromTemplate(
  template: Template, 
  existing?: PublicPortfolioDto | null
): PortfolioDraft {
  const draft: PortfolioDraft = {
    templateId: template.id,
    templateVersion: template.version,
    zones: {}
  };
  
  // Initialize all template zones as empty
  template.zones.forEach(zone => {
    draft.zones[zone.id] = {
      variant: zone.defaultVariant || zone.variants?.[0] || "",
      items: []
    };
  });
  
  // If no existing portfolio, return empty draft
  if (!existing?.sections?.length) {
    return draft;
  }
  
  const unplacedSections: PortfolioSection[] = [];
  
  // Try to place existing sections into zones
  existing.sections.forEach(section => {
    const meta = readMeta(section);
    let placed = false;
    
    // 1) Try exact zoneId match
    if (meta?.zoneId && draft.zones[meta.zoneId]) {
      const zone = template.zones.find(z => z.id === meta.zoneId);
      if (zone && zone.allowed.includes(meta.sectionType)) {
        draft.zones[meta.zoneId].items.push(section);
        placed = true;
      }
    }
    
    // 2) Try zoneType compatibility
    if (!placed && meta?.sectionType) {
      const compatibleZone = template.zones.find(zone => 
        zone.allowed.includes(meta.sectionType) && 
        draft.zones[zone.id].items.length < (zone.maxItems || Infinity)
      );
      
      if (compatibleZone) {
        draft.zones[compatibleZone.id].items.push(section);
        placed = true;
      }
    }
    
    // 3) Add to unplaced if no compatible zone found
    if (!placed) {
      unplacedSections.push(section);
    }
  });
  
  // Create virtual "unplaced" zone if needed
  if (unplacedSections.length > 0) {
    draft.zones["unplaced"] = {
      variant: "default",
      items: unplacedSections
    };
  }
  
  return draft;
}

/**
 * Switch from one template to another, preserving sections where possible
 */
export function switchTemplate(
  draft: PortfolioDraft, 
  _fromTpl: Template, 
  toTpl: Template
): { next: PortfolioDraft; unplaced: PortfolioSection[] } {
  const nextDraft: PortfolioDraft = {
    templateId: toTpl.id,
    templateVersion: toTpl.version,
    zones: {}
  };
  
  // Initialize all new template zones as empty
  toTpl.zones.forEach(zone => {
    nextDraft.zones[zone.id] = {
      variant: zone.defaultVariant || zone.variants?.[0] || "",
      items: []
    };
  });
  
  const unplacedSections: PortfolioSection[] = [];
  
  // Collect all sections from current draft
  const allSections: PortfolioSection[] = [];
  Object.values(draft.zones).forEach(zoneData => {
    allSections.push(...zoneData.items);
  });
  
  // Try to place sections in new template
  allSections.forEach(section => {
    const meta = readMeta(section);
    let placed = false;
    
    // 1) Try same zone id + same zone type
    if (meta?.zoneId) {
      const targetZone = toTpl.zones.find(z => z.id === meta.zoneId);
      if (targetZone && 
          targetZone.allowed.includes(meta.sectionType) &&
          nextDraft.zones[targetZone.id].items.length < (targetZone.maxItems || Infinity)) {
        nextDraft.zones[targetZone.id].items.push(section);
        placed = true;
      }
    }
    
    // 2) Try by zone type compatibility
    if (!placed && meta?.sectionType) {
      const compatibleZone = toTpl.zones.find(zone => 
        zone.allowed.includes(meta.sectionType) && 
        nextDraft.zones[zone.id].items.length < (zone.maxItems || Infinity)
      );
      
      if (compatibleZone) {
        // Update section metadata for new zone
        const updatedSection = writeMeta(section, {
          ...meta,
          zoneId: compatibleZone.id,
          zoneType: compatibleZone.zoneType,
          variant: compatibleZone.defaultVariant || compatibleZone.variants?.[0] || meta.variant
        });
        nextDraft.zones[compatibleZone.id].items.push(updatedSection);
        placed = true;
      }
    }
    
    // 3) Add to unplaced if no compatible zone found
    if (!placed) {
      unplacedSections.push(section);
    }
  });
  
  return { next: nextDraft, unplaced: unplacedSections };
}

/**
 * Flatten draft zones into a single array of sections
 */
export function flattenDraftToSections(draft: PortfolioDraft): PortfolioSection[] {
  const sections: PortfolioSection[] = [];
  
  Object.entries(draft.zones).forEach(([zoneId, zoneData]) => {
    // Skip the virtual "unplaced" zone
    if (zoneId === "unplaced") {
      return;
    }
    
    zoneData.items.forEach(section => {
      const currentMeta = readMeta(section);
      
      // Ensure section has proper metadata
      const updatedSection = writeMeta(section, {
        sectionType: currentMeta?.sectionType || "markdown" as EditorSectionType,
        zoneId: zoneId,
        zoneType: currentMeta?.zoneType || "list" as ZoneType,
        variant: zoneData.variant || currentMeta?.variant || "",
        version: currentMeta?.version || 1
      });
      
      sections.push(updatedSection);
    });
  });
  
  return sections;
}

/**
 * Build a PortfolioCreateDto from draft
 */
export function buildCreateDto(
  draft: PortfolioDraft, 
  title: string, 
  description: string
): PortfolioCreateDto {
  return {
    template: draft.templateId,
    title,
    description,
    sections: flattenDraftToSections(draft)
  };
}

/**
 * Build a PortfolioPatchDto from draft
 */
export function buildPatchDto(
  draft: PortfolioDraft, 
  partial?: { title?: string; description?: string }
): PortfolioPatchDto {
  return {
    template: draft.templateId,
    modelVersion: draft.templateVersion,
    sections: flattenDraftToSections(draft),
    ...partial
  };
}

// -------------------------
// Small compatibility helpers for the MVP
// -------------------------

/**
 * Normalize an array of sections (from backend) into a zoned draft according to a template
 */
export function normalizeSectionsToZones(
  sections: PortfolioSection[] | undefined,
  template: Template
): PortfolioDraft {
  // Build a temporary PublicPortfolioDto like structure to reuse initDraftFromTemplate
  const existing = sections && sections.length ? { sections } as PublicPortfolioDto : null;
  return initDraftFromTemplate(template, existing);
}

/**
 * Serialize sectionsByZone (draft) into an array of sections ready to be sent to backend
 */
export function serializeSectionsForSave(draft: PortfolioDraft): PortfolioSection[] {
  return flattenDraftToSections(draft);
}
