import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { PortfolioEditor } from '../componentsOld/PortfolioEditor';
import { type PortfolioFormData } from '../schemas/sections.schema';
import { portfoliosApi } from '../../../services/api';

export function EditPortfolioPage() {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(portfolioId);

  // Fetch existing portfolio if editing
  const { data: portfolio, isLoading: isLoadingPortfolio, error } = useQuery({
    queryKey: ['portfolio', portfolioId],
    queryFn: () => portfoliosApi.getPortfolio(portfolioId!),
    enabled: isEdit,
  });

  // Save portfolio mutation
  const savePortfolioMutation = useMutation({
    mutationFn: async (data: PortfolioFormData) => {
      if (isEdit) {
        return portfoliosApi.updatePortfolio(portfolioId!, data);
      } else {
        return portfoliosApi.createPortfolio(data);
      }
    },
    onSuccess: (savedPortfolio) => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', savedPortfolio.id] });
      
      // Navigate to portfolio view or edit page
      navigate(`/portfolios/${savedPortfolio.id}`);
    },
    onError: (error: Error) => {
      console.error('Error saving portfolio:', error);
    },
  });

  const handleSubmit = (data: PortfolioFormData) => {
    savePortfolioMutation.mutate(data);
  };

  // Transform portfolio data for the form
  const getInitialData = (): Partial<PortfolioFormData> | undefined => {
    if (!portfolio) return undefined;

    return {
      title: portfolio.title,
      template: portfolio.template,
      slug: portfolio.slug,
      published: portfolio.published,
      sections: portfolio.sections || [],
    };
  };

  if (isEdit && isLoadingPortfolio) {
    return (
      <div className="app-container">
        <div className="main-content">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Loading portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isEdit && error) {
    return (
      <div className="app-container">
        <div className="main-content">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#ef4444' }}>
              Failed to load portfolio
            </h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
            <button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['portfolio', portfolioId] })}
              className="btn"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PortfolioEditor
      portfolioId={portfolioId || 'new'}
      initialData={getInitialData()}
      onSubmit={handleSubmit}
      isLoading={savePortfolioMutation.isPending}
    />
  );
}
