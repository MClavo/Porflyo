import type { ReactNode } from 'react';
import { useAuthContext } from '../../hooks/ui/useAuthContext';

/**
 * HOC to protect routes that require authentication
 * Redirects to login if not authenticated
 */
interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext();

  // Let the child components handle their own loading states
  // Only block rendering if we know the user is NOT authenticated
  if (!isLoading && !isAuthenticated) {
    return fallback || (
      <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Authentication Required</h2>
        <p>Please log in to access this page.</p>
      </div>
    );
  }

  // Render children even during loading - let them show their own skeletons
  return <>{children}</>;
}