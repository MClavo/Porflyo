/**
 * NoDataMessage - Empty state component for when no metrics data is available
 */

import '../../styles/dashboard-theme.css';

interface NoDataMessageProps {
  title?: string;
  message?: string;
}

export function NoDataMessage({ 
  title = "No data available",
  message = "There is not enough data to display metrics yet. Please check back later."
}: NoDataMessageProps) {
  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
      background: 'var(--dashboard-bg)',
      minHeight: '100vh'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2.5rem 0',
        color: 'var(--text-primary)'
      }}>
        <div style={{
          color: 'var(--text-secondary)',
          fontSize: 'var(--font-lg)',
          marginBottom: '1rem',
          fontWeight: '600'
        }}>
          {title}
        </div>
        <div style={{
          color: 'var(--text-tertiary)',
          fontSize: 'var(--font-sm)'
        }}>
          {message}
        </div>
      </div>
    </div>
  );
}
