// Unified Finance Service - Supports both mock and real Yahoo Finance data
import { generateMockQuote, generateMockHistoricalData, simulateDelay } from './mockData';
import { extractTrendData } from './dataTransformer';

// Configuration: Set to false to use real Yahoo Finance API via backend
// Note: Real API requires a backend proxy server
// The yahoo-finance2 library is Node.js only and cannot run in the browser
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA !== 'false';

// Backend API endpoint for real Yahoo Finance data (when USE_MOCK_DATA is false)
// You would implement this as a separate Node.js backend service
const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:3001/api';

/**
 * Unified Finance Service
 * Provides a consistent interface for both mock and real market data
 */
class FinanceService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 60000; // 1 minute
    this.useMockData = USE_MOCK_DATA;
  }

  /**
   * Get current quote for a symbol
   * @param {string} symbol - Stock ticker symbol
   * @returns {Promise<Object>} Quote data with success/error status
   */
  async getQuote(symbol) {
    const cacheKey = `quote_${symbol}`;
    const cached = this._getFromCache(cacheKey);
    
    if (cached) {
      return { success: true, data: cached, cached: true };
    }

    try {
      let data;
      
      if (this.useMockData) {
        // Use mock data
        await simulateDelay(300);
        data = generateMockQuote(symbol);
      } else {
        // Use real Yahoo Finance API via backend proxy
        const response = await fetch(`${BACKEND_API_URL}/quote/${symbol}`);
        if (!response.ok) {
          return {
            success: false,
            error: `Backend API error: ${response.statusText}`,
            data: null
          };
        }
        const result = await response.json();
        if (!result.success) {
          return result;
        }
        data = result.data;
      }

      this._setCache(cacheKey, data);
      return { success: true, data, cached: false };
    } catch (error) {
      console.error(`Failed to fetch quote for ${symbol}:`, error);
      return {
        success: false,
        error: {
          type: this._classifyError(error),
          message: this._getUserFriendlyMessage(error),
          originalError: error
        }
      };
    }
  }

  /**
   * Get historical data for a symbol
   * @param {string} symbol - Stock ticker symbol
   * @param {string} timeWindow - 'day', 'week', or 'quarter'
   * @returns {Promise<Object>} Historical data with success/error status
   */
  async getHistoricalData(symbol, timeWindow = 'week') {
    const cacheKey = `historical_${symbol}_${timeWindow}`;
    const cached = this._getFromCache(cacheKey);
    
    if (cached) {
      return { success: true, data: cached, cached: true };
    }

    try {
      let data;
      
      if (this.useMockData) {
        // Use mock data
        await simulateDelay(400);
        const days = this._getTimeWindowDays(timeWindow);
        const dataPoints = generateMockHistoricalData(symbol, days);
        data = {
          symbol,
          timeWindow,
          dataPoints,
          count: dataPoints.length
        };
      } else {
        // Use real Yahoo Finance API via backend proxy
        const options = this._getTimeWindowOptions(timeWindow);
        const params = new URLSearchParams({
          period1: options.period1,
          period2: options.period2,
          interval: options.interval
        });
        const response = await fetch(`${BACKEND_API_URL}/historical/${symbol}?${params}`);
        if (!response.ok) {
          return {
            success: false,
            error: `Backend API error: ${response.statusText}`,
            data: null
          };
        }
        const result = await response.json();
        if (!result.success) {
          return result;
        }
        data = result.data;
      }

      this._setCache(cacheKey, data);
      return { success: true, data, cached: false };
    } catch (error) {
      console.error(`Failed to fetch historical data for ${symbol}:`, error);
      return {
        success: false,
        error: {
          type: this._classifyError(error),
          message: this._getUserFriendlyMessage(error),
          originalError: error
        }
      };
    }
  }

  /**
   * Get quotes for multiple symbols
   * @param {Array<string>} symbols - Array of stock ticker symbols
   * @returns {Promise<Array>} Array of quote results
   */
  async getBatchQuotes(symbols) {
    if (this.useMockData) {
      // Mock data: fetch sequentially with delay
      const promises = symbols.map(symbol => this.getQuote(symbol));
      const results = await Promise.allSettled(promises);
      
      return results.map((result, index) => ({
        symbol: symbols[index],
        ...(result.status === 'fulfilled' ? result.value : {
          success: false,
          error: { type: 'BATCH_ERROR', message: 'Failed to fetch' }
        })
      }));
    } else {
      // Real API: use batch endpoint via backend proxy
      const response = await fetch(`${BACKEND_API_URL}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols })
      });
      if (!response.ok) {
        return {
          success: false,
          error: `Backend API error: ${response.statusText}`,
          data: null
        };
      }
      return await response.json();
    }
  }

  /**
   * Get historical data for multiple symbols
   * @param {Array<string>} symbols - Array of stock ticker symbols
   * @param {string} timeWindow - Time window for historical data
   * @returns {Promise<Array>} Array of historical data results
   */
  async getBatchHistoricalData(symbols, timeWindow) {
    if (this.useMockData) {
      // Mock data: fetch sequentially
      const promises = symbols.map(symbol => 
        this.getHistoricalData(symbol, timeWindow)
      );
      const results = await Promise.allSettled(promises);
      
      return results.map((result, index) => ({
        symbol: symbols[index],
        ...(result.status === 'fulfilled' ? result.value : {
          success: false,
          error: { type: 'BATCH_ERROR', message: 'Failed to fetch' }
        })
      }));
    } else {
      // Real API: use batch endpoint via backend proxy
      const options = this._getTimeWindowOptions(timeWindow);
      const params = new URLSearchParams({
        period1: options.period1,
        period2: options.period2,
        interval: options.interval
      });
      const response = await fetch(`${BACKEND_API_URL}/historical-batch?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols })
      });
      if (!response.ok) {
        return {
          success: false,
          error: `Backend API error: ${response.statusText}`,
          data: null
        };
      }
      return await response.json();
    }
  }

  /**
   * Search for symbols (real API only)
   * @param {string} query - Search query
   * @returns {Promise<Object>} Search results
   */
  async searchSymbols(query) {
    if (this.useMockData) {
      return {
        success: false,
        error: {
          type: 'NOT_SUPPORTED',
          message: 'Symbol search not available in mock mode'
        }
      };
    }
    
    // Search via backend proxy
    const response = await fetch(`${BACKEND_API_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      return {
        success: false,
        error: `Backend API error: ${response.statusText}`,
        data: null
      };
    }
    return await response.json();
  }

  /**
   * Get comprehensive market data for a symbol
   * Includes quote, historical data, and trend analysis
   * @param {string} symbol - Stock ticker symbol
   * @param {string} timeWindow - Time window for historical data
   * @returns {Promise<Object>} Comprehensive market data
   */
  async getComprehensiveData(symbol, timeWindow = 'week') {
    try {
      // Fetch quote and historical data in parallel
      const [quoteResult, historicalResult] = await Promise.all([
        this.getQuote(symbol),
        this.getHistoricalData(symbol, timeWindow)
      ]);

      if (!quoteResult.success || !historicalResult.success) {
        return {
          success: false,
          error: quoteResult.error || historicalResult.error
        };
      }

      // Extract trend data for sparklines
      const trend = extractTrendData(historicalResult.data.dataPoints, 7);

      return {
        success: true,
        data: {
          symbol,
          quote: quoteResult.data,
          historical: historicalResult.data,
          trend,
          timeWindow
        }
      };
    } catch (error) {
      console.error(`Failed to fetch comprehensive data for ${symbol}:`, error);
      return {
        success: false,
        error: {
          type: 'COMPREHENSIVE_ERROR',
          message: 'Failed to fetch complete market data',
          originalError: error
        }
      };
    }
  }

  /**
   * Toggle between mock and real data
   * @param {boolean} useMock - Whether to use mock data
   */
  setDataSource(useMock) {
    this.useMockData = useMock;
    this.clearCache();
  }

  /**
   * Check if using mock data
   * @returns {boolean} True if using mock data
   */
  isUsingMockData() {
    return this.useMockData;
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache.clear();
    // Note: Backend cache clearing would require a separate API endpoint
  }

  /**
   * Get time window options for Yahoo Finance API
   * @private
   */
  _getTimeWindowOptions(timeWindow) {
    const now = new Date();
    const options = {
      timeWindow
    };

    switch (timeWindow) {
      case 'day':
        options.period1 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        options.period2 = now;
        options.interval = '5m';
        break;
      case 'week':
        options.period1 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        options.period2 = now;
        options.interval = '1h';
        break;
      case 'quarter':
        options.period1 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        options.period2 = now;
        options.interval = '1d';
        break;
      default:
        options.period1 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        options.period2 = now;
        options.interval = '1d';
    }

    return options;
  }

  /**
   * Get number of days for time window (mock data)
   * @private
   */
  _getTimeWindowDays(timeWindow) {
    switch (timeWindow) {
      case 'day': return 1;
      case 'week': return 7;
      case 'quarter': return 90;
      default: return 7;
    }
  }

  /**
   * Get data from cache if not expired
   * @private
   */
  _getFromCache(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  /**
   * Set data in cache with TTL
   * @private
   */
  _setCache(key, data) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.cacheTTL
    });
  }

  /**
   * Classify error type
   * @private
   */
  _classifyError(error) {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('404') || message.includes('not found')) {
      return 'SYMBOL_NOT_FOUND';
    }
    if (message.includes('429') || message.includes('rate limit')) {
      return 'RATE_LIMIT';
    }
    
    return 'API_ERROR';
  }

  /**
   * Get user-friendly error message
   * @private
   */
  _getUserFriendlyMessage(error) {
    const type = this._classifyError(error);
    
    const messages = {
      NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
      SYMBOL_NOT_FOUND: 'Company symbol not found. Please verify the ticker.',
      RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
      API_ERROR: 'Unable to fetch market data. Please try again later.'
    };
    
    return messages[type] || messages.API_ERROR;
  }
}

// Create and export singleton instance
const financeServiceInstance = new FinanceService();
export default financeServiceInstance;

// Made with Bob
