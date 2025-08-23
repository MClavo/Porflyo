import React from "react";
import { PortfolioEditor } from "../../components/portfolio/PortfolioEditor";
import { loadUserRepos, type RepoExtended } from "../../components/portfolio/data";
import type { PortfolioCreateDto, PortfolioPatchDto } from "../../types/dto";
import { useAuthUser } from "../../features/auth/hooks/useAuthUser";

export const PortfolioEditorPage: React.FC = () => {
  const { user, isLoading: loading, error } = useAuthUser();

  // Handle portfolio save
  const handleSave = async (dto: PortfolioCreateDto | PortfolioPatchDto) => {
    console.log("Portfolio save requested:", dto);
    
    // For MVP, just log the DTO structure
    console.group("📁 Portfolio Save Details");
    console.log("Type:", "template" in dto ? "CREATE" : "PATCH");
    console.log("Template:", dto.template);
    console.log("Sections count:", dto.sections?.length || 0);
    console.log("Sections:", dto.sections || []);
    console.groupEnd();
    
    // Simulate async save
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert("Portfolio saved successfully! (Check console for details)");
  };

  // Repository loader
  const handleLoadUserRepos = async (): Promise<RepoExtended[]> => {
    try {
      return await loadUserRepos();
    } catch (err) {
      console.error("Failed to load user repos:", err);
      
      // For MVP, provide mock repository data if API not ready
      return [
        {
          name: "portfolio-website",
          description: "My personal portfolio website built with React and TypeScript",
          html_url: "https://github.com/johndoe/portfolio-website",
          topics: ["react", "typescript", "portfolio", "frontend"],
          homepage: "https://johndoe.dev",
          stargazers_count: 42,
          language: "TypeScript"
        },
        {
          name: "todo-app",
          description: "A full-stack todo application with user authentication",
          html_url: "https://github.com/johndoe/todo-app",
          topics: ["react", "node", "mongodb", "fullstack"],
          homepage: "https://todo.johndoe.dev",
          stargazers_count: 18,
          language: "JavaScript"
        },
        {
          name: "weather-dashboard",
          description: "Real-time weather dashboard with beautiful visualizations",
          html_url: "https://github.com/johndoe/weather-dashboard",
          topics: ["vue", "weather-api", "charts", "dashboard"],
          homepage: "https://weather.johndoe.dev",
          stargazers_count: 25,
          language: "Vue"
        },
        {
          name: "api-gateway",
          description: "Microservices API gateway built with Node.js and Express",
          html_url: "https://github.com/johndoe/api-gateway",
          topics: ["nodejs", "express", "microservices", "api"],
          homepage: "",
          stargazers_count: 7,
          language: "JavaScript"
        }
      ];
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portfolio editor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load</h2>
          <p className="text-gray-600 mb-4">{error instanceof Error ? error.message : 'An error occurred'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No user data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Page Header */}
      <div className="card" style={{ marginBottom: 0, borderRadius: 0, borderLeft: 0, borderRight: 0, borderTop: 0 }}>
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="card-title" style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Portfolio Editor</h1>
              <p className="card-description">Create and customize your portfolio</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{user.name}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user.email}</div>
              </div>
              {user.profileImage && (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Editor Container */}
      <div style={{ padding: '1.5rem' }}>
        <PortfolioEditor
          user={user}
          initialPortfolio={null} // null for new portfolio creation
          loadUserRepos={handleLoadUserRepos}
          onSave={handleSave}
          mode="create"
        />
      </div>

      {/* Debug Information (development only) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-sm max-w-md">
          <div className="font-bold mb-2">🔧 Debug Info</div>
          <div>User: {user.name}</div>
          <div>Mode: Create Portfolio</div>
          <div>API Status: {error ? "Error" : "Connected"}</div>
        </div>
      )}
    </div>
  );
};
