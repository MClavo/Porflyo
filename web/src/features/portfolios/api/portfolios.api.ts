import { apiGet, apiPost, apiPatch, apiDelete } from '../../../lib/http/apiClient';
import type { 
  PortfolioCreateDto, 
  PublicPortfolioDto, 
  PortfolioPatchDto, 
  PortfolioPublishDto 
} from '../../../types/dto';

/**
 * Portfolios API client
 * Mirrors backend portfolio endpoints exactly
 */

/**
 * Create a new portfolio
 */
export function createPortfolio(body: PortfolioCreateDto): Promise<PublicPortfolioDto> {
  return apiPost<PublicPortfolioDto>('/portfolio/create', body);
}

/**
 * List all portfolios for current user
 */
export function listPortfolios(): Promise<PublicPortfolioDto[]> {
  return apiGet<PublicPortfolioDto[]>('/portfolio/list');
}

/**
 * Get portfolio by ID
 */
export function getPortfolio(id: string): Promise<PublicPortfolioDto> {
  return apiGet<PublicPortfolioDto>(`/portfolio/${id}`);
}

/**
 * Update portfolio
 */
export function patchPortfolio(id: string, patch: PortfolioPatchDto): Promise<PublicPortfolioDto> {
  return apiPatch<PublicPortfolioDto>(`/portfolio/${id}`, patch);
}

/**
 * Delete portfolio
 */
export function deletePortfolio(id: string): Promise<void> {
  return apiDelete<void>(`/portfolio/${id}`);
}

/**
 * Publish portfolio with URL
 */
export function publishPortfolio(id: string, body: PortfolioPublishDto): Promise<PublicPortfolioDto> {
  return apiPost<PublicPortfolioDto>(`/portfolio/${id}/publish`, body);
}
