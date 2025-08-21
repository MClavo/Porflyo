interface ErrorMessageProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ title, message, onRetry }: ErrorMessageProps) {
  return (
    <div className="error-container" style={{ padding: '2rem', textAlign: 'center' }}>
      <div className="error-content">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#ef4444' }}>
          {title}
        </h2>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          {message}
        </p>
        {onRetry && (
          <button onClick={onRetry} className="btn">
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
