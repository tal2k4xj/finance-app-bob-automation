import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './UserCompanyChart.css';

const UserCompanyChart = ({ symbol, data, loading, error, onRemove, color = '#1192e8' }) => {
  if (loading) {
    return (
      <div className="user-company-chart loading">
        <LoadingSpinner message={`Loading data for ${symbol}...`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-company-chart error">
        <div className="user-company-chart-header">
          <h3>Custom Company: {symbol}</h3>
          <button onClick={onRemove} className="user-company-remove" aria-label="Remove company">
            ✕
          </button>
        </div>
        <div className="user-company-error-content">
          <div className="error-icon">⚠️</div>
          <p className="error-message">{error}</p>
          <p className="error-hint">
            Please check the symbol and try again. Common symbols include AAPL, GOOGL, TSLA, AMZN.
          </p>
        </div>
      </div>
    );
  }

  if (!data || !data.quote) {
    return null;
  }

  const { quote, historical } = data;
  const isPositive = quote.change >= 0;

  // Prepare chart data
  const chartData = historical?.dataPoints?.map(point => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: point.close,
    fullDate: new Date(point.date).toLocaleDateString()
  })) || [];

  return (
    <div className="user-company-chart">
      <div className="user-company-chart-header">
        <div className="user-company-info">
          <h3>Custom Company: {symbol}</h3>
          <p className="user-company-name">{quote.name || symbol}</p>
        </div>
        <button onClick={onRemove} className="user-company-remove" aria-label="Remove company">
          ✕
        </button>
      </div>

      <div className="user-company-stats">
        <div className="user-company-price">
          <span className="price-label">Current Price</span>
          <span className="price-value">{formatCurrency(quote.price)}</span>
        </div>
        <div className={`user-company-change ${isPositive ? 'positive' : 'negative'}`}>
          <span className="change-label">Change</span>
          <span className="change-value">
            {isPositive ? '+' : ''}{formatCurrency(quote.change)} ({formatPercent(quote.changePercent)})
          </span>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="user-company-chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                stroke="#525252"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#525252"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  padding: '8px'
                }}
                formatter={(value) => [formatCurrency(value), 'Price']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="user-company-no-data">
          <p>No historical data available for this time period.</p>
        </div>
      )}
    </div>
  );
};

export default UserCompanyChart;

// Made with Bob
