import { useParams } from 'react-router-dom';
import { useGetPublicPortfolioView } from '../hooks/usePublicPortfolio';
import { getTemplate, DEFAULT_TEMPLATE } from '../templates';
import type { TemplateId } from '../templates';
import { NotFoundPage } from '../../../components/NotFoundPage';

/**
 * Public portfolio page - accessible without authentication
 */
export function PublicPortfolioPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: portfolio, isLoading, error } = useGetPublicPortfolioView(slug!);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading portfolio...</div>
      </div>
    );
  }

  if ((typeof error === 'string' && error === "NOT_FOUND") || !portfolio) {
    return <NotFoundPage />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Unable to Load Portfolio
          </h2>
          <p className="text-gray-600 mb-6">
            There was an error loading this portfolio. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render the appropriate template
  const renderTemplate = () => {
    const templateId = (portfolio.template as TemplateId) || DEFAULT_TEMPLATE;
    const template = getTemplate(templateId);
    const { Render } = template;
    
    return <Render portfolio={portfolio} />;
  };

  return (
    <div className="min-h-screen">
      {renderTemplate()}
    </div>
  );
}
