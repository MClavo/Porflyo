/**
 * ModernHeatmap - Dashboard de mapa de calor moderno
 */


import { MetricsProvider } from '../contexts/MetricsProvider';
import '../styles/dashboard-theme.css';

function ModernHeatmapContent() {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: 'var(--space-12)',
      color: 'var(--text-secondary)'
    }}>
      <h2 style={{ 
        fontSize: 'var(--font-2xl)', 
        color: 'var(--text-primary)', 
        marginBottom: 'var(--space-4)'
      }}>
        🔥 Heatmap Dashboard
      </h2>
      <p style={{ fontSize: 'var(--font-lg)' }}>
        Coming soon... This will show interaction heatmaps and analytics
      </p>
      <div style={{
        marginTop: 'var(--space-8)',
        padding: 'var(--space-6)',
        background: 'var(--card-bg)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--card-border)',
        maxWidth: '500px',
        margin: 'var(--space-8) auto 0'
      }}>
        <p style={{ margin: 0, opacity: 0.7 }}>
          Esta página estará disponible próximamente con visualizaciones de mapas de calor
        </p>
      </div>
    </div>
  );
}

export default function ModernHeatmap() {
  return (
    <MetricsProvider portfolioId="default">
      <ModernHeatmapContent />
    </MetricsProvider>
  );
}