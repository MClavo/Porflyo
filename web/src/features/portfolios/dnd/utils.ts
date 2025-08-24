import type { UniqueIdentifier } from '@dnd-kit/core';
import type { SectionsMap } from './types';

/**
 * Utility functions for DnD operations
 */

/**
 * Determines if an ID represents a section
 */
export function isSectionId(id: UniqueIdentifier, sectionsMap: SectionsMap): boolean {
  return id in sectionsMap;
}

/**
 * Determines if an ID represents an item
 */
export function isItemId(id: UniqueIdentifier, sectionsMap: SectionsMap): boolean {
  return !isSectionId(id, sectionsMap);
}

/**
 * Gets a safe string representation of an ID
 */
export function getIdAsString(id: UniqueIdentifier): string {
  return String(id);
}

/**
 * Validates that an ID is not null or undefined
 */
export function isValidId(id: UniqueIdentifier | null | undefined): id is UniqueIdentifier {
  return id != null && id !== '';
}
