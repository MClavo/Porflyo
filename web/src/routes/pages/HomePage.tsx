import { Link } from 'react-router-dom';
import { useAuthUser } from '../../features/auth/hooks/useAuthUser';
import { LoginButton } from '../../features/auth/components/LoginButton';

/**
 * Home page component - shows different content based on auth status
 * Unauthenticated: Hero with sign-in
 * Authenticated: User dashboard with quick actions
 */
export function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuthUser();

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="loading">
          <div className="spinner"></div>
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Unauthenticated Home Page
    return (
      <div className="app-container">
        {/* Hero Section */}
        <div className="main-content">
          <div className="text-center">
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              Create and publish your
              <span style={{ color: 'var(--primary-color)' }}> portfolio</span>
            </h1>
            <p className="text-lg mb-6" style={{ maxWidth: '48rem', margin: '0 auto 2rem auto', color: 'var(--text-secondary)' }}>
              Build beautiful, professional portfolios that showcase your work. 
              Connect your GitHub repositories and create multiple portfolio views 
              for different purposes.
            </p>
            
            {/* CTA Button */}
            <div className="mb-6">
              <LoginButton className="btn btn-lg">
                Sign in with GitHub to get started
              </LoginButton>
            </div>

            {/* Features */}
            <div className="repo-grid mt-4">
              <div className="card">
                <div style={{ width: '3rem', height: '3rem', background: 'var(--surface)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <svg style={{ width: '1.5rem', height: '1.5rem', color: 'var(--primary-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="card-title text-center">Multiple Templates</h3>
                <p className="card-description text-center">Choose from professional templates including ATS-optimized formats for job applications.</p>
              </div>

              <div className="card">
                <div style={{ width: '3rem', height: '3rem', background: 'var(--surface)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <svg style={{ width: '1.5rem', height: '1.5rem', color: 'var(--primary-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="card-title text-center">GitHub Integration</h3>
                <p className="card-description text-center">Automatically sync your repositories and showcase your development projects.</p>
              </div>

              <div className="card">
                <div style={{ width: '3rem', height: '3rem', background: 'var(--surface)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <svg style={{ width: '1.5rem', height: '1.5rem', color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <h3 className="card-title text-center">Public URLs</h3>
                <p className="card-description text-center">Share your portfolio with custom URLs that look professional and are easy to remember.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testing Section */}
        <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
          <div className="main-content">
            <div className="text-center">
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Want to see a portfolio in action?
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                View public portfolios using their slug URLs
              </p>
              <div style={{ maxWidth: '24rem', margin: '0 auto' }}>
                <div style={{ background: 'var(--background)', borderRadius: 'var(--radius)', padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <span style={{ fontFamily: 'monospace' }}>porflyo.com/p/[slug]</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Home Page - Quick Dashboard
  return (
    <div className="app-container">
      <div className="main-content">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Here's a quick overview of your account and portfolio activity.
          </p>
        </div>

        {/* User Card */}
        <div className="card mb-4">
          <div className="user-profile">
            {/* Avatar */}
            <div>
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={`${user.name} avatar`}
                  className="user-avatar"
                />
              ) : (
                <div className="user-avatar" style={{ background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', fontWeight: '500' }}>
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
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="repo-grid">
          <Link
            to="/app/portfolios"
            className="card hover:shadow-lg transition-all"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div style={{ width: '2.5rem', height: '2.5rem', background: 'var(--surface)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Manage Portfolios</h3>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Create, edit, and publish your portfolios. View analytics and manage your public presence.
            </p>
          </Link>

          <Link
            to="/app/profile"
            className="card hover:shadow-lg transition-all"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div style={{ width: '2.5rem', height: '2.5rem', background: 'var(--surface)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Edit Profile</h3>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Update your personal information, bio, social links, and profile picture.
            </p>
          </Link>

          <Link
            to="/dashboard"
            className="card hover:shadow-lg transition-all"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div style={{ width: '2.5rem', height: '2.5rem', background: 'var(--surface)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '1.25rem', height: '1.25rem', color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Full Dashboard</h3>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              View your complete dashboard with repositories, activity, and detailed analytics.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
