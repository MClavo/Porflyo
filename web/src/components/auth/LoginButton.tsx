import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../api/clients/user.api';
import { useAuthContext } from '../../hooks/useAuthContext';

/**
 * OAuth login configuration
 * Based on backend OAuth handler at /oauth/login/github
 */
const LOGIN_URL = import.meta.env.VITE_OAUTH_LOGIN_URL || '/oauth/login/github';

interface LoginButtonProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Login button component that handles authentication flow
 * First tries to get user (check session), if fails redirects to OAuth
 */
export function LoginButton({ className = '', children }: LoginButtonProps) {
  const [isChecking, setIsChecking] = useState(false);
  const { setAuthenticatedUser } = useAuthContext();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (isChecking) return; // Prevent multiple clicks
    
    setIsChecking(true);
    
    try {
      // First attempt: try to get user data (this will send the cookie)
      const user = await getUser();

      // If backend returned a 304 Not Modified or an empty/partial payload,
      // make sure the user object has expected fields. PublicUserDto contains
      // fields like name, email and providerUserName. If none are present,
      // treat as unauthenticated.
      const hasValidUser = !!user && (
        (typeof user.name === 'string' && user.name.length > 0) ||
        (typeof user.email === 'string' && user.email.length > 0) ||
        (typeof user.providerUserName === 'string' && user.providerUserName.length > 0)
      );

      if (!hasValidUser) {
        console.log('getUser returned empty/invalid user, redirecting to OAuth login');
        // Set flag to indicate we're going to OAuth
        sessionStorage.setItem('oauth_return', 'true');
        window.location.href = LOGIN_URL;
        return;
      }

      console.log('User already authenticated:', user.name ?? user.providerUserName ?? 'unknown');
      // User is authenticated, update context and navigate to home
      setAuthenticatedUser(user);
      navigate('/home');
    } catch (err) {
      // If getUser fails (network error, 401, 403, etc.), redirect to OAuth login
      console.log('No valid session or error during getUser, redirecting to OAuth login', err);
      // Set flag to indicate we're going to OAuth
      sessionStorage.setItem('oauth_return', 'true');
      window.location.href = LOGIN_URL;
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={isChecking}
      className={`inline-flex items-center gap-2 px-6 py-3 bg-transparent border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-200 backdrop-blur-sm ${className} ${isChecking ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
      </svg>
      {children || 'Sign in with GitHub'}
    </button>
  );
}