// Chart configuration constants
export const CHART_CONFIG = {
  responsive: true,
  maintainAspectRatio: false,
  margin: { top: 20, right: 30, left: 20, bottom: 20 },
  grid: { strokeDasharray: '3 3' },
  tooltip: {
    enabled: true,
    contentStyle: {
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '8px'
    }
  },
  legend: {
    position: 'bottom',
    align: 'center'
  }
};

export const SPARKLINE_CONFIG = {
  width: 100,
  height: 30,
  margin: { top: 2, right: 2, left: 2, bottom: 2 }
};

export const TIME_WINDOWS = {
  DAY: 'day',
  WEEK: 'week',
  QUARTER: 'quarter'
};

export const TIME_WINDOW_LABELS = {
  [TIME_WINDOWS.DAY]: 'Current Day',
  [TIME_WINDOWS.WEEK]: 'Last 7 Days',
  [TIME_WINDOWS.QUARTER]: 'Last Quarter'
};

// Made with Bob
