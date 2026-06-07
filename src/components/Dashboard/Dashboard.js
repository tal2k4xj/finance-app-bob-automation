import React, { useState } from 'react';
import { COMPANIES, COMPANY_SYMBOLS, generateDynamicColor } from '../../constants/companies';
import { TIME_WINDOWS } from '../../constants/chartConfig';
import { useMarketData } from '../../hooks/useMarketData';
import financeService from '../../services/financeService';
import TimeWindowSelector from '../TimeWindowSelector/TimeWindowSelector';
import CompanyCard from '../CompanyCard/CompanyCard';
import ChartPanel from '../ChartPanel/ChartPanel';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import CompanySelector from '../CompanySelector/CompanySelector';
import UserCompanyChart from '../UserCompanyChart/UserCompanyChart';
import './Dashboard.css';

const Dashboard = () => {
  const [timeWindow, setTimeWindow] = useState(TIME_WINDOWS.DAY);
  const { data, loading, error, retry } = useMarketData(COMPANY_SYMBOLS, timeWindow);
  
  // User-selected company state
  const [userSymbol, setUserSymbol] = useState(null);
  const [userCompanyData, setUserCompanyData] = useState(null);
  const [userCompanyLoading, setUserCompanyLoading] = useState(false);
  const [userCompanyError, setUserCompanyError] = useState(null);

  // Prepare chart data by combining historical data from all companies
  const prepareChartData = () => {
    if (!data || Object.keys(data).length === 0) return [];

    // Get all unique dates from all companies
    const dateMap = new Map();

    COMPANY_SYMBOLS.forEach(symbol => {
      const companyData = data[symbol];
      if (companyData && companyData.historical && companyData.historical.dataPoints) {
        companyData.historical.dataPoints.forEach(point => {
          const dateKey = new Date(point.date).toISOString();
          if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, { date: dateKey });
          }
          dateMap.get(dateKey)[symbol] = point.close;
        });
      }
    });

    // Convert map to array and sort by date
    return Array.from(dateMap.values()).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
  };

  const chartData = prepareChartData();

  // Handle user symbol submission
  const handleSymbolSubmit = async (symbol) => {
    setUserSymbol(symbol);
    setUserCompanyLoading(true);
    setUserCompanyError(null);
    setUserCompanyData(null);

    try {
      // Fetch quote data
      const quoteResult = await financeService.getQuote(symbol);
      
      if (!quoteResult.success) {
        setUserCompanyError(quoteResult.error || `Unable to fetch data for ${symbol}. Please verify the symbol is correct.`);
        setUserCompanyLoading(false);
        return;
      }

      // Fetch historical data
      const historicalResult = await financeService.getHistoricalData(symbol, timeWindow);
      
      if (!historicalResult.success) {
        // Still show quote data even if historical fails
        setUserCompanyData({
          quote: quoteResult.data,
          historical: null
        });
        setUserCompanyLoading(false);
        return;
      }

      // Combine data
      setUserCompanyData({
        quote: quoteResult.data,
        historical: historicalResult.data
      });
      setUserCompanyLoading(false);
    } catch (err) {
      setUserCompanyError(`Failed to load data for ${symbol}. Please try again.`);
      setUserCompanyLoading(false);
    }
  };

  // Handle removing user-selected company
  const handleRemoveUserCompany = () => {
    setUserSymbol(null);
    setUserCompanyData(null);
    setUserCompanyError(null);
    setUserCompanyLoading(false);
  };

  // Show full loading state only on initial load
  if (loading && Object.keys(data).length === 0) {
    return (
      <div className="dashboard loading">
        <LoadingSpinner message="Loading market data..." />
      </div>
    );
  }

  // Show error boundary for complete failures
  if (error && error.type === 'BATCH_ERROR') {
    return (
      <div className="dashboard">
        <ErrorBoundary error={error} onRetry={retry} />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Finance Analytics Dashboard</h1>
        <p className="dashboard-subtitle">
          Real-time market data for IBM and major competitors
        </p>
      </header>

      <TimeWindowSelector
        selected={timeWindow}
        onChange={setTimeWindow}
      />

      <CompanySelector
        onSymbolSubmit={handleSymbolSubmit}
        isLoading={userCompanyLoading}
      />

      {error && error.type === 'PARTIAL_ERROR' && (
        <div className="partial-error-banner">
          <span>⚠️</span>
          <p>{error.message}</p>
          <button onClick={retry}>Retry</button>
        </div>
      )}

      <section className="company-grid">
        {COMPANIES.map(company => {
          const companyData = data[company.symbol];
          const quote = companyData?.quote;
          const historical = companyData?.historical;
          
          // Extract trend data for sparkline (last 7 points)
          const trend = historical?.dataPoints
            ? historical.dataPoints.slice(-7).map(p => p.close)
            : [];

          return (
            <CompanyCard
              key={company.symbol}
              symbol={company.symbol}
              name={company.name}
              price={quote?.price}
              change={quote?.change}
              changePercent={quote?.changePercent}
              trend={trend}
              color={company.color}
              loading={companyData?.loading}
              error={companyData?.error}
            />
          );
        })}
      </section>

      <section className="chart-section">
        <ChartPanel
          data={chartData}
          companies={COMPANIES}
          timeWindow={timeWindow}
          loading={loading}
          error={error}
        />
      </section>

      {userSymbol && (
        <UserCompanyChart
          symbol={userSymbol}
          data={userCompanyData}
          loading={userCompanyLoading}
          error={userCompanyError}
          onRemove={handleRemoveUserCompany}
          color={generateDynamicColor(userSymbol)}
        />
      )}

      <footer className="dashboard-footer">
        <p>
          Data updates every 60 seconds • Last updated: {new Date().toLocaleTimeString()}
        </p>
        <p className="disclaimer">
          Demo data for educational purposes only. Not for investment decisions.
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;

// Made with Bob
