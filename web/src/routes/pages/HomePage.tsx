import { Link, Navigate } from 'react-router-dom';
import { useAuthUser } from '../../features/auth/hooks/useAuthUser';

/**
 * Home page component - shows different content based on auth status
 * Unauthenticated: Hero with sign-in
 * Authenticated: User dashboard with quick actions
 */
export function HomePage() {
  const { user, isAuthenticated, /* isLoading */ } = useAuthUser();

  if (!isAuthenticated) {
    // If user is not authenticated, redirect to root (unauthenticated landing)
    return <Navigate to="/" replace />;
  }

  // Authenticated Home Page - Quick Dashboard
  return (
    <div className="main-content fade-in">
      {/* User Welcome Section */}
      {user && (
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
      )}
    </div>
  );
}
