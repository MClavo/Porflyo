/**
 * ModernProjects - Modern projects management page
 */

import { useRef, useEffect, useState } from "react";
import { MetricsProvider } from "../contexts/MetricsProvider";
import "../styles/dashboard-theme.css";
import "../styles/modern-projects.css";

// Future props interface can be added here when needed

function ModernProjectsContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Simple readiness flag
  useEffect(() => {
    setTimeout(() => setIsReady(true), 200);
  }, []);

  return (
    <div
      className="modern-projects-container"
      style={{ position: "relative", padding: 'var(--space-4) 0', boxSizing: 'border-box' }}
    >
      <div
        ref={containerRef}
        className="modern-projects-content"
        style={{
          position: "relative",
          background: "var(--dashboard-bg-secondary)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          border: "1px solid var(--card-border)",
          minHeight: "600px",
          width: 'auto',
          maxWidth: 'none',
          boxSizing: 'border-box',
          padding: 'var(--space-6)'
        }}
        data-project-id="default"
      >
        {/* Header */}
        <div className="modern-projects-header" style={{ marginBottom: 'var(--space-6)' }}>
          <h1 
            style={{ 
              fontSize: 'var(--font-2xl)', 
              fontWeight: 700, 
              color: 'var(--text-primary)',
              margin: 0,
              marginBottom: 'var(--space-2)'
            }}
          >
            Projects Dashboard
          </h1>
          <p 
            style={{ 
              fontSize: 'var(--font-base)', 
              color: 'var(--text-secondary)',
              margin: 0
            }}
          >
            Manage and track your development projects
          </p>
        </div>

        {/* Main Content - Empty State */}
        <div 
          className="modern-projects-empty-state"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}
        >
          <div 
            style={{ 
              fontSize: '64px',
              marginBottom: 'var(--space-4)',
              opacity: 0.5
            }}
          >
            📊
          </div>
          <h2 
            style={{ 
              fontSize: 'var(--font-xl)', 
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
              marginBottom: 'var(--space-2)'
            }}
          >
            Projects Coming Soon
          </h2>
          <p 
            style={{ 
              fontSize: 'var(--font-base)',
              maxWidth: '400px',
              lineHeight: 1.6,
              margin: 0
            }}
          >
            This page will contain project management features, repository tracking, 
            and development analytics.
          </p>
        </div>

        {/* Debug info - only in development */}
        {import.meta.env.DEV && (
          <div
            style={{
              marginTop: "var(--space-6)",
              padding: "var(--space-3)",
              background: "rgba(0,0,0,0.1)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-xs)",
              color: "var(--text-secondary)",
            }}
          >
            <strong>Debug Info:</strong>
            <br />
            Page Ready: {isReady ? "✅" : "❌"}
            <br />
            Container: ModernProjects
            <br />
            Status: Empty State (Development)
          </div>
        )}
      </div>
    </div>
  );
}

export default function ModernProjects() {
  return (
    <div className="modern-projects-page">
      <MetricsProvider portfolioId="default">
        <ModernProjectsContent />
      </MetricsProvider>
    </div>
  );
}