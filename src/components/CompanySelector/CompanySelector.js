import React, { useState } from 'react';
import { normalizeSymbol, getSymbolError, isDuplicateSymbol } from '../../utils/symbolValidator';
import { COMPANY_SYMBOLS } from '../../constants/companies';
import './CompanySelector.css';

const CompanySelector = ({ onSymbolSubmit, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const normalized = normalizeSymbol(inputValue);
    
    // Validate format
    const validationError = getSymbolError(normalized);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Check for duplicates
    if (isDuplicateSymbol(normalized, COMPANY_SYMBOLS)) {
      setError(`${normalized} is already displayed in the dashboard above`);
      return;
    }

    // Submit the symbol
    onSymbolSubmit(normalized);
    setInputValue('');
    setError(null);
  };

  const handleClear = () => {
    setInputValue('');
    setError(null);
  };

  return (
    <div className="company-selector">
      <form onSubmit={handleSubmit} className="company-selector-form">
        <div className="company-selector-header">
          <h3>Add Custom Company</h3>
          <p className="company-selector-description">
            Enter any stock ticker symbol to view its performance
          </p>
        </div>
        
        <div className="company-selector-input-group">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter symbol (e.g., AAPL)"
            className={`company-selector-input ${error ? 'error' : ''}`}
            disabled={isLoading}
            maxLength={5}
            aria-label="Stock ticker symbol"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'symbol-error' : undefined}
          />
          
          {inputValue && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="company-selector-clear"
              aria-label="Clear input"
            >
              ✕
            </button>
          )}
          
          <button
            type="submit"
            className="company-selector-submit"
            disabled={isLoading || !inputValue}
            aria-label="Add company"
          >
            {isLoading ? 'Loading...' : 'Add Company'}
          </button>
        </div>

        {error && (
          <div id="symbol-error" className="company-selector-error" role="alert">
            ⚠️ {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default CompanySelector;

// Made with Bob
