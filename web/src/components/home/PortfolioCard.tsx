import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiEdit3, 
  FiBarChart, 
  FiExternalLink,
  FiCopy,
  FiCheck,
  FiEyeOff
} from 'react-icons/fi';

import { FaTrash } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { ConfirmDialog } from '../dialogs';
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeletingLocal, setIsDeletingLocal] = useState(false);

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
    navigate(`/dashboard/${portfolio.id}`);
  };

  const handleVisit = () => {
    if (portfolio.isPublished && portfolio.reservedSlug) {
      window.open(`/p/${portfolio.reservedSlug}`, '_blank');
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeletingLocal(true);
    try {
      await onDelete(portfolio.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete portfolio:", error);
    } finally {
      setIsDeletingLocal(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="portfolio-card">
        <div className="portfolio-card-header">
          <div className="portfolio-header-top">
            <h3 className="portfolio-title">{portfolio.title}</h3>
            <button 
              className="delete-icon-button"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete Portfolio"
            >
              <FaTrash size={18} />
            </button>
          </div>

          <div className="portfolio-header-middle">
            {portfolio.reservedSlug ? (
              <button 
                className="portfolio-url-button"
                onClick={handleCopyUrl}
                title="Click to copy URL"
              >
                <span className="portfolio-url">{portfolioUrl}</span>
                <span className="copy-indicator">
                  {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                </span>
              </button>
            ) : (
              <div className="no-url-placeholder">
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
            <span>Edit</span>
          </button>

          <button 
            className="action-button action-metrics"
            onClick={handleViewMetrics}
            title="View Metrics"
          >
            <FiBarChart size={16} />
            <span>Metrics</span>
          </button>

          <button 
            className={`action-button ${portfolio.isPublished ? 'action-visit-published' : 'action-visit-draft'}`}
            onClick={handleVisit}
            disabled={!portfolio.isPublished || !portfolio.reservedSlug}
            title={portfolio.isPublished ? 'Visit Portfolio' : 'Not Published'}
          >
            {portfolio.isPublished ? <FiExternalLink size={16} /> : <FiEyeOff size={16} />}
            <span>{portfolio.isPublished ? 'Visit' : 'Private'}</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Portfolio"
        message={`Are you sure you want to delete "${portfolio.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        variant="danger"
        isLoading={isDeletingLocal}
      />
    </>
  );
};

// Skeleton component for loading state
export const PortfolioCardSkeleton: React.FC = () => {
  return (
    <div className="portfolio-card">
      <div className="portfolio-card-header">
        <div className="portfolio-header-top">
          <div className="portfolio-title">
            <Skeleton width={200} height={24} />
          </div>
          <Skeleton circle width={36} height={36} />
        </div>
        
        <div className="portfolio-header-middle">
          <Skeleton width="100%" height={36} style={{ flex: 1 }} />
        </div>
      </div>

      <div className="portfolio-card-actions">
        <Skeleton width="100%" height={40} />
        <Skeleton width="100%" height={40} />
        <Skeleton width="100%" height={40} />
      </div>
    </div>
  );
};

export default PortfolioCard;