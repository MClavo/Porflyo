import "../styles/pages/root.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginButton } from "../components/buttons/loginButton";
import { useAuthContext } from "../hooks/ui/useAuthContext";

function Root() {
  const navigate = useNavigate();
  const { isLoading, refetch } = useAuthContext();

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
        <h1>poRflyo</h1>
        <p>the easy way to build your project portfolios</p>
        <LoginButton>
          <strong>Sign in with GitHub</strong>
        </LoginButton>

    </div>
  );
}

export default Root;
