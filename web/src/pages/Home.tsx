import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { usePortfoliosContext } from '../hooks/usePortfoliosContext';
import { usePortfolioActions } from '../hooks/usePortfolioActions';
import '../styles/components/buttons.css';
import '../styles/pages/home.css';
/* import '../styles/cards/cards.css'; */

/**
 * Home page component - shows user dashboard for authenticated users
 * Authentication protection is handled by ProtectedRoute wrapper
 */
export function Home() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { portfolios, isLoading: portfoliosLoading } = usePortfoliosContext();
  const { handleDelete, isDeleting } = usePortfolioActions();

  // Handle delete without confirmation
  const handleDeleteClick = async (portfolioId: string) => {
    try {
      await handleDelete(portfolioId);
    } catch (error) {
      console.error('Failed to delete portfolio:', error);
      alert('Failed to delete portfolio. Please try again.');
    }
  };
  
  // ────────────────────────── User Section ──────────────────────────
  const renderUserSection = () => {
    if (!user) return null;
    return (
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="card-title">Hello, {user.name}! 👋</h1>
              <p className="card-description">Welcome back to your personal dashboard</p>
            </div>
            <Link to="/profile" className="btn btn-outline">Edit Profile</Link>
          </div>
        </div>

        <div className="user-profile">
          <img src={user.profileImage ?? undefined} alt="Avatar" className="user-avatar" style={{ width: '4rem', height: '4rem' }} />
          <div className="user-info">
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <p className="text-sm">{user.email}</p>
            {/* Show all social links */}
            <div className="social-links">
              {user.socials && Object.keys(user.socials).length > 0 && Object.entries(user.socials).map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="text-sm nav-link">
                  {platform.charAt(0).toUpperCase() + platform.slice(1)} Profile
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ────────────────────────── Portfolio Section ──────────────────────────
  
  const renderPortfoliosSection = () => (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Your Portfolios</h2>
      </div>

      <div className="card-body space-y-4">
        {portfoliosLoading && <p>Loading portfolios…</p>}

        {!portfoliosLoading && portfolios && portfolios.length === 0 && (
          <p>No portfolios found.</p>
        )}

        {!portfoliosLoading && portfolios && portfolios.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            {portfolios.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-sm text-gray-500">Slug: {p.reservedSlug ? p.reservedSlug : 'none'}</div>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={!!p.isPublished} readOnly />
                    <span className="text-sm">Published</span>
                  </label>

                  {/* View button - only show for published portfolios with slug */}
                  {p.isPublished && p.reservedSlug && (
                    <button 
                      className="btn btn-outline"
                      onClick={() => {
                        navigate(`/p/${p.reservedSlug}`);
                      }}
                    >
                      View
                    </button>
                  )}

                  <button 
                    className="btn btn-remove"
                    onClick={() => handleDeleteClick(p.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>

                  <button 
                    className="btn btn-secondary"
                    onClick={() => navigate(`/portfolios/${p.id}/edit`)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create new portfolio button */}
        <div className="mt-4">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/portfolios/new')}
            aria-label="Create portfolio"
          >
            + Create portfolio
          </button>
        </div>
      </div>
    </div>
  );


  return (
    <>
      {renderUserSection()}
      {renderPortfoliosSection()}
    </>
  );
}

export default Home;