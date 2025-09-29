import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiEdit3, 
  FiTrash2, 
  FiBarChart, 
  FiExternalLink, 
  FiCopy,
  FiCheck,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './PortfolioCard.css';

interface Portfolio {
  id: string;
  title: string;
  reservedSlug?: string | null;
  isPublished: boolean;
}

interface PortfolioCardProps {
  portfolio: Portfolio;
  onDelete: (portfolioId: string) => void;
  isDeleting?: boolean;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({ 
  portfolio, 
  onDelete, 
  isDeleting = false 
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const portfolioUrl = portfolio.reservedSlug 
    ? `${window.location.origin}/p/${portfolio.reservedSlug}`
    : null;

  const handleCopyUrl = async () => {
    if (!portfolioUrl) return;
    
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleEdit = () => {
    navigate(`/portfolios/${portfolio.id}/edit`);
  };

  const handleViewMetrics = () => {
    navigate(`/dashboard/modern?portfolio=${portfolio.id}`);
  };

  const handleVisit = () => {
    if (portfolio.reservedSlug) {
      navigate(`/p/${portfolio.reservedSlug}`);
    }
  };

  const handleDelete = () => {
    onDelete(portfolio.id);
  };

  return (
    <div className="portfolio-card">
      <div className="portfolio-card-header">
        <div className="portfolio-info">
          <div className="portfolio-title-row">
            <h3 className="portfolio-title">{portfolio.title}</h3>
            <div className="portfolio-status">
              {portfolio.isPublished ? (
                <div className="status-badge status-published">
                  <FiEye size={14} />
                  Published
                </div>
              ) : (
                <div className="status-badge status-draft">
                  <FiEyeOff size={14} />
                  Draft
                </div>
              )}
            </div>
          </div>
          
          {portfolio.reservedSlug && (
            <div className="portfolio-url-section">
              <span className="url-label">Portfolio URL:</span>
              <div className="url-container">
                <span className="portfolio-url">{portfolioUrl}</span>
                <button 
                  className="copy-button"
                  onClick={handleCopyUrl}
                  title="Copy URL to clipboard"
                >
                  {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                </button>
              </div>
            </div>
          )}
          
          {!portfolio.reservedSlug && (
            <div className="no-url-message">
              <span className="text-muted">No URL assigned yet</span>
            </div>
          )}
        </div>
      </div>

      <div className="portfolio-card-actions">
        <button 
          className="action-button action-edit"
          onClick={handleEdit}
          title="Edit Portfolio"
        >
          <FiEdit3 size={16} />
          Edit
        </button>

        <button 
          className="action-button action-metrics"
          onClick={handleViewMetrics}
          title="View Metrics"
        >
          <FiBarChart size={16} />
          Metrics
        </button>

        {portfolio.isPublished && portfolio.reservedSlug && (
          <button 
            className="action-button action-visit"
            onClick={handleVisit}
            title="Visit Portfolio"
          >
            <FiExternalLink size={16} />
            Visit
          </button>
        )}

        <button 
          className="action-button action-delete"
          onClick={handleDelete}
          disabled={isDeleting}
          title="Delete Portfolio"
        >
          <FiTrash2 size={16} />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

// Skeleton component for loading state
export const PortfolioCardSkeleton: React.FC = () => {
  return (
    <div className="portfolio-card">
      <div className="portfolio-card-header">
        <div className="portfolio-info">
          <div className="portfolio-title-row">
            <div className="portfolio-title">
              <Skeleton width={200} height={24} />
            </div>
            <div className="portfolio-status">
              <Skeleton width={80} height={24} />
            </div>
          </div>
          
          <div className="portfolio-url-section">
            <div className="url-label">
              <Skeleton width={100} height={14} />
            </div>
            <div className="url-container">
              <Skeleton width={300} height={16} />
              <Skeleton width={32} height={32} />
            </div>
          </div>
        </div>
      </div>

      <div className="portfolio-card-actions">
        <Skeleton width={70} height={36} />
        <Skeleton width={80} height={36} />
        <Skeleton width={70} height={36} />
        <Skeleton width={70} height={36} />
      </div>
    </div>
  );
};

export default PortfolioCard;