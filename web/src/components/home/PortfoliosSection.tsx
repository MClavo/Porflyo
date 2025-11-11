import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiFolderPlus } from 'react-icons/fi';
import { PortfolioCard, PortfolioCardSkeleton } from './PortfolioCard';

interface Portfolio {
  id: string;
  title: string;
  reservedSlug?: string | null;
  isPublished: boolean;
}

interface PortfoliosSectionProps {
  portfolios: Portfolio[] | null;
  isLoading: boolean;
  onDeletePortfolio: (portfolioId: string) => void;
  isDeleting: boolean;
}

export const PortfoliosSection: React.FC<PortfoliosSectionProps> = ({
  portfolios,
  isLoading,
  onDeletePortfolio,
  isDeleting
}) => {
  const navigate = useNavigate();

  const handleCreatePortfolio = () => {
    navigate('/portfolios/new');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="portfolios-grid">
          {[1, 2, 3].map((index) => (
            <PortfolioCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (!portfolios || portfolios.length === 0) {
      return (
        <div className="portfolios-empty">
          <div className="portfolios-empty-icon">
            <FiFolderPlus />
          </div>
          <h3 className="portfolios-empty-title">No portfolios yet</h3>
          <p className="portfolios-empty-description">
            Create your first portfolio to showcase your work and track your metrics.
          </p>
          <button 
            className="btn btn-primary"
            onClick={handleCreatePortfolio}
          >
            <FiPlus size={16} />
            Create Your First Portfolio
          </button>
        </div>
      );
    }

    return (
      <div className="portfolios-grid">
        {portfolios.map((portfolio) => (
          <PortfolioCard
            key={portfolio.id}
            portfolio={portfolio}
            onDelete={onDeletePortfolio}
            isDeleting={isDeleting}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="portfolios-section">
      <div className="portfolios-header">
        <h2 className="portfolios-title">Your Portfolios</h2>
        {portfolios && portfolios.length > 0 && portfolios.length < 3 && (
          <button 
            className="btn btn-primary"
            onClick={handleCreatePortfolio}
          >
            <FiPlus size={16} />
            Create Portfolio
          </button>
        )}
      </div>
      {renderContent()}
    </div>
  );
};

export default PortfoliosSection;