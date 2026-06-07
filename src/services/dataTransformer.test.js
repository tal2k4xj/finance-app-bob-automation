/**
 * Data Transformer Tests
 * Tests for data normalization and transformation utilities
 */

import {
  normalizeQuoteData,
  normalizeHistoricalData,
  calculateSummaryStats,
  extractTrendData,
  sanitizeSymbol,
  formatError
} from './dataTransformer';

describe('dataTransformer', () => {
  describe('normalizeQuoteData', () => {
    it('should normalize valid quote data', () => {
      const rawQuote = {
        symbol: 'IBM',
        longName: 'International Business Machines Corporation',
        regularMarketPrice: 185.42,
        regularMarketChange: 2.15,
        regularMarketChangePercent: 1.17,
        regularMarketVolume: 4523000,
        marketCap: 170500000000,
        regularMarketDayHigh: 186.50,
        regularMarketDayLow: 183.20,
        regularMarketOpen: 184.00,
        regularMarketPreviousClose: 183.27
      };

      const normalized = normalizeQuoteData(rawQuote);

      expect(normalized).toEqual({
        symbol: 'IBM',
        name: 'International Business Machines Corporation',
        price: 185.42,
        change: 2.15,
        changePercent: 1.17,
        volume: 4523000,
        marketCap: 170500000000,
        high: 186.50,
        low: 183.20,
        open: 184.00,
        previousClose: 183.27
      });
    });

    it('should handle missing optional fields', () => {
      const rawQuote = {
        symbol: 'IBM',
        regularMarketPrice: 185.42
      };

      const normalized = normalizeQuoteData(rawQuote);

      expect(normalized.symbol).toBe('IBM');
      expect(normalized.price).toBe(185.42);
      expect(normalized.name).toBe('IBM');
      expect(normalized.change).toBe(0);
      expect(normalized.changePercent).toBe(0);
    });

    it('should use shortName as fallback for name', () => {
      const rawQuote = {
        symbol: 'IBM',
        shortName: 'IBM Corp',
        regularMarketPrice: 185.42
      };

      const normalized = normalizeQuoteData(rawQuote);

      expect(normalized.name).toBe('IBM Corp');
    });

    it('should handle null or undefined input', () => {
      expect(() => normalizeQuoteData(null)).toThrow();
      expect(() => normalizeQuoteData(undefined)).toThrow();
    });
  });

  describe('normalizeHistoricalData', () => {
    it('should normalize historical data array', () => {
      const rawData = [
        {
          date: new Date('2024-01-15'),
          open: 184.00,
          high: 186.50,
          low: 183.20,
          close: 185.42,
          volume: 4523000
        },
        {
          date: new Date('2024-01-16'),
          open: 185.50,
          high: 187.00,
          low: 184.80,
          close: 186.20,
          volume: 4821000
        }
      ];

      const normalized = normalizeHistoricalData(rawData);

      expect(normalized).toHaveLength(2);
      expect(normalized[0]).toEqual({
        date: '2024-01-15T00:00:00.000Z',
        open: 184.00,
        high: 186.50,
        low: 183.20,
        close: 185.42,
        volume: 4523000
      });
    });

    it('should sort data chronologically', () => {
      const rawData = [
        {
          date: new Date('2024-01-16'),
          close: 186.20
        },
        {
          date: new Date('2024-01-15'),
          close: 185.42
        }
      ];

      const normalized = normalizeHistoricalData(rawData);

      expect(new Date(normalized[0].date).getTime())
        .toBeLessThan(new Date(normalized[1].date).getTime());
    });

    it('should handle empty array', () => {
      const normalized = normalizeHistoricalData([]);
      expect(normalized).toEqual([]);
    });

    it('should filter out invalid entries', () => {
      const rawData = [
        {
          date: new Date('2024-01-15'),
          close: 185.42
        },
        {
          date: null,
          close: 186.20
        },
        {
          date: new Date('2024-01-17'),
          close: null
        }
      ];

      const normalized = normalizeHistoricalData(rawData);

      expect(normalized).toHaveLength(1);
      expect(normalized[0].close).toBe(185.42);
    });
  });

  describe('calculateSummaryStats', () => {
    const sampleData = [
      { close: 100 },
      { close: 110 },
      { close: 105 },
      { close: 115 },
      { close: 120 }
    ];

    it('should calculate min, max, and average', () => {
      const stats = calculateSummaryStats(sampleData);

      expect(stats.min).toBe(100);
      expect(stats.max).toBe(120);
      expect(stats.average).toBe(110);
    });

    it('should calculate volatility', () => {
      const stats = calculateSummaryStats(sampleData);

      expect(stats.volatility).toBeGreaterThan(0);
      expect(stats.volatility).toBeLessThan(100);
    });

    it('should determine upward trend', () => {
      const upwardData = [
        { close: 100 },
        { close: 105 },
        { close: 110 },
        { close: 115 },
        { close: 120 }
      ];

      const stats = calculateSummaryStats(upwardData);

      expect(stats.trend).toBe('up');
    });

    it('should determine downward trend', () => {
      const downwardData = [
        { close: 120 },
        { close: 115 },
        { close: 110 },
        { close: 105 },
        { close: 100 }
      ];

      const stats = calculateSummaryStats(downwardData);

      expect(stats.trend).toBe('down');
    });

    it('should determine flat trend', () => {
      const flatData = [
        { close: 100 },
        { close: 101 },
        { close: 100 },
        { close: 99 },
        { close: 100 }
      ];

      const stats = calculateSummaryStats(flatData);

      expect(stats.trend).toBe('flat');
    });

    it('should handle empty array', () => {
      const stats = calculateSummaryStats([]);

      expect(stats.min).toBe(0);
      expect(stats.max).toBe(0);
      expect(stats.average).toBe(0);
      expect(stats.volatility).toBe(0);
      expect(stats.trend).toBe('flat');
    });

    it('should handle single data point', () => {
      const stats = calculateSummaryStats([{ close: 100 }]);

      expect(stats.min).toBe(100);
      expect(stats.max).toBe(100);
      expect(stats.average).toBe(100);
      expect(stats.volatility).toBe(0);
      expect(stats.trend).toBe('flat');
    });
  });

  describe('extractTrendData', () => {
    it('should extract trend points from historical data', () => {
      const historicalData = [
        { date: '2024-01-15', close: 100 },
        { date: '2024-01-16', close: 105 },
        { date: '2024-01-17', close: 110 }
      ];

      const trendData = extractTrendData(historicalData);

      expect(trendData).toHaveLength(3);
      expect(trendData[0]).toEqual({
        value: 100,
        timestamp: new Date('2024-01-15').getTime()
      });
    });

    it('should limit to maximum 50 points', () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        date: `2024-01-${i + 1}`,
        close: 100 + i
      }));

      const trendData = extractTrendData(largeData);

      expect(trendData.length).toBeLessThanOrEqual(50);
    });

    it('should handle empty array', () => {
      const trendData = extractTrendData([]);
      expect(trendData).toEqual([]);
    });
  });

  describe('sanitizeSymbol', () => {
    it('should convert to uppercase', () => {
      expect(sanitizeSymbol('ibm')).toBe('IBM');
      expect(sanitizeSymbol('msft')).toBe('MSFT');
    });

    it('should trim whitespace', () => {
      expect(sanitizeSymbol('  IBM  ')).toBe('IBM');
      expect(sanitizeSymbol('\tMSFT\n')).toBe('MSFT');
    });

    it('should remove special characters', () => {
      expect(sanitizeSymbol('IBM@#$')).toBe('IBM');
      expect(sanitizeSymbol('MS-FT')).toBe('MSFT');
    });

    it('should handle empty string', () => {
      expect(sanitizeSymbol('')).toBe('');
      expect(sanitizeSymbol('   ')).toBe('');
    });

    it('should preserve valid symbols', () => {
      expect(sanitizeSymbol('IBM')).toBe('IBM');
      expect(sanitizeSymbol('MSFT')).toBe('MSFT');
      expect(sanitizeSymbol('BRK.B')).toBe('BRKB');
    });
  });

  describe('formatError', () => {
    it('should format API error with response', () => {
      const error = {
        response: {
          status: 404,
          statusText: 'Not Found'
        }
      };

      const formatted = formatError(error);

      expect(formatted).toContain('404');
      expect(formatted).toContain('Not Found');
    });

    it('should format network error', () => {
      const error = {
        request: {},
        message: 'Network Error'
      };

      const formatted = formatError(error);

      expect(formatted).toContain('Network error');
    });

    it('should format generic error', () => {
      const error = new Error('Something went wrong');

      const formatted = formatError(error);

      expect(formatted).toBe('Something went wrong');
    });

    it('should handle error without message', () => {
      const error = {};

      const formatted = formatError(error);

      expect(formatted).toContain('unexpected error');
    });

    it('should handle string errors', () => {
      const formatted = formatError('Simple error message');

      expect(formatted).toBe('Simple error message');
    });
  });
});

// Made with Bob
