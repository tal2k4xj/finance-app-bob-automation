import React from 'react';
import './ErrorBoundary.css';

const ErrorBoundary = ({ error, onRetry, showPartialData, children }) => {
  if (!error) {
    return children;
  }

  const isPartialError = error.type === 'PARTIAL_ERROR';

  return (
    <div className={`error-boundary ${isPartialError ? 'partial-error' : 'full-error'}`}>
      <div className="error-content">
        <div className="error-icon">
          {isPartialError ? '⚠️' : '❌'}
        </div>
        <h2 className="error-title">
          {isPartialError ? 'Partial Data Available' : 'Something went wrong'}
        </h2>
        <p className="error-message">{error.message}</p>
        
        {error.failedSymbols && error.failedSymbols.length > 0 && (
          <div className="failed-symbols">
            <p>Failed to load: {error.failedSymbols.join(', ')}</p>
          </div>
        )}

        <div className="error-actions">
          {onRetry && (
            <button className="retry-button" onClick={onRetry}>
              Try Again
            </button>
          )}
          {isPartialError && showPartialData && (
            <button className="show-data-button" onClick={showPartialData}>
              Show Available Data
            </button>
          )}
        </div>

        {process.env.NODE_ENV === 'development' && error.originalError && (
          <details className="error-details">
            <summary>Error Details (Development Only)</summary>
            <pre>{JSON.stringify(error.originalError, null, 2)}</pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;

// Made with Bob
