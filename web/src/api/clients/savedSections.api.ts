import { apiGet, apiPost, apiDelete } from './base.client';
import type { 
  SavedSectionCreateDto, 
  PublicSavedSectionDto,
  ApiResponse
} from '../types';

/**
 * Saved Sections API client
 */

/**
 * Create a new saved section
 * POST /api/sections
 */
export async function createSavedSection(
  createDto: SavedSectionCreateDto
): Promise<ApiResponse<PublicSavedSectionDto>> {
  const data = await apiPost<PublicSavedSectionDto>('/sections', createDto);
  return { data, status: 201 };
}

/**
 * Get all saved sections
 * GET /api/sections
 */
export async function getSavedSections(): Promise<ApiResponse<PublicSavedSectionDto[]>> {
  const data = await apiGet<PublicSavedSectionDto[]>('/sections');
  return { data, status: 200 };
}

/**
 * Delete a saved section by ID
 * DELETE /api/sections/{itemId}
 */
export async function deleteSavedSection(itemId: string): Promise<ApiResponse<void>> {
  await apiDelete<void>(`/sections/${itemId}`);
  return { status: 204 };
}