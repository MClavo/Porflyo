import "../styles/pages/root.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiGithub, FiLayout, FiBarChart2, FiZap } from "react-icons/fi";
import { TbWorldCheck } from "react-icons/tb";
import { LoginButton } from "../components/buttons/loginButton";
import { useAuthContext } from "../hooks/ui/useAuthContext";
import { ThemeToggle } from "../components/theme";
import { useSEO } from "../hooks/useSEO";

function Root() {
  const navigate = useNavigate();
  const { isLoading, refetch } = useAuthContext();

  // SEO Configuration for landing page (indexable)
  useSEO({
    title: 'porflyo - Create, Publish, and Track Your Project Portfolios',
    description: 'Build stunning portfolios from your GitHub projects and get detailed analytics on visitor engagement. Connect, create, and share your work with porflyo.',
    keywords: 'portfolio, github, projects, developer portfolio, analytics, project showcase, github portfolio',
    canonicalUrl: 'https://porflyo.com/',
    noIndex: false, // Allow indexing on root
  });

  useEffect(() => {
    const handleOAuthReturn = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hasOAuthParams = urlParams.has('code') || urlParams.has('state') || urlParams.has('access_token');
      
      if (hasOAuthParams) {
        try {
          // Set flag to indicate OAuth return
          sessionStorage.setItem('oauth_return', 'true');
          
          // Refetch auth status to get the latest user data
          await refetch();
          
          // Clean up URL parameters
          const newUrl = new URL(window.location.href);
          newUrl.search = '';
          window.history.replaceState({}, '', newUrl.pathname);
          
          // Navigate to home after successful OAuth
          navigate('/home', { replace: true });
        } catch (error) {
          console.error('Error processing OAuth return:', error);
          sessionStorage.removeItem('oauth_return');
        }
      }
    };

    // Only handle OAuth return if we're not loading and have OAuth parameters
    if (!isLoading) {
      handleOAuthReturn();
    }
  }, [isLoading, refetch, navigate]);

  // Add a class to the body while this Root page is mounted so the background
  // applies only to the body when the Root route is active.
  useEffect(() => {
    document.body.classList.add('root-body-bg');
    return () => {
      document.body.classList.remove('root-body-bg');
    };
  }, []);

  return (
    <div className="root-page">
      {/* Landing Navbar */}
      <nav className="landing-navbar">
        <div className="landing-navbar-content">
          <div className="landing-navbar-actions">
            <ThemeToggle />
            <a 
              href="https://github.com/MClavo/Porflyo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="github-link"
              aria-label="View on GitHub"
            >
              <FiGithub size={20} />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="root-content">
        <div className="hero-section">
          <h1>poRflyo</h1>
          <p className="hero-tagline">create, publish, and track your project portfolios</p>
          <p className="hero-description">
            build stunning portfolios from your GitHub projects and get detailed analytics on visitor engagement.
          </p>
          <LoginButton>
            <strong>Get Started with GitHub</strong>
          </LoginButton>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FiZap size={24} />
            </div>
            <h3>Quick Setup</h3>
            <p>Connect your GitHub account and start building in minutes</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FiLayout size={24} />
            </div>
            <h3>Custom Portfolios</h3>
            <p>Design beautiful portfolios with your selected projects</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FiBarChart2 size={24} />
            </div>
            <h3>Track Metrics</h3>
            <p>Monitor views, engagement, and visitor analytics</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <TbWorldCheck size={24} />
            </div>
            <h3>Share Anywhere</h3>
            <p>Publish and share your portfolio with a custom URL</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Root;
