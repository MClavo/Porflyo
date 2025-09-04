import { PublicClientError, publicGet } from '../../lib/http/publicClient';
import type { AvailabilityResponseDto, PublicPortfolioView } from '../../types/dto';

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
 * @returns AvailabilityResponseDto with availability and normalized slug
 */
export async function isSlugAvailable(slug: string): Promise<AvailabilityResponseDto> {
  try {
    return await publicGet<AvailabilityResponseDto>(`/isurlavailable/${slug}`);
  } catch (error) {
    // If the endpoint fails, return unavailable with original slug
    console.error('Error checking slug availability:', error);
    return { available: false, slug };
  }
}
