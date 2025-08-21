import { publicGet, PublicClientError } from '../../../lib/http/publicClient';
import type { PublicPortfolioView } from '../../../types/dto';

/**
 * Public Portfolio API client
 * Uses credentials:'omit' for public endpoints
 */

/**
 * Get public portfolio view by slug
 * @param slug Portfolio slug
 * @throws "NOT_FOUND" if 404, throws with status if other error
 */
export async function getPublicPortfolioView(slug: string): Promise<PublicPortfolioView> {
  try {
    return await publicGet<PublicPortfolioView>(`/portfolio/${slug}`);
  } catch (error) {
    if (error instanceof PublicClientError && error.status === 404) {
      throw "NOT_FOUND";
    }
    throw error;
  }
}

/**
 * Check if slug is available
 * @param slug Portfolio slug to check
 * @returns true if available (404), false if taken (200) or on error
 */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  try {
    await publicGet<PublicPortfolioView>(`/portfolio/${slug}`);
    // If we get here, portfolio exists (200 response)
    return false;
  } catch (error) {
    // 404 means slug is available
    if (error instanceof PublicClientError && error.status === 404) {
      return true;
    }
    // Any other error means we can't determine availability
    return false;
  }
}
