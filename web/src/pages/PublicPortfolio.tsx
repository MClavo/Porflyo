import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicPortfolioView } from '../api/clients/public.api';
import { mapPublicPortfolioViewToPortfolioState } from '../api/mappers/portfolio.mappers';
import type { PortfolioState } from '../state/Portfolio.types';
import { PortfolioViewer } from '../components/portfolio';
import { PortfolioBranding } from '../components/portfolio/PortfolioBranding';
import { sendMetricsOnUnload } from '../api/hooks/useMetrics';
import useMetrics from '../hooks/metrics/useGetMetrics';
import { useSEO } from '../hooks/useSEO';
import NotFound from './NotFound';
import '../styles/PublicPortfolio.css';


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
    isContentReady: !loadingState.isLoading && portfolio !== null,
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

  // SEO Configuration for public portfolios (NOT indexable)
  useSEO({
    title: portfolio?.title 
      ? `${portfolio.title} - Portfolio | porflyo`
      : 'Portfolio - porflyo',
    description: 'View this amazing portfolio created with porflyo - showcasing projects and achievements',
    keywords: 'portfolio, projects, developer, showcase',
    noIndex: true, // Block indexing - only root page is indexable
  });

  // Send metrics when user closes tab or navigates away
  useEffect(() => {
    if (!portfolioId) return;

    const handleBeforeUnload = () => {
      const metrics = getBackendMetrics();
      
      // Only send if user was active for at least 10 seconds
      if (metrics.activeTimeMs >= 10000) {
        sendMetricsOnUnload(
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
      <div className="public-portfolio">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (loadingState.error || !portfolio) {
    const errorMessage = loadingState.error === 'Portfolio is not published'
      ? 'Portfolio Not Available'
      : 'Portfolio Not Found';
    
    const errorDescription = loadingState.error === 'Portfolio is not published'
      ? 'This portfolio is currently private and cannot be viewed.'
      : loadingState.error || 'The requested portfolio could not be found.';

    return <NotFound message={errorMessage} description={errorDescription} />;
  }

  return (
    <div className="public-portfolio" ref={containerRef}>
      <PortfolioBranding />
      <PortfolioViewer portfolio={portfolio} />
    </div>
  );
}