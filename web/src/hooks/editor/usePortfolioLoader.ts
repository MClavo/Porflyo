import { useMemo } from 'react';
import { usePortfoliosContext } from '../../hooks/ui/usePortfoliosContext';
import type { PortfolioState } from '../../state/Portfolio.types';
import { mapPublicPortfolioDtoToPortfolioState } from '../../api/mappers/portfolio.mappers';

/**
 * Loads an existing portfolio from PortfoliosContext into a PortfolioState for editor reducer
 * Now uses ONLY the context - no individual API calls
 */
export function usePortfolioLoader(portfolioId?: string | null) {
  const { portfolios, isLoading: portfoliosLoading } = usePortfoliosContext();

  const existingFromContext = useMemo(() => {
    if (!portfolioId) return null;
    if (!portfolios) return null;
    return portfolios.find((p) => p.id === portfolioId) || null;
  }, [portfolios, portfolioId]);

  // Use only the context - no fallback API call
  const existingPortfolio = existingFromContext;

  const portfolioLoading = Boolean(portfolioId) && portfoliosLoading;
  const portfolioError = portfolioId && !portfolioLoading && !existingPortfolio ? 'Portfolio not found' : null;

  // Convert to editor state shape when present
  const initialEditorState: PortfolioState | null = existingPortfolio ? mapPublicPortfolioDtoToPortfolioState(existingPortfolio) : null;

  return {
    existingPortfolio,
    initialEditorState,
    portfolioLoading,
    portfolioError,
  } as const;
}
