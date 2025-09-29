import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../api/clients/user.api';
import { useAuthContext } from '../../hooks/ui/useAuthContext';
import './loginButton.css';

const LOGIN_URL = import.meta.env.VITE_OAUTH_LOGIN_URL || '/oauth/login/github';

export interface Props {
  className?: string;
  children?: React.ReactNode;
}

export function LoginButton({ className = '', children }: Props) {
  const [isChecking, setIsChecking] = useState(false);
  const { setAuthenticatedUser } = useAuthContext();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (isChecking) return;
    setIsChecking(true);
    try {
      const user = await getUser();

      const hasValidUser = !!user && (
        (typeof user.name === 'string' && user.name.length > 0) ||
        (typeof user.email === 'string' && user.email.length > 0) ||
        (typeof user.providerUserName === 'string' && user.providerUserName.length > 0)
      );

      if (!hasValidUser) {
        sessionStorage.setItem('oauth_return', 'true');
        window.location.href = LOGIN_URL;
        return;
      }

      setAuthenticatedUser(user);
      navigate('/home');
    } catch {
      sessionStorage.setItem('oauth_return', 'true');
      window.location.href = LOGIN_URL;
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className={`galaxy-button ${className}`}>
      <button
        type="button"
        className="space-button"
        onClick={handleLogin}
        disabled={isChecking}
        aria-label="Sign in with GitHub"
      >
        <span className="backdrop" />
        <span className="galaxy" />
        <svg className="github-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden>
          <path fill="currentColor" d="M12 .297a12 12 0 00-3.793 23.402c.6.111.793-.261.793-.579 0-.286-.011-1.042-.017-2.045-3.226.701-3.905-1.553-3.905-1.553-.528-1.342-1.289-1.7-1.289-1.7-1.053-.72.08-.706.08-.706 1.165.082 1.776 1.197 1.776 1.197 1.036 1.774 2.72 1.262 3.384.966.105-.75.405-1.263.737-1.555-2.575-.293-5.284-1.287-5.284-5.73 0-1.266.452-2.301 1.193-3.113-.12-.293-.517-1.472.114-3.067 0 0 .974-.312 3.19 1.19a11.1 11.1 0 012.905-.39c.986.005 1.98.133 2.906.39 2.213-1.502 3.185-1.19 3.185-1.19.633 1.595.236 2.774.116 3.067.743.812 1.193 1.847 1.193 3.113 0 4.455-2.714 5.433-5.298 5.72.417.36.789 1.089.789 2.197 0 1.586-.015 2.865-.015 3.255 0 .321.19.694.8.576A12 12 0 0012 .297z"/>
        </svg>
        <span className="text">{children || 'Sign in with GitHub'}</span>
      </button>
      <div className="bodydrop" />
    </div>
  );
}

export default LoginButton;
