import { LoginButton } from '../../features/auth/components/LoginButton';
import { Navigate } from 'react-router-dom';
import { useAuthUser } from '../../features/auth/hooks/useAuthUser';

/**
 * Root page (unauthenticated) — moved from HomePage
 */
export default function Root() {
  const { isAuthenticated } = useAuthUser();

  // If already authenticated, send the user to the authenticated home dashboard
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

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
