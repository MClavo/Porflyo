import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useListPortfolios, useDeletePortfolio } from '../hooks/usePortfolios';
import { formatRelativeTime } from '../../../utils';
import type { PublicPortfolioDto } from '../../../types/dto';

/**
 * Portfolios list page showing user's portfolios
 */
export function PortfoliosListPage() {
  const { data: portfolios, isLoading, error } = useListPortfolios();
  const deletePortfolioMutation = useDeletePortfolio();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (portfolioId: string) => {
    if (deleteConfirm === portfolioId) {
      deletePortfolioMutation.mutate(portfolioId, {
        onSuccess: () => {
          setDeleteConfirm(null);
        },
      });
    } else {
      setDeleteConfirm(portfolioId);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading portfolios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">
          Error loading portfolios: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Portfolios</h1>
              <p className="mt-2 text-gray-600">
                Manage and edit your portfolio websites
              </p>
            </div>
            <Link
              to="/portfolios/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Create Portfolio
            </Link>
          </div>
        </div>

        {/* Portfolios Grid */}
        {!portfolios || portfolios.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No portfolios yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first portfolio to showcase your work
              </p>
              <Link
                to="/portfolios/new"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Create Your First Portfolio
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio) => (
              <PortfolioCard
                key={portfolio.id}
                portfolio={portfolio}
                onDelete={handleDelete}
                onCancelDelete={handleCancelDelete}
                deleteConfirm={deleteConfirm}
                isDeleting={deletePortfolioMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface PortfolioCardProps {
  portfolio: PublicPortfolioDto;
  onDelete: (id: string) => void;
  onCancelDelete: () => void;
  deleteConfirm: string | null;
  isDeleting: boolean;
}

function PortfolioCard({ 
  portfolio, 
  onDelete, 
  onCancelDelete, 
  deleteConfirm, 
  isDeleting 
}: PortfolioCardProps) {
  const isConfirmingDelete = deleteConfirm === portfolio.id;
  const slug = portfolio.reservedSlug || 'Draft';
  const isPublished = portfolio.isPublished;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {portfolio.title || 'Untitled Portfolio'}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="capitalize">{portfolio.template}</span>
              <span>•</span>
              <span>{slug}</span>
            </div>
          </div>
          
          {/* Published Badge */}
          {isPublished ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Published
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Draft
            </span>
          )}
        </div>

        {/* Description */}
        {portfolio.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {portfolio.description}
          </p>
        )}

        {/* Updated At */}
        <div className="text-xs text-gray-500 mb-4">
          Last updated {formatRelativeTime(new Date())} {/* TODO: Use actual updatedAt when available */}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!isConfirmingDelete ? (
            <>
              <Link
                to={`/portfolios/${portfolio.id}/edit`}
                className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
              >
                Edit
              </Link>
              
              {isPublished && (
                <Link
                  to={`/p/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200 text-sm"
                >
                  View
                </Link>
              )}
              
              <button
                onClick={() => onDelete(portfolio.id)}
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200 text-sm"
                disabled={isDeleting}
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onDelete(portfolio.id)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200 text-sm"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button
                onClick={onCancelDelete}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors duration-200 text-sm"
                disabled={isDeleting}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
