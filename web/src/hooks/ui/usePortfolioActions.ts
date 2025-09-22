import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfoliosContext } from './usePortfoliosContext';
import { useDeletePortfolio } from '../../api/hooks/usePortfolios';

export interface UsePortfolioActionsResult {
  handleEdit: (portfolioId: string) => void;
  handleView: (slug: string) => void;
  handleCreate: () => void;
  handleDelete: (portfolioId: string) => Promise<void>;
  isDeleting: boolean;
  deleteError: string | null;
}

/**
 * Hook to handle portfolio actions (edit, view, create, delete)
 */
export function usePortfolioActions(): UsePortfolioActionsResult {
  const navigate = useNavigate();
  const { removePortfolio } = usePortfoliosContext();
  const deleteMutation = useDeletePortfolio();

  const handleEdit = useCallback((portfolioId: string) => {
    navigate(`/portfolios/${portfolioId}/edit`);
  }, [navigate]);

  const handleView = useCallback((slug: string) => {
    navigate(`/p/${slug}`);
  }, [navigate]);

  const handleCreate = useCallback(() => {
    navigate('/portfolios/new');
  }, [navigate]);

  const handleDelete = useCallback(async (portfolioId: string) => {
    try {
      await deleteMutation.mutate(portfolioId);
      // Remove from global state
      removePortfolio(portfolioId);
    } catch (error) {
      console.error('Failed to delete portfolio:', error);
      throw error;
    }
  }, [deleteMutation, removePortfolio]);

  return {
    handleEdit,
    handleView,
    handleCreate,
    handleDelete,
    isDeleting: deleteMutation.loading,
    deleteError: deleteMutation.error,
  };
}
// Removed stray re-export that pointed to an incorrect relative path
