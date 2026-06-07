/**
 * Symbol Validator Utility
 * Validates and normalizes stock ticker symbols
 */

/**
 * Check if symbol format is valid
 * @param {string} symbol - Stock ticker symbol
 * @returns {boolean} True if valid format
 */
export const isValidSymbolFormat = (symbol) => {
  if (!symbol || typeof symbol !== 'string') {
    return false;
  }
  // Valid symbols: 1-5 uppercase letters
  return /^[A-Z]{1,5}$/.test(symbol);
};

/**
 * Normalize symbol input
 * @param {string} input - Raw user input
 * @returns {string} Normalized symbol (uppercase, trimmed)
 */
export const normalizeSymbol = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return input.trim().toUpperCase();
};

/**
 * Get validation error message
 * @param {string} symbol - Symbol to validate
 * @returns {string|null} Error message or null if valid
 */
export const getSymbolError = (symbol) => {
  if (!symbol || symbol.length === 0) {
    return 'Please enter a ticker symbol';
  }
  
  if (!/^[A-Za-z]+$/.test(symbol)) {
    return 'Symbol must contain only letters';
  }
  
  if (symbol.length > 5) {
    return 'Symbol must be 5 characters or less';
  }
  
  return null;
};

/**
 * Check if symbol is in the default company list
 * @param {string} symbol - Symbol to check
 * @param {Array} defaultSymbols - Array of default symbols
 * @returns {boolean} True if symbol is already displayed
 */
export const isDuplicateSymbol = (symbol, defaultSymbols = []) => {
  return defaultSymbols.includes(symbol.toUpperCase());
};

// Made with Bob
