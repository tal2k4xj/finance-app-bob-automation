import { useState, useEffect } from 'react';
import financeService from '../services/financeService';

/**
 * Custom hook to fetch market data for multiple symbols
 * @param {Array<string>} symbols - Array of stock symbols
 * @param {string} timeWindow - Time window for historical data
 * @returns {Object} Market data, loading state, and error
 */
export const useMarketData = (symbols, timeWindow = 'day') => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch quotes for all symbols
        const quoteResults = await financeService.getBatchQuotes(symbols);
        
        // Fetch historical data for all symbols
        const historicalResults = await financeService.getBatchHistoricalData(
          symbols,
          timeWindow
        );

        if (!isMounted) return;

        // Combine quote and historical data
        const combinedData = {};
        const failedSymbols = [];

        symbols.forEach((symbol, index) => {
          const quoteResult = quoteResults[index];
          const historicalResult = historicalResults[index];

          if (quoteResult.success && historicalResult.success) {
            combinedData[symbol] = {
              quote: quoteResult.data,
              historical: historicalResult.data,
              loading: false,
              error: null
            };
          } else {
            failedSymbols.push(symbol);
            combinedData[symbol] = {
              quote: null,
              historical: null,
              loading: false,
              error: quoteResult.error || historicalResult.error
            };
          }
        });

        setData(combinedData);

        // Set error if all requests failed
        if (failedSymbols.length === symbols.length) {
          setError({
            type: 'BATCH_ERROR',
            message: 'Unable to fetch market data for any company.',
            failedSymbols
          });
        } else if (failedSymbols.length > 0) {
          // Partial failure
          setError({
            type: 'PARTIAL_ERROR',
            message: `Data unavailable for: ${failedSymbols.join(', ')}`,
            failedSymbols
          });
        }
      } catch (err) {
        if (!isMounted) return;
        
        setError({
          type: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while fetching market data.',
          originalError: err
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [symbols, timeWindow, retryCount]);

  const retry = () => {
    setRetryCount(prev => prev + 1);
  };

  const refresh = () => {
    financeService.clearCache();
    retry();
  };

  return {
    data,
    loading,
    error,
    retry,
    refresh
  };
};

export default useMarketData;

// Made with Bob
