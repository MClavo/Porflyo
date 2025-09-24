import { createContext } from 'react';
import type { PublicPortfolioDto } from '../api/types/dto';

export interface PortfoliosContextValue {
  portfolios: PublicPortfolioDto[];
  isLoading: boolean;
  error: string | null;
  // Actions
  refreshPortfolios: () => Promise<void>;
  addPortfolio: (portfolio: PublicPortfolioDto) => void;
  updatePortfolio: (portfolio: PublicPortfolioDto) => void;
  removePortfolio: (portfolioId: string) => void;
  clearPortfolios: () => void;
}

export const PortfoliosContext = createContext<PortfoliosContextValue | null>(null);