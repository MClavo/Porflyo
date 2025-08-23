/**
 * Portfolio Editor Types
 * 
 * This module defines the editor-only contracts for the portfolio editor system.
 * 
 * Key principles:
 * - The backend remains agnostic to editor concepts like "zones" and "variants"
 * - The editor stores minimal hints under section._meta to maintain compatibility
 * - On save, we flatten draft.zones to PortfolioSection[], compatible with PortfolioCreateDto/PortfolioPatchDto
 * - Templates define visual zones with allowed section types and rendering variants
 * - Each zone can specify which section types are allowed and how they should be rendered
 */

import type {
  PortfolioSection
} from "../../types/dto";

// Visual contract recognized by renderers (portable across templates)
export type ZoneType = "hero" | "about" | "cards-grid" | "list" | "socials";

// Logical section types the editor understands (stored inside section._meta.sectionType)
export type EditorSectionType = "profileHeader" | "about" | "project" | "skillGroup" | "socialLinks" | "markdown";

// Catalog of presentational variants known by renderers per zoneType
export type ZoneVariantCatalog = {
  hero: Array<"minimal" | "photo-left">;
  about: Array<"text-only" | "text+image-right">;
  "cards-grid": Array<"2x2" | "carousel">;
  list: Array<"chips" | "grouped-columns">;
  socials: Array<"inline" | "centered">;
};

export const ZONE_VARIANTS: ZoneVariantCatalog = {
  hero: ["minimal", "photo-left"],
  about: ["text-only", "text+image-right"],
  "cards-grid": ["2x2", "carousel"],
  list: ["chips", "grouped-columns"],
  socials: ["inline", "centered"],
};

// Template & zones used by the editor
export interface TemplateZone {
  id: string;                 // e.g., "hero", "about", "projects", "skills", "socials"
  label?: string;
  zoneType: ZoneType;         // determines which renderer to use
  allowed: EditorSectionType[]; // whitelist of section types
  maxItems?: number;
  variants?: string[];
  defaultVariant?: string;
}

export interface Template {
  id: string;
  version: number;
  name: string;
  zones: TemplateZone[];
  theme?: { cssVars?: Record<string, string> };
}

// Editor draft model (rich, zoned)
export interface PortfolioZoneData {
  variant?: string;
  // items are stored as backend PortfolioSection but we require _meta to exist for editor logic
  items: PortfolioSection[];
}

export interface PortfolioDraft {
  templateId: string;
  templateVersion: number;
  zones: Record<string, PortfolioZoneData>; // key: zoneId
}

// Helper meta keys our editor expects inside each PortfolioSection
export type SectionMeta = {
  sectionType: EditorSectionType;
  zoneId?: string;
  zoneType?: ZoneType;
  variant?: string;
  version?: number;
};

// Type guard helpers - implemented in utils.ts
export { readMeta, writeMeta } from "./utils";
