// Simple layout without Chakra UI v3 advanced features

import React from 'react';

interface SimpleLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/metrics/overview', label: 'Overview' },
  { path: '/metrics/heatmap', label: 'Heatmap' },
  { path: '/metrics/projects', label: 'Projects' },
  { path: '/metrics/daily', label: 'Daily' },
  { path: '/metrics/trends', label: 'Trends' },
];

export const SimpleLayout: React.FC<SimpleLayoutProps> = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7fafc' }}>
      {/* Header Navigation */}
      <header
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Logo/Brand */}
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1a202c', margin: 0 }}>
            Porflyo Metrics
          </h1>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', gap: '0.25rem' }}>
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#4a5568',
                  backgroundColor: 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f7fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};