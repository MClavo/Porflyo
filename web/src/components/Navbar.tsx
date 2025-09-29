import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { useAuthContext } from '../hooks/ui/useAuthContext';
import '../styles/navbar/Navbar.css';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if logout fails, redirect to home
      navigate('/');
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
        
        <button 
          className="navbar-logout"
          onClick={handleLogout}
        >
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;