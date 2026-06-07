import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { CHART_CONFIG } from '../../constants/chartConfig';
import { formatCurrency, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './ChartPanel.css';

const ChartPanel = ({ data, companies, timeWindow, loading, error }) => {
  if (loading) {
    return (
      <div className="chart-panel loading">
        <LoadingSpinner message="Loading chart data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-panel error">
        <div className="error-content">
          <span>⚠️</span>
          <p>Unable to load chart data</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="chart-panel empty">
        <div className="empty-content">
          <span>📊</span>
          <p>No chart data available</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{formatDate(label, 'long')}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-panel">
      <div className="chart-header">
        <h3>Market Comparison - {timeWindow}</h3>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            margin={CHART_CONFIG.margin}
          >
            <CartesianGrid strokeDasharray={CHART_CONFIG.grid.strokeDasharray} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => formatDate(value, 'short')}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {companies.map(company => (
              <Line
                key={company.symbol}
                type="monotone"
                dataKey={company.symbol}
                name={company.name}
                stroke={company.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartPanel;

// Made with Bob
