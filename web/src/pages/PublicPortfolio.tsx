import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicPortfolioView } from '../api/clients/public.api';
import { mapPublicPortfolioViewToPortfolioState } from '../api/mappers/portfolio.mappers';
import type { PortfolioState } from '../state/Portfolio.types';
import { PortfolioViewer } from '../components/portfolio';
import '../styles/PublicPortfolio.css';

// Import template CSS files
import '../templates/template1/template1.css';
import '../templates/template2/template2.css';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export default function PublicPortfolio() {
  const { slug } = useParams<{ slug: string }>();
  
  const [portfolio, setPortfolio] = useState<PortfolioState | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!slug) {
        setLoadingState({
          isLoading: false,
          error: 'No portfolio slug provided'
        });
        return;
      }

      try {
        setLoadingState({ isLoading: true, error: null });
        
        // Fetch portfolio from backend using slug
        const publicPortfolio = await getPublicPortfolioView(slug);
        
        // Map backend data to frontend state
        const mappedPortfolio = mapPublicPortfolioViewToPortfolioState(publicPortfolio);
        
        setPortfolio(mappedPortfolio);
        setLoadingState({ isLoading: false, error: null });
        
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
        setLoadingState({
          isLoading: false,
          error: 'Portfolio not found'
        });
      }
    };

    fetchPortfolio();
  }, [slug]);

  // Set document title
  useEffect(() => {
    if (portfolio?.title) {
      document.title = `${portfolio.title} - Portfolio`;
    } else {
      document.title = 'Portfolio';
    }

    // Cleanup on unmount
    return () => {
      document.title = 'React Playground';
    };
  }, [portfolio?.title]);

  if (loadingState.isLoading) {
    return (
      <div className="public-portfolio-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (loadingState.error || !portfolio) {
    return (
      <div className="public-portfolio-container">
        <div className="error-container">
          <h1>Portfolio Not Found</h1>
          <p>{loadingState.error || 'The requested portfolio could not be found.'}</p>
          {loadingState.error === 'Portfolio is not published' && (
            <p>This portfolio is currently private.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="public-portfolio-container">
      <PortfolioViewer 
        portfolio={portfolio} 
        className="public-portfolio"
      />
    </div>
  );
}