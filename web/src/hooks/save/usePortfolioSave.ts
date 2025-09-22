import { useState, useCallback } from 'react';
import type { PortfolioState } from '../../state/Portfolio.types';
import { useCreatePortfolio, usePatchPortfolio } from '../../api/hooks/usePortfolios';
import { mapPortfolioStateToCreateDto, mapPortfolioStateToPatchDto } from '../../api/mappers/portfolio.mappers';
import { usePortfoliosContext } from '../ui/usePortfoliosContext';

export interface UsePortfolioSaveResult {
  savePortfolio: (portfolio: PortfolioState, portfolioId?: string, description?: string) => Promise<void>;
  isSaving: boolean;
  error: string | null;
}

/**
 * Hook to handle saving portfolios (create or update)
 * Also updates the global portfolios context
 */
export function usePortfolioSave(): UsePortfolioSaveResult {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createMutation = useCreatePortfolio();
  const patchMutation = usePatchPortfolio();
  const { addPortfolio, updatePortfolio } = usePortfoliosContext();

  const savePortfolio = useCallback(async (
    portfolio: PortfolioState, 
    portfolioId?: string, 
    description?: string
  ): Promise<void> => {
    try {
      setIsSaving(true);
      setError(null);

      if (portfolioId) {
        // Update existing portfolio
        const patchDto = mapPortfolioStateToPatchDto(portfolio, description);
        const updatedPortfolio = await patchMutation.mutate({ id: portfolioId, patch: patchDto });
        // Update global state
        updatePortfolio(updatedPortfolio);
      } else {
        // Create new portfolio
        const createDto = mapPortfolioStateToCreateDto(portfolio, description || '');
        const newPortfolio = await createMutation.mutate(createDto);
        // Add to global state
        addPortfolio(newPortfolio);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save portfolio';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [createMutation, patchMutation, addPortfolio, updatePortfolio]);

  return {
    savePortfolio,
    isSaving: isSaving || createMutation.loading || patchMutation.loading,
    error: error || createMutation.error || patchMutation.error,
  };
}
