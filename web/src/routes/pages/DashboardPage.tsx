import { Link } from 'react-router-dom';
import { useAuthUser } from '../../features/auth/hooks/useAuthUser';
import { useGetRepos } from '../../features/repos/hooks/useRepos';
import { LoginButton } from '../../features/auth/components/LoginButton';
import type { ProviderRepo } from '../../types/dto';

/**
 * Dashboard page - authenticated user overview
 * Shows user profile, repositories, and quick actions
 */
export function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthUser();
  const { data: repos, isLoading: reposLoading, error: reposError } = useGetRepos();

  // Show loading state
  if (authLoading) {
    return (
      <div className="app-container">
        <div className="loading">
          <div className="spinner"></div>
          Loading dashboard...
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <div className="main-content text-center">
          <div className="card" style={{ maxWidth: '24rem', margin: '0 auto' }}>
            <div style={{ width: '4rem', height: '4rem', background: 'var(--surface)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <svg style={{ width: '2rem', height: '2rem', color: 'var(--primary-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Access Required
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              You need to sign in to access your dashboard and manage your portfolios.
            </p>
            <LoginButton className="btn">
              Sign in to continue
            </LoginButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-content">
        {/* Header */}
        <div className="mb-6">
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Overview of your profile, repositories, and portfolio activity.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="repo-grid">
          {/* User Overview Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Profile Overview</h2>
            </div>
            <div>
              <div className="user-profile mb-4">
                {/* Avatar */}
                <div>
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={`${user.name} avatar`}
                      className="user-avatar"
                    />
                  ) : user?.providerAvatarUrl ? (
                    <img
                      src={user.providerAvatarUrl}
                      alt={`${user.name} avatar`}
                      className="user-avatar"
                    />
                  ) : (
                    <div className="user-avatar" style={{ background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '1.5rem', fontWeight: '500' }}>
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="user-info">
                  <h3>{user?.name || 'User'}</h3>
                  {user?.description && (
                    <p>{user.description}</p>
                  )}
                  <div style={{ marginTop: '0.5rem' }}>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      {user?.email}
                    </p>
                    {user?.providerUserName && (
                      <p className="text-sm" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg style={{ width: '1rem', height: '1rem' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                        </svg>
                        github.com/{user.providerUserName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Links */}
              {user?.socials && Object.keys(user.socials).length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">Social Links</h4>
                  <div className="social-links">
                    {Object.entries(user.socials).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-link"
                      >
                        {platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Link
                  to="/profile"
                  className="btn flex-1"
                  style={{ textDecoration: 'none', textAlign: 'center' }}
                >
                  Edit Profile
                </Link>
                <Link
                  to="/app/portfolios"
                  className="btn-secondary flex-1"
                  style={{ textDecoration: 'none', textAlign: 'center' }}
                >
                  Manage Portfolios
                </Link>
              </div>
            </div>
          </div>

          {/* Repositories Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">GitHub Repositories</h2>
            </div>
            <div>
              {reposLoading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  Loading repositories...
                </div>
              ) : reposError ? (
                <div className="error">
                  <svg style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem auto' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5C3.313 18.167 4.273 20 5.813 20z" />
                  </svg>
                  <p>Unable to load repositories</p>
                </div>
              ) : repos && repos.length > 0 ? (
                <div>
                  {repos.slice(0, 5).map((repo: ProviderRepo) => (
                    <div key={repo.name} className="repo-card">
                      <div className="flex justify-between items-start">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 className="repo-title">{repo.name}</h4>
                          {repo.description && (
                            <p className="repo-description">{repo.description}</p>
                          )}
                        </div>
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginLeft: '1rem', color: 'var(--primary-color)', flexShrink: 0 }}
                        >
                          <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-1a1 1 0 10-2 0v1H5V7h1a1 1 0 000-2H5z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))}
                  {repos.length > 5 && (
                    <p className="text-sm text-center" style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
                      And {repos.length - 5} more repositories...
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center" style={{ padding: '2rem 0' }}>
                  <svg style={{ width: '3rem', height: '3rem', color: 'var(--text-secondary)', margin: '0 auto 1rem auto' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p style={{ color: 'var(--text-secondary)' }}>No repositories found</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Connect your GitHub account to see your repositories
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
