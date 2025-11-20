import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ShaderBackground from '../components/ShaderBackground/ShaderBackgorund';
import '../styles/pages/NotFound.css';

interface NotFoundProps {
  message?: string;
  description?: string;
}

export default function NotFound({ message, description }: NotFoundProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isPortfolioRoute = location.pathname.startsWith('/p/');
  
  const defaultMessage = isPortfolioRoute 
    ? 'Portfolio Not Found' 
    : 'Page Not Found';
  
  const defaultDescription = isPortfolioRoute
    ? 'The portfolio you are looking for does not exist or has been removed.'
    : 'The page you are looking for does not exist.';

  // Add shader class for NotFound page
  useEffect(() => {
    document.body.classList.add('has-shader');
    return () => {
      document.body.classList.remove('has-shader');
    };
  }, []);

  return (
    <>
      {/* Background shader for NotFound page */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        pointerEvents: 'none'
      }}>
        <ShaderBackground />
      </div>

      <div className="not-found-page">
        <div className="not-found-container">
          <div className="not-found-card">
            <div className="not-found-icon">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            
            <h1 className="not-found-title">
              {message || defaultMessage}
            </h1>
            
            <p className="not-found-description">
              {description || defaultDescription}
            </p>
            
            <button
              className="not-found-button"
              onClick={() => navigate('/')}
            >
              poRflyo
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
