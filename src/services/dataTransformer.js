// Data transformation layer to normalize Yahoo Finance responses

/**
 * Normalize quote data from Yahoo Finance API
 * @param {Object} rawQuote - Raw quote data from Yahoo Finance
 * @returns {Object} Normalized quote data
 */
export const normalizeQuoteData = (rawQuote) => {
  if (!rawQuote) {
    throw new Error('Invalid quote data');
  }

  return {
    symbol: rawQuote.symbol,
    name: rawQuote.shortName || rawQuote.longName || rawQuote.symbol,
    price: rawQuote.regularMarketPrice || rawQuote.price || 0,
    change: rawQuote.regularMarketChange || 0,
    changePercent: rawQuote.regularMarketChangePercent || 0,
    previousClose: rawQuote.regularMarketPreviousClose || 0,
    open: rawQuote.regularMarketOpen || 0,
    dayHigh: rawQuote.regularMarketDayHigh || 0,
    dayLow: rawQuote.regularMarketDayLow || 0,
    volume: rawQuote.regularMarketVolume || 0,
    marketCap: rawQuote.marketCap || 0,
    timestamp: rawQuote.regularMarketTime || Date.now(),
    currency: rawQuote.currency || 'USD',
    marketState: rawQuote.marketState || 'CLOSED',
    exchange: rawQuote.fullExchangeName || rawQuote.exchange || 'Unknown'
  };
};

/**
 * Normalize historical data from Yahoo Finance API
 * @param {Array} rawHistory - Raw historical data from Yahoo Finance
 * @param {string} symbol - Stock symbol
 * @param {string} timeWindow - Time window (day, week, quarter)
 * @returns {Object} Normalized historical data
 */
export const normalizeHistoricalData = (rawHistory, symbol, timeWindow) => {
  if (!rawHistory || !Array.isArray(rawHistory)) {
    throw new Error('Invalid historical data');
  }

  const dataPoints = rawHistory
    .filter(point => point && point.date) // Filter out invalid points
    .map(point => ({
      date: point.date instanceof Date ? point.date.toISOString() : new Date(point.date).toISOString(),
      open: point.open || 0,
      close: point.close || 0,
      high: point.high || 0,
      low: point.low || 0,
      volume: point.volume || 0,
      adjClose: point.adjClose || point.close || 0
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Ensure chronological order

  return {
    symbol,
    timeWindow,
    dataPoints,
    count: dataPoints.length,
    startDate: dataPoints.length > 0 ? dataPoints[0].date : null,
    endDate: dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].date : null
  };
};

/**
 * Normalize batch quote results
 * @param {Object} batchResults - Batch results from Yahoo Finance
 * @returns {Array} Array of normalized quotes
 */
export const normalizeBatchQuotes = (batchResults) => {
  if (!batchResults || !batchResults.quotes) {
    throw new Error('Invalid batch results');
  }

  return batchResults.quotes.map(quote => {
    try {
      return {
        success: true,
        data: normalizeQuoteData(quote)
      };
    } catch (error) {
      return {
        success: false,
        symbol: quote?.symbol || 'UNKNOWN',
        error: {
          type: 'TRANSFORM_ERROR',
          message: `Failed to normalize quote: ${error.message}`
        }
      };
    }
  });
};

/**
 * Calculate summary statistics from historical data
 * @param {Array} dataPoints - Array of historical data points
 * @returns {Object} Summary statistics
 */
export const calculateSummaryStats = (dataPoints) => {
  if (!dataPoints || dataPoints.length === 0) {
    return {
      min: 0,
      max: 0,
      average: 0,
      volatility: 0,
      trend: 'neutral'
    };
  }

  const closes = dataPoints.map(p => p.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const average = closes.reduce((sum, val) => sum + val, 0) / closes.length;

  // Calculate simple volatility (standard deviation)
  const squaredDiffs = closes.map(val => Math.pow(val - average, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / closes.length;
  const volatility = Math.sqrt(variance);

  // Determine trend (comparing first and last values)
  const firstClose = closes[0];
  const lastClose = closes[closes.length - 1];
  const changePercent = ((lastClose - firstClose) / firstClose) * 100;
  
  let trend = 'neutral';
  if (changePercent > 2) trend = 'bullish';
  else if (changePercent < -2) trend = 'bearish';

  return {
    min,
    max,
    average,
    volatility,
    trend,
    changePercent
  };
};

/**
 * Extract trend data for sparklines
 * @param {Array} dataPoints - Historical data points
 * @param {number} count - Number of points to extract (default: 7)
 * @returns {Array} Array of close prices
 */
export const extractTrendData = (dataPoints, count = 7) => {
  if (!dataPoints || dataPoints.length === 0) {
    return [];
  }

  // Get the last N points
  const lastPoints = dataPoints.slice(-count);
  return lastPoints.map(point => point.close);
};

/**
 * Validate and sanitize symbol
 * @param {string} symbol - Stock symbol
 * @returns {string} Sanitized symbol
 */
export const sanitizeSymbol = (symbol) => {
  if (!symbol || typeof symbol !== 'string') {
    throw new Error('Invalid symbol');
  }

  // Remove whitespace and convert to uppercase
  const sanitized = symbol.trim().toUpperCase();

  // Validate format (letters, numbers, dots, hyphens only)
  if (!/^[A-Z0-9.-]+$/.test(sanitized)) {
    throw new Error('Invalid symbol format');
  }

  return sanitized;
};

/**
 * Check if market data is stale
 * @param {number} timestamp - Data timestamp
 * @param {number} maxAgeMs - Maximum age in milliseconds (default: 5 minutes)
 * @returns {boolean} True if data is stale
 */
export const isDataStale = (timestamp, maxAgeMs = 5 * 60 * 1000) => {
  if (!timestamp) return true;
  return Date.now() - timestamp > maxAgeMs;
};

/**
 * Format error for user display
 * @param {Error} error - Error object
 * @param {string} symbol - Stock symbol (optional)
 * @returns {Object} Formatted error
 */
export const formatError = (error, symbol = null) => {
  const baseError = {
    type: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    symbol
  };

  if (!error) return baseError;

  // Check for specific error types
  if (error.message?.includes('404') || error.message?.includes('not found')) {
    return {
      type: 'SYMBOL_NOT_FOUND',
      message: `Symbol ${symbol || 'unknown'} not found`,
      symbol
    };
  }

  if (error.message?.includes('429') || error.message?.includes('rate limit')) {
    return {
      type: 'RATE_LIMIT',
      message: 'Too many requests. Please wait and try again.',
      symbol
    };
  }

  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return {
      type: 'NETWORK_ERROR',
      message: 'Network error. Please check your connection.',
      symbol
    };
  }

  return {
    type: 'API_ERROR',
    message: error.message || 'Failed to fetch data',
    symbol
  };
};

// Made with Bob
