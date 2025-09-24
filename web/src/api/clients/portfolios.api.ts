import { apiGet, apiPost, apiPatch, apiDelete } from './base.client';
import type { 
  PortfolioCreateDto, 
  PublicPortfolioDto, 
  PortfolioPatchDto, 
  PortfolioPublishDto 
} from '../types/dto';

/**
 * Portfolios API client
 * Mirrors backend portfolio endpoints exactly
 */

/**
 * Create a new portfolio
 */
export function createPortfolio(body: PortfolioCreateDto): Promise<PublicPortfolioDto> {
  return apiPost<PublicPortfolioDto>('/portfolios', body);
}

/**
 * List all portfolios for current user
 */
export function listPortfolios(): Promise<PublicPortfolioDto[]> {
  return apiGet<PublicPortfolioDto[]>('/portfolios');
}

/**
 * Get portfolio by ID
 */
export function getPortfolio(id: string): Promise<PublicPortfolioDto> {
  return apiGet<PublicPortfolioDto>(`/portfolios/${id}`);
}

/**
 * Update portfolio
 */
export function patchPortfolio(id: string, patch: PortfolioPatchDto): Promise<PublicPortfolioDto> {
  return apiPatch<PublicPortfolioDto>(`/portfolios/${id}`, patch);
}

/**
 * Delete portfolio
 */
export function deletePortfolio(id: string): Promise<void> {
  return apiDelete<void>(`/portfolios/${id}`);
}

/**
 * Publish portfolio with URL
 */
export function publishPortfolio(id: string, body: PortfolioPublishDto): Promise<PublicPortfolioDto> {
  return apiPatch<PublicPortfolioDto>(`/portfolios/publish/${id}`, body);
}