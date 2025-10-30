import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicPortfolioView } from '../api/clients/public.api';
import { mapPublicPortfolioViewToPortfolioState } from '../api/mappers/portfolio.mappers';
import type { PortfolioState } from '../state/Portfolio.types';
import { PortfolioViewer } from '../components/portfolio';
import { sendMetricsOnUnload } from '../api/hooks/useMetrics';
import useMetrics from '../hooks/metrics/useGetMetrics';
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
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [portfolio, setPortfolio] = useState<PortfolioState | null>(null);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  });

  const { getBackendMetrics } = useMetrics(containerRef, {
    trackClicks: true,
    trackLinks: true,
    enableHeatmap: true,
    heatmapOptions: {
      maxCols: 64,
      maxRows: 1024,
      cellHeight: 25,
      shape: 'rect',
      idleMs: 2000,
      drawIntervalMs: 100,
    },
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
        
        // Store portfolio ID for metrics tracking
        setPortfolioId(publicPortfolio.portfolioId);
        
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

  // Send metrics when user closes tab or navigates away
  useEffect(() => {
    if (!portfolioId) return;

    const handleBeforeUnload = () => {
      const metrics = getBackendMetrics();
      
      // Only send if user was active for at least 10 seconds
      if (metrics.activeTimeMs >= 10000) {
        sendMetricsOnUnload(
          '/metrics/session',
          portfolioId,
          metrics
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [portfolioId, getBackendMetrics]);

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
    <div className="public-portfolio-container" ref={containerRef}>
      <PortfolioViewer 
        portfolio={portfolio} 
        className="public-portfolio"
      />
    </div>
  );
}