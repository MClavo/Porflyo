import { apiGet, apiPost, apiDelete } from '../../../lib/http/apiClient';
import type { SavedSectionCreateDto, PublicSavedSectionDto } from '../../../types/dto';

/**
 * Saved Sections API client
 * Mirrors backend saved sections endpoints exactly
 */

/**
 * Create a new saved section
 */
export function createSavedSection(body: SavedSectionCreateDto): Promise<PublicSavedSectionDto> {
  return apiPost<PublicSavedSectionDto>('/sections', body);
}

/**
 * List all saved sections for current user
 */
export function listSavedSections(): Promise<PublicSavedSectionDto[]> {
  return apiGet<PublicSavedSectionDto[]>('/sections/list');
}

/**
 * Delete saved section by ID
 */
export function deleteSavedSection(id: string): Promise<void> {
  return apiDelete<void>(`/sections/${id}`);
}
