import { subDays, subMonths, startOfDay, endOfDay } from 'date-fns';

/**
 * Get date range for a given time window
 * @param {string} timeWindow - 'day', 'week', or 'quarter'
 * @returns {Object} Object with start and end dates
 */
export const getDateRange = (timeWindow) => {
  const now = new Date();
  
  switch (timeWindow) {
    case 'day':
      return {
        start: startOfDay(now),
        end: endOfDay(now),
        interval: '5m'
      };
    case 'week':
      return {
        start: subDays(now, 7),
        end: now,
        interval: '1h'
      };
    case 'quarter':
      return {
        start: subMonths(now, 3),
        end: now,
        interval: '1d'
      };
    default:
      return {
        start: startOfDay(now),
        end: endOfDay(now),
        interval: '5m'
      };
  }
};

/**
 * Convert date to Unix timestamp
 * @param {Date} date - Date object
 * @returns {number} Unix timestamp in seconds
 */
export const toUnixTimestamp = (date) => {
  return Math.floor(date.getTime() / 1000);
};

/**
 * Convert Unix timestamp to Date
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {Date} Date object
 */
export const fromUnixTimestamp = (timestamp) => {
  return new Date(timestamp * 1000);
};

/**
 * Check if market is currently open (simplified - US market hours)
 * @returns {boolean} True if market is open
 */
export const isMarketOpen = () => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  
  // Weekend check
  if (day === 0 || day === 6) {
    return false;
  }
  
  // Market hours: 9:30 AM - 4:00 PM ET (simplified)
  // This is a basic check and doesn't account for holidays or timezone
  return hour >= 9 && hour < 16;
};

// Made with Bob
