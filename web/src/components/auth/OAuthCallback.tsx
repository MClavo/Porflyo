import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component to handle OAuth callback and redirect
 * This component should be rendered when the user returns from OAuth authentication
 * Simplified version - most logic now handled in Root component
 */
export function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Set flag and redirect to root where the main logic will handle it
    sessionStorage.setItem('oauth_return', 'true');
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>Logging you in...</h2>
      <p>Please wait while we complete your authentication.</p>
    </div>
  );
}