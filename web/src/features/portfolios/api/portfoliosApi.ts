import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from '../../../lib/http/apiClient';
import { publicGet } from '../../../lib/http/publicClient';

/**
 * Portfolio API endpoints
 */

export interface Portfolio {
  id: string;
  slug: string;
  title: string;
  description?: string;
  template: 'default' | 'ats' | 'slots';
  visibility: 'public' | 'private' | 'unlisted';
  bannerImage?: string;
  customDomain?: string;
  seoTitle?: string;
  seoDescription?: string;
  sections: PortfolioSection[];
  userId: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioSection {
  id: string;
  type: string;
  title?: string;
  content?: unknown;
  order: number;
  isVisible: boolean;
}

export interface CreatePortfolioRequest {
  title: string;
  description?: string;
  template: 'default' | 'ats' | 'slots';
  visibility: 'public' | 'private' | 'unlisted';
}

export interface UpdatePortfolioRequest {
  title?: string;
  description?: string;
  template?: 'default' | 'ats' | 'slots';
  visibility?: 'public' | 'private' | 'unlisted';
  bannerImage?: string;
  customDomain?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface PortfoliosResponse {
  portfolios: Portfolio[];
  totalCount: number;
}

/**
 * Get current user's portfolios
 */
export function getUserPortfolios(): Promise<PortfoliosResponse> {
  return apiGet<PortfoliosResponse>('/portfolios');
}

/**
 * Get portfolio by ID (authenticated)
 */
export function getPortfolioById(id: string): Promise<Portfolio> {
  return apiGet<Portfolio>(`/portfolios/${id}`);
}

/**
 * Get public portfolio by username and slug
 */
export function getPublicPortfolio(username: string, slug: string): Promise<Portfolio> {
  return publicGet<Portfolio>(`/portfolio/${username}/${slug}`);
}

/**
 * Create new portfolio
 */
export function createPortfolio(data: CreatePortfolioRequest): Promise<Portfolio> {
  return apiPost<Portfolio>('/portfolios', data);
}

/**
 * Update portfolio
 */
export function updatePortfolio(id: string, data: UpdatePortfolioRequest): Promise<Portfolio> {
  return apiPut<Portfolio>(`/portfolios/${id}`, data);
}

/**
 * Delete portfolio
 */
export function deletePortfolio(id: string): Promise<void> {
  return apiDelete<void>(`/portfolios/${id}`);
}

/**
 * Upload portfolio banner image
 */
export function uploadPortfolioBanner(
  portfolioId: string, 
  file: File
): Promise<{ bannerUrl: string }> {
  return apiUpload<{ bannerUrl: string }>(`/portfolios/${portfolioId}/banner`, file);
}

/**
 * Update portfolio sections order
 */
export function updateSectionsOrder(
  portfolioId: string, 
  sectionIds: string[]
): Promise<Portfolio> {
  return apiPut<Portfolio>(`/portfolios/${portfolioId}/sections/order`, { 
    sectionIds 
  });
}

/**
 * Update portfolio section
 */
export function updatePortfolioSection(
  portfolioId: string,
  sectionId: string,
  data: Partial<PortfolioSection>
): Promise<PortfolioSection> {
  return apiPut<PortfolioSection>(
    `/portfolios/${portfolioId}/sections/${sectionId}`, 
    data
  );
}
