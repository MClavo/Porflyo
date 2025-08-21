import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import type { Repository } from '../context/UserContext';
import LoginButton from './LoginButton';

const HomePage: React.FC = () => {
  const { user, repos, loading, error, isAuthenticated, hasCheckedAuth, checkAuthStatus, fetchUserData } = useUser();

  useEffect(() => {
    // Always check auth status in the background on initial load
    if (!hasCheckedAuth) {
      checkAuthStatus();
    }
  }, [hasCheckedAuth, checkAuthStatus]);

  useEffect(() => {
    // Fetch repos in the background after authentication is confirmed
    if (isAuthenticated && user && repos.length === 0) {
      fetchUserData();
    }
  }, [isAuthenticated, user, repos.length, fetchUserData]);

  // Always show the home page content - no loading screens
  return (
    <div className="main-content fade-in">
      {/* Welcome Section - Show immediately */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="card-title">
                {user ? `Hello, ${user.name}! 👋` : 'Welcome to Porflyo'}
              </h1>
              <p className="card-description">
                {user 
                  ? 'Welcome back to your personal dashboard'
                  : 'Your personal platform to manage your development portfolio'
                }
              </p>
            </div>
            {user ? (
              <Link to="/profile" className="btn btn-outline">
                Edit Profile
              </Link>
            ) : (
              // Show login button if we've checked auth and user is not authenticated
              hasCheckedAuth && !isAuthenticated && <LoginButton />
            )}
          </div>
        </div>
        
        {/* User Profile Section - Show when available */}
        {user && (
          <div className="user-profile">
            <img 
              src={user.profileImage} 
              alt="Avatar" 
              className="user-avatar"
              style={{ width: '4rem', height: '4rem' }}
            />
            <div className="user-info">
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-sm">{user.email}</p>
              {/* Show social links when available */}
              {user.socials && Object.keys(user.socials).length > 0 && (
                <div className="social-links">
                  {Object.entries(user.socials).map(([platform, url]) => (
                    <a 
                      key={platform}
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm nav-link"
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)} Profile
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Show authentication prompt if needed */}
        {hasCheckedAuth && !isAuthenticated && (
          <div className="text-center" style={{ marginTop: '1rem' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Sign in with GitHub to access your repositories and create portfolios
            </p>
          </div>
        )}
      </div>

      {/* Error display if any */}
      {error && (
        <div className="error">
          Error: {error}
        </div>
      )}

      {/* Repositories Section - Always show, with appropriate content */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="card-title">
                My Repositories
                {loading && user && (
                  <span className="text-sm" style={{ fontWeight: 'normal', color: 'var(--text-secondary)' }}>
                    {' '} (updating...)
                  </span>
                )}
              </h2>
              <p className="card-description">
                {!user 
                  ? 'Sign in to view your GitHub repositories'
                  : repos.length > 0 
                    ? `You have ${repos.length} repositor${repos.length > 1 ? 'ies' : 'y'} available`
                    : loading
                      ? 'Getting your repositories in the background...'
                      : 'No repositories found'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Repository content based on state */}
        {!user ? (
          // Not authenticated - show placeholder
          <div className="text-center" style={{ padding: '2rem' }}>
            <div style={{ opacity: 0.6 }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                🔒 Connect your GitHub account to see your repositories here
              </p>
            </div>
          </div>
        ) : repos.length > 0 ? (
          // Show repositories
          <div className="repo-grid">
            {repos.map((repo: Repository) => (
              <div key={repo.id} className="repo-card">
                <h3 className="repo-title">
                  <a 
                    href={repo.htmlUrl || repo.html_url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {repo.name}
                  </a>
                </h3>
                {repo.description && (
                  <p className="repo-description">{repo.description}</p>
                )}
                <div className="repo-stats">
                  {repo.language && (
                    <span>📝 {repo.language}</span>
                  )}
                  <span>⭐ {repo.stargazersCount || repo.stargazers_count || 0}</span>
                  <span>🍴 {repo.forksCount || repo.forks_count || 0}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // No repositories or still loading in background
          <div className="text-center" style={{ padding: '2rem' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {loading ? '📡 Loading repositories in the background...' : 'No repositories to display'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
