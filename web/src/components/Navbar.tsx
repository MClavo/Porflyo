import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { useAuthContext } from '../hooks/ui/useAuthContext';
import { ThemeToggle } from './theme';
import '../styles/navbar/Navbar.css';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogout = async () => {
    try {
      // Perform any client-side logout cleanup from the auth context
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always redirect to the server-side logout route to clear session
      // and show the logged-out UI
      window.location.href = '/logout';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <button 
          className="navbar-logo"
          onClick={handleLogoClick}
        >
          poRflyo
        </button>
        
        <div className="navbar-actions">
          <ThemeToggle />
          <button 
            className="navbar-logout"
            onClick={handleLogout}
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;