import "../styles/main.css";
import "../styles/root.css";
import "../styles/grafite.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DotGridBackground from "../components/DotGrid";
import ProjectCard from "../components/cards/ProjectCard";
import { LoginButton } from "../components/auth/LoginButton";
// Update the import path to match the actual file name (e.g., useAuthContext.ts or useAuthContext/index.ts)
// For example, if the file is named useAuthContext.tsx:
import { useAuthContext } from "../hooks/ui/useAuthContext";

export const DarkModeToggle = () => {
  const title1 = "Project 1";
  const title2 = "Project 2";
  const title3 = "Project 3";

  const description1 = "a simple card component that displays an image, title, and description. It is designed to be reusable and customizable, allowing you to easily showcase different content in a visually appealing way.";
  const description2 = "another simple card component that displays an image, title, and description. It is designed to be reusable and customizable, allowing you to easily showcase different content in a visually appealing way. The component supports responsive layouts, configurable styles and subtle animations, includes accessible markup and keyboard support, and can optionally render action buttons, tags, or links for interaction—making it ideal for galleries, portfolios, feature highlights, and modular UI compositions.";
  const description3 = "";

  const technologies1 = ["React", "TypeScript", "CSS", "HTML", "Node.js", "Express", "MongoDB"];
  
  const technologies3 = ["Python", "Django", "PostgreSQL", "Docker", "AWS"];

  const image1 = "https://i.pinimg.com/1200x/ea/c2/b7/eac2b7844ad390cd510dc94bb4e7a7ab.jpg";
  const image2 = "https://i.pinimg.com/736x/f0/81/b9/f081b9c555b8588b4a39d95eab73310d.jpg";
  const image3 = "https://i.pinimg.com/736x/53/3d/c4/533dc4300696a27d40dc8d2e5969073c.jpg";

  const ProjectSection = () => {
    return (
      <div className="card">
        <h2>Projects</h2>
          <div className="project-section test">
            <ProjectCard images={[image1]} title={title1} description={description1} techTitle="Technologies" technologies={technologies1} />
            <ProjectCard images={[image2]} title={title2} description={description2} techTitle="Tech Stack" technologies={[]} />
            <ProjectCard images={[image3]} title={title3} description={description3} techTitle="Technologies" technologies={technologies3} />

          </div>
      </div>
    );
  };

  return (
    <section>
      <div className="cards">
        <div className="title card glass">
          <h1>poRflyo</h1>
          <p>the easy way to build your project portfolios</p>
          <div style={{ marginTop: '1rem' }}>
            <LoginButton className="glass" />
          </div>
        </div>
        <ProjectSection />
        <div className="card">
          <h2>Example Section 2</h2>
          <p>This is another example paragraph.</p>
        </div>
        <div className="card">
          <h2>Example Section 3</h2>
          <p>Este es un párrafo de ejemplo en español.</p>
        </div>
        <div className="card">
          <h2>Example Section 4</h2>
          <p>This is yet another example paragraph.</p>
        </div>
        <div className="card">
          <h2>Example Section 5</h2>
          <p>This is a final example paragraph.</p>
        </div>
      </div>
    </section>
  );
};

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

  return (
    <>
      <DotGridBackground />
      <div className="wrapper">
       
      <DarkModeToggle />
      </div>
    </>
  );
}

export default Root;
