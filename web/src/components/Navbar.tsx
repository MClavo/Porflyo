import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Navbar: React.FC = () => {
  const { user, logout } = useUser();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    window.location.href = '/logout';
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="logo">
          Porflyo
        </Link>
        
        {user && (
          <div className="nav-links">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/profile" 
              className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
            >
              Profile
            </Link>
            
            <div className="user-profile">
              <img 
                src={user.avatarUrl} 
                alt="Avatar" 
                className="user-avatar"
              />
              <div className="user-info">
                <h3>{user.name}</h3>
                <p>{user.email}</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="btn btn-outline btn-sm"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
