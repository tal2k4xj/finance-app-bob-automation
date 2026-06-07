// Mock data for development and fallback
import { COMPANY_SYMBOLS } from '../constants/companies';

/**
 * Generate mock quote data for a symbol
 * @param {string} symbol - Stock symbol
 * @returns {Object} Mock quote data
 */
export const generateMockQuote = (symbol) => {
  const basePrice = {
    IBM: 150,
    MSFT: 380,
    ORCL: 120,
    SAP: 140,
    CRM: 220
  }[symbol] || 100;
  
  const change = (Math.random() - 0.5) * 10;
  const price = basePrice + change;
  const changePercent = (change / basePrice) * 100;
  
  return {
    symbol,
    name: getCompanyName(symbol),
    price: parseFloat(price.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    timestamp: Date.now(),
    currency: 'USD',
    marketState: 'REGULAR'
  };
};

/**
 * Generate mock historical data
 * @param {string} symbol - Stock symbol
 * @param {number} days - Number of days of data
 * @returns {Array} Array of historical data points
 */
export const generateMockHistoricalData = (symbol, days = 7) => {
  const basePrice = {
    IBM: 150,
    MSFT: 380,
    ORCL: 120,
    SAP: 140,
    CRM: 220
  }[symbol] || 100;
  
  const dataPoints = [];
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now - (i * dayInMs));
    const variance = (Math.random() - 0.5) * 20;
    const price = basePrice + variance;
    
    dataPoints.push({
      date: date.toISOString(),
      open: parseFloat((price - 2).toFixed(2)),
      close: parseFloat(price.toFixed(2)),
      high: parseFloat((price + 3).toFixed(2)),
      low: parseFloat((price - 3).toFixed(2)),
      volume: Math.floor(Math.random() * 10000000)
    });
  }
  
  return dataPoints;
};

/**
 * Generate mock data for all companies
 * @returns {Object} Object with mock data for all symbols
 */
export const generateMockDataForAll = () => {
  const mockData = {};
  
  COMPANY_SYMBOLS.forEach(symbol => {
    mockData[symbol] = {
      quote: generateMockQuote(symbol),
      historical: generateMockHistoricalData(symbol, 7)
    };
  });
  
  return mockData;
};

/**
 * Get company name from symbol
 * @param {string} symbol - Stock symbol
 * @returns {string} Company name
 */
const getCompanyName = (symbol) => {
  const names = {
    IBM: 'International Business Machines',
    MSFT: 'Microsoft Corporation',
    ORCL: 'Oracle Corporation',
    SAP: 'SAP SE',
    CRM: 'Salesforce Inc.'
  };
  return names[symbol] || symbol;
};

/**
 * Simulate API delay
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise} Promise that resolves after delay
 */
export const simulateDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Made with Bob
