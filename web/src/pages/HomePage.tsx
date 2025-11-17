import { useAuthContext } from '../hooks/ui/useAuthContext';
import { usePortfoliosContext } from '../hooks/ui/usePortfoliosContext';
import { usePortfolioActions } from '../hooks/ui/usePortfolioActions';
import { UserProfileCard, PortfoliosSection } from '../components/home';
import '../styles/pages/HomePage.css';
import '../styles/components/buttons.css';

/**
 * Home page component - shows user dashboard for authenticated users
 * Authentication protection is handled by ProtectedRoute wrapper
 */
export function HomePage() {
  const { user, isLoading: userLoading } = useAuthContext();
  const { portfolios, isLoading: portfoliosLoading } = usePortfoliosContext();
  const { handleDelete, isDeleting } = usePortfolioActions();

  // Handle delete without confirmation
  const handleDeletePortfolio = async (portfolioId: string) => {
    try {
      await handleDelete(portfolioId);
    } catch (error) {
      console.error('Failed to delete portfolio:', error);
      alert('Failed to delete portfolio. Please try again.');
    }
  };

  return (
    <div className="home-page">
      <div className="home-content">
        <UserProfileCard user={user} isLoading={userLoading} />
        <PortfoliosSection
          portfolios={portfolios}
          isLoading={portfoliosLoading}
          onDeletePortfolio={handleDeletePortfolio}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}

export default HomePage;