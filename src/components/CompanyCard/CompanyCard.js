import React from 'react';
import { LineChart, Line } from 'recharts';
import { formatCurrency, formatChange, formatPercent } from '../../utils/formatters';
import { SPARKLINE_CONFIG } from '../../constants/chartConfig';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './CompanyCard.css';

const CompanyCard = ({ symbol, name, price, change, changePercent, trend, color, loading, error }) => {
  if (loading) {
    return (
      <div className="company-card loading">
        <LoadingSpinner message={`Loading ${symbol}...`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="company-card error">
        <div className="card-header">
          <h3 className="company-symbol">{symbol}</h3>
        </div>
        <div className="error-message">
          <span>⚠️</span>
          <p>Data unavailable</p>
        </div>
      </div>
    );
  }

  const isPositive = change >= 0;
  const changeClass = isPositive ? 'positive' : 'negative';

  // Prepare sparkline data
  const sparklineData = trend ? trend.map((value, index) => ({
    index,
    value
  })) : [];

  return (
    <div className="company-card" data-testid="company-card">
      <div className="card-header">
        <div className="company-info">
          <h3 className="company-symbol" style={{ color }}>{symbol}</h3>
          <p className="company-name">{name}</p>
        </div>
      </div>

      <div className="card-body">
        <div className="price-section">
          <div className="current-price">{formatCurrency(price)}</div>
          <div className={`price-change ${changeClass}`}>
            <span className="change-value">
              {formatChange(change)}
            </span>
            <span className="change-percent">
              ({formatPercent(changePercent)})
            </span>
          </div>
        </div>

        {sparklineData.length > 0 && (
          <div className="sparkline-section">
            <LineChart
              width={SPARKLINE_CONFIG.width}
              height={SPARKLINE_CONFIG.height}
              data={sparklineData}
              margin={SPARKLINE_CONFIG.margin}
            >
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyCard;

// Made with Bob
