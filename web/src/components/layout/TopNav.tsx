import { Link } from 'react-router-dom';
import { useAuthUser } from '../../features/auth/hooks/useAuthUser';
import { LoginButton } from '../../features/auth/components/LoginButton';

/**
 * Top navigation component
 * Shows different navigation based on authentication status
 */
export function TopNav() {
  const { user, isAuthenticated, isLoading } = useAuthUser();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo/Brand */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
            >
              Porflyo
            </Link>
          </div>

          {/* Right: Navigation */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : isAuthenticated && user ? (
              <>
                {/* Authenticated Navigation */}
                <Link
                  to="/app"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/app/portfolios"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Portfolios
                </Link>
                <Link
                  to="/app/profile"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Profile
                </Link>
                
                {/* User Avatar */}
                <div className="flex items-center space-x-2">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={`${user.name} avatar`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-gray-700 hidden sm:block">
                    {user.name}
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* Unauthenticated Navigation */}
                <LoginButton className="text-sm px-3 py-1.5" />
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
