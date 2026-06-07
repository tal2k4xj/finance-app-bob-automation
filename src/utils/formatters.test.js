/**
 * Formatters Utility Tests
 * Tests for currency, percentage, and number formatting
 */

import {
  formatCurrency,
  formatPercentage,
  formatNumber,
  formatVolume,
  formatMarketCap,
  formatDate,
  formatDateTime
} from './formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers with dollar sign', () => {
      expect(formatCurrency(185.42)).toBe('$185.42');
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
    });

    it('should format negative numbers with dollar sign', () => {
      expect(formatCurrency(-185.42)).toBe('-$185.42');
      expect(formatCurrency(-1000)).toBe('-$1,000.00');
    });

    it('should format zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle very small numbers', () => {
      expect(formatCurrency(0.01)).toBe('$0.01');
      expect(formatCurrency(0.001)).toBe('$0.00');
    });

    it('should handle very large numbers', () => {
      expect(formatCurrency(999999999.99)).toBe('$999,999,999.99');
    });

    it('should handle null and undefined', () => {
      expect(formatCurrency(null)).toBe('$0.00');
      expect(formatCurrency(undefined)).toBe('$0.00');
    });

    it('should round to 2 decimal places', () => {
      expect(formatCurrency(185.426)).toBe('$185.43');
      expect(formatCurrency(185.424)).toBe('$185.42');
    });
  });

  describe('formatPercentage', () => {
    it('should format positive percentages', () => {
      expect(formatPercentage(1.17)).toBe('+1.17%');
      expect(formatPercentage(10.5)).toBe('+10.50%');
      expect(formatPercentage(0.01)).toBe('+0.01%');
    });

    it('should format negative percentages', () => {
      expect(formatPercentage(-1.17)).toBe('-1.17%');
      expect(formatPercentage(-10.5)).toBe('-10.50%');
    });

    it('should format zero', () => {
      expect(formatPercentage(0)).toBe('0.00%');
    });

    it('should handle null and undefined', () => {
      expect(formatPercentage(null)).toBe('0.00%');
      expect(formatPercentage(undefined)).toBe('0.00%');
    });

    it('should round to 2 decimal places', () => {
      expect(formatPercentage(1.176)).toBe('+1.18%');
      expect(formatPercentage(1.174)).toBe('+1.17%');
    });

    it('should handle very small percentages', () => {
      expect(formatPercentage(0.001)).toBe('+0.00%');
    });

    it('should handle very large percentages', () => {
      expect(formatPercentage(999.99)).toBe('+999.99%');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('should handle decimals', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56');
      expect(formatNumber(1000.1)).toBe('1,000.10');
    });

    it('should handle negative numbers', () => {
      expect(formatNumber(-1000)).toBe('-1,000');
      expect(formatNumber(-1234.56)).toBe('-1,234.56');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle null and undefined', () => {
      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
    });
  });

  describe('formatVolume', () => {
    it('should format millions', () => {
      expect(formatVolume(4523000)).toBe('4.52M');
      expect(formatVolume(1000000)).toBe('1.00M');
      expect(formatVolume(1500000)).toBe('1.50M');
    });

    it('should format billions', () => {
      expect(formatVolume(4523000000)).toBe('4.52B');
      expect(formatVolume(1000000000)).toBe('1.00B');
    });

    it('should format thousands', () => {
      expect(formatVolume(500000)).toBe('500.00K');
      expect(formatVolume(1000)).toBe('1.00K');
    });

    it('should format small numbers', () => {
      expect(formatVolume(500)).toBe('500');
      expect(formatVolume(0)).toBe('0');
    });

    it('should handle null and undefined', () => {
      expect(formatVolume(null)).toBe('0');
      expect(formatVolume(undefined)).toBe('0');
    });

    it('should round to 2 decimal places', () => {
      expect(formatVolume(4526789)).toBe('4.53M');
      expect(formatVolume(4523456)).toBe('4.52M');
    });
  });

  describe('formatMarketCap', () => {
    it('should format trillions', () => {
      expect(formatMarketCap(2500000000000)).toBe('$2.50T');
      expect(formatMarketCap(1000000000000)).toBe('$1.00T');
    });

    it('should format billions', () => {
      expect(formatMarketCap(170500000000)).toBe('$170.50B');
      expect(formatMarketCap(1000000000)).toBe('$1.00B');
    });

    it('should format millions', () => {
      expect(formatMarketCap(500000000)).toBe('$500.00M');
      expect(formatMarketCap(1000000)).toBe('$1.00M');
    });

    it('should format small numbers', () => {
      expect(formatMarketCap(500000)).toBe('$500,000');
      expect(formatMarketCap(0)).toBe('$0');
    });

    it('should handle null and undefined', () => {
      expect(formatMarketCap(null)).toBe('$0');
      expect(formatMarketCap(undefined)).toBe('$0');
    });

    it('should round to 2 decimal places', () => {
      expect(formatMarketCap(170526789000)).toBe('$170.53B');
      expect(formatMarketCap(170523456000)).toBe('$170.52B');
    });
  });

  describe('formatDate', () => {
    it('should format date strings', () => {
      const date = '2024-01-15T00:00:00.000Z';
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Jan 15|1\/15/); // Different locales
    });

    it('should format Date objects', () => {
      const date = new Date('2024-01-15T00:00:00.000Z');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Jan 15|1\/15/);
    });

    it('should format timestamps', () => {
      const timestamp = new Date('2024-01-15T00:00:00.000Z').getTime();
      const formatted = formatDate(timestamp);
      expect(formatted).toMatch(/Jan 15|1\/15/);
    });

    it('should handle invalid dates', () => {
      expect(formatDate('invalid')).toBe('Invalid Date');
      expect(formatDate(null)).toBe('Invalid Date');
      expect(formatDate(undefined)).toBe('Invalid Date');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time', () => {
      const date = '2024-01-15T14:30:00.000Z';
      const formatted = formatDateTime(date);
      expect(formatted).toMatch(/Jan 15|1\/15/);
      expect(formatted).toMatch(/\d{1,2}:\d{2}/); // Time format
    });

    it('should format Date objects with time', () => {
      const date = new Date('2024-01-15T14:30:00.000Z');
      const formatted = formatDateTime(date);
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should handle invalid dates', () => {
      expect(formatDateTime('invalid')).toBe('Invalid Date');
      expect(formatDateTime(null)).toBe('Invalid Date');
    });
  });

  describe('Edge Cases', () => {
    it('should handle Infinity', () => {
      expect(formatCurrency(Infinity)).toBe('$0.00');
      expect(formatPercentage(Infinity)).toBe('0.00%');
      expect(formatNumber(Infinity)).toBe('0');
    });

    it('should handle -Infinity', () => {
      expect(formatCurrency(-Infinity)).toBe('$0.00');
      expect(formatPercentage(-Infinity)).toBe('0.00%');
      expect(formatNumber(-Infinity)).toBe('0');
    });

    it('should handle NaN', () => {
      expect(formatCurrency(NaN)).toBe('$0.00');
      expect(formatPercentage(NaN)).toBe('0.00%');
      expect(formatNumber(NaN)).toBe('0');
    });

    it('should handle string numbers', () => {
      expect(formatCurrency('185.42')).toBe('$185.42');
      expect(formatPercentage('1.17')).toBe('+1.17%');
      expect(formatNumber('1000')).toBe('1,000');
    });

    it('should handle very precise decimals', () => {
      expect(formatCurrency(185.4267893)).toBe('$185.43');
      expect(formatPercentage(1.176789)).toBe('+1.18%');
    });
  });
});

// Made with Bob
