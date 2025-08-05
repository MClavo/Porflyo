import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import type { Repository } from '../context/UserContext';
import LoginButton from './LoginButton';

const HomePage: React.FC = () => {
  const { user, repos, loading, error, isAuthenticated, hasCheckedAuth, checkAuthStatus, fetchUserData } = useUser();

  useEffect(() => {
    // Only check auth status on initial load if we haven't checked yet
    if (!hasCheckedAuth && !loading) {
      checkAuthStatus();
    }
  }, [hasCheckedAuth, loading, checkAuthStatus]);

  useEffect(() => {
    // Fetch repos after authentication is confirmed and we have a user
    if (isAuthenticated && user && repos.length === 0 && !loading) {
      fetchUserData();
    }
  }, [isAuthenticated, user, repos.length, loading, fetchUserData]);

  // Show loading only if we're actually loading and haven't determined auth status
  if (loading && !hasCheckedAuth) {
    return (
      <div className="main-content">
        <div className="loading">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated or no user after auth check
  if (hasCheckedAuth && (!isAuthenticated || !user)) {
    return (
      <div className="main-content">
        <div className="card text-center">
          <div className="card-header">
            <h1 className="card-title">Welcome to Porflyo</h1>
            <p className="card-description">
              Your personal platform to manage your development portfolio
            </p>
          </div>
          {error && (
            <div className="error mb-4">
              Error: {error}
            </div>
          )}
          <LoginButton />
        </div>
      </div>
    );
  }

  // Show loading if we're fetching user data after authentication
  if (loading) {
    return (
      <div className="main-content">
        <div className="loading">
          <div>Loading your data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content fade-in">
      {error && (
        <div className="error">
          Error: {error}
        </div>
      )}

      {/* User Welcome Section */}
      {user && (
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="card-title">Hello, {user.name}! 👋</h1>
                <p className="card-description">
                  Welcome back to your personal dashboard
                </p>
              </div>
              <Link to="/profile" className="btn btn-outline">
                Edit Profile
              </Link>
            </div>
          </div>
          
          <div className="user-profile">
            <img 
              src={user.avatarUrl} 
              alt="Avatar" 
              className="user-avatar"
              style={{ width: '4rem', height: '4rem' }}
            />
            <div className="user-info">
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-sm">{user.email}</p>
              {/* Show all social links */}
              <div className="social-links">
                {user.socials && Object.keys(user.socials).length > 0 && Object.entries(user.socials).map(([platform, url]) => (
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
            </div>
          </div>
        </div>
      )}

      {/* Repositories Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">My Repositories</h2>
          <p className="card-description">
            {repos.length > 0 
              ? `You have ${repos.length} repositor${repos.length > 1 ? 'ies' : 'y'} available`
              : 'No repositories found'
            }
          </p>
        </div>

        {repos.length > 0 ? (
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
          <div className="text-center" style={{ padding: '2rem' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              No repositories to display
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
