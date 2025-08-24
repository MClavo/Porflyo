import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuthUser } from '../features/auth/hooks/useAuthUser';
import { useListPortfolios } from '../features/portfolios/hooks/usePortfolios';
import type { PublicPortfolioDto } from '../types/dto';

/**
 * Home page component - shows different content based on auth status
 * Unauthenticated: Hero with sign-in
 * Authenticated: User dashboard with quick actions
 */
export function HomePage() {
  const { user, isAuthenticated, /* isLoading */ } = useAuthUser();
  const navigate = useNavigate();
  // Use TanStack Query hook for portfolios. Configure to fetch only when authenticated
  // and avoid refetches on mount/window focus. We set a long staleTime so it behaves as
  // a cached value fetched once at login unless invalidated.
  const { data: rawPortfolios, isLoading: portfoliosLoading } = useListPortfolios({
    enabled: isAuthenticated,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const portfolios: PublicPortfolioDto[] = Array.isArray(rawPortfolios) ? rawPortfolios as PublicPortfolioDto[] : [];

  if (!isAuthenticated) {
    // If user is not authenticated, redirect to root (unauthenticated landing)
    return <Navigate to="/" replace />;
  }
  
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

                  <button className="btn btn-secondary" onClick={() => { /* noop for now */ }}>
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create new portfolio button */}
        <div className="mt-4">
          <button className="btn btn-primary" onClick={() => navigate('/portfolios/new')} aria-label="Create portfolio">
            + Create portfolio
          </button>
        </div>
      </div>
    </div>
  );

  // Authenticated Home Page - Quick Dashboard
  return (
    <>
  {renderUserSection()}
  {renderPortfoliosSection()}
    </>
  );
}
