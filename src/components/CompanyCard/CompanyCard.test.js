/**
 * CompanyCard Component Tests
 * Tests for UI rendering and user interactions
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompanyCard from './CompanyCard';

describe('CompanyCard', () => {
  const mockCompany = {
    symbol: 'IBM',
    name: 'IBM',
    color: '#0f62fe'
  };

  const mockData = {
    quote: {
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
    },
    trend: [
      { value: 183.00, timestamp: 1704067200000 },
      { value: 184.50, timestamp: 1704153600000 },
      { value: 185.42, timestamp: 1704240000000 }
    ]
  };

  describe('Rendering', () => {
    it('should render company symbol', () => {
      render(<CompanyCard company={mockCompany} data={mockData} />);
      expect(screen.getByText('IBM')).toBeInTheDocument();
    });

    it('should render company full name', () => {
      render(<CompanyCard company={mockCompany} data={mockData} />);
      expect(screen.getByText('International Business Machines Corporation')).toBeInTheDocument();
    });

    it('should render current price', () => {
      render(<CompanyCard company={mockCompany} data={mockData} />);
      expect(screen.getByText('$185.42')).toBeInTheDocument();
    });

    it('should render price change', () => {
      render(<CompanyCard company={mockCompany} data={mockData} />);
      expect(screen.getByText('+$2.15 (+1.17%)')).toBeInTheDocument();
    });

    it('should render volume', () => {
      render(<CompanyCard company={mockCompany} data={mockData} />);
      expect(screen.getByText(/Volume:/)).toBeInTheDocument();
      expect(screen.getByText(/4.52M/)).toBeInTheDocument();
    });
  });

  describe('Positive Change Styling', () => {
    it('should apply positive class for positive change', () => {
      render(<CompanyCard company={mockCompany} data={mockData} />);
      const changeElement = screen.getByText('+$2.15 (+1.17%)');
      expect(changeElement).toHaveClass('positive');
    });

    it('should display green color for positive change', () => {
      render(<CompanyCard company={mockCompany} data={mockData} />);
      const changeElement = screen.getByText('+$2.15 (+1.17%)');
      expect(changeElement).toHaveStyle({ color: '#10b981' });
    });
  });

  describe('Negative Change Styling', () => {
    const negativeData = {
      ...mockData,
      quote: {
        ...mockData.quote,
        change: -2.15,
        changePercent: -1.17
      }
    };

    it('should apply negative class for negative change', () => {
      render(<CompanyCard company={mockCompany} data={negativeData} />);
      const changeElement = screen.getByText('-$2.15 (-1.17%)');
      expect(changeElement).toHaveClass('negative');
    });

    it('should display red color for negative change', () => {
      render(<CompanyCard company={mockCompany} data={negativeData} />);
      const changeElement = screen.getByText('-$2.15 (-1.17%)');
      expect(changeElement).toHaveStyle({ color: '#ef4444' });
    });
  });

  describe('Zero Change Styling', () => {
    const zeroData = {
      ...mockData,
      quote: {
        ...mockData.quote,
        change: 0,
        changePercent: 0
      }
    };

    it('should apply neutral class for zero change', () => {
      render(<CompanyCard company={mockCompany} data={zeroData} />);
      const changeElement = screen.getByText('$0.00 (0.00%)');
      expect(changeElement).toHaveClass('neutral');
    });
  });

  describe('Loading State', () => {
    it('should display loading spinner when loading', () => {
      render(<CompanyCard company={mockCompany} data={null} isLoading={true} />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should not display data when loading', () => {
      render(<CompanyCard company={mockCompany} data={null} isLoading={true} />);
      expect(screen.queryByText('$185.42')).not.toBeInTheDocument();
    });

    it('should display company symbol even when loading', () => {
      render(<CompanyCard company={mockCompany} data={null} isLoading={true} />);
      expect(screen.getByText('IBM')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when data is null and not loading', () => {
      render(<CompanyCard company={mockCompany} data={null} isLoading={false} />);
      expect(screen.getByText(/No data available/)).toBeInTheDocument();
    });

    it('should not display price when data is null', () => {
      render(<CompanyCard company={mockCompany} data={null} isLoading={false} />);
      expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    });
  });

  describe('Trend Chart', () => {
    it('should render trend chart when data is available', () => {
      const { container } = render(<CompanyCard company={mockCompany} data={mockData} />);
      const chart = container.querySelector('.recharts-wrapper');
      expect(chart).toBeInTheDocument();
    });

    it('should not render trend chart when loading', () => {
      const { container } = render(<CompanyCard company={mockCompany} data={null} isLoading={true} />);
      const chart = container.querySelector('.recharts-wrapper');
      expect(chart).not.toBeInTheDocument();
    });

    it('should not render trend chart when no data', () => {
      const { container } = render(<CompanyCard company={mockCompany} data={null} isLoading={false} />);
      const chart = container.querySelector('.recharts-wrapper');
      expect(chart).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(<CompanyCard company={mockCompany} data={mockData} />);
      expect(container.querySelector('.company-card')).toBeInTheDocument();
    });

    it('should have readable text contrast', () => {
      render(<CompanyCard company={mockCompany} data={mockData} />);
      const priceElement = screen.getByText('$185.42');
      expect(priceElement).toHaveStyle({ fontSize: '2rem' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      const largeData = {
        ...mockData,
        quote: {
          ...mockData.quote,
          price: 999999.99,
          volume: 999999999
        }
      };

      render(<CompanyCard company={mockCompany} data={largeData} />);
      expect(screen.getByText('$999,999.99')).toBeInTheDocument();
    });

    it('should handle very small numbers', () => {
      const smallData = {
        ...mockData,
        quote: {
          ...mockData.quote,
          price: 0.01,
          change: 0.001,
          changePercent: 0.01
        }
      };

      render(<CompanyCard company={mockCompany} data={smallData} />);
      expect(screen.getByText('$0.01')).toBeInTheDocument();
    });

    it('should handle missing trend data', () => {
      const noTrendData = {
        ...mockData,
        trend: []
      };

      const { container } = render(<CompanyCard company={mockCompany} data={noTrendData} />);
      const chart = container.querySelector('.recharts-wrapper');
      expect(chart).not.toBeInTheDocument();
    });

    it('should handle undefined company name', () => {
      const dataWithoutName = {
        ...mockData,
        quote: {
          ...mockData.quote,
          name: undefined
        }
      };

      render(<CompanyCard company={mockCompany} data={dataWithoutName} />);
      expect(screen.getByText('IBM')).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot with data', () => {
      const { container } = render(<CompanyCard company={mockCompany} data={mockData} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot when loading', () => {
      const { container } = render(<CompanyCard company={mockCompany} data={null} isLoading={true} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with error', () => {
      const { container } = render(<CompanyCard company={mockCompany} data={null} isLoading={false} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});

// Made with Bob
