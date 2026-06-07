# Finance Analytics Dashboard

A React-based finance analytics dashboard that tracks IBM and up to four competitors using real-time market data. Built as part of the IBM Bob GitHub SDLC Lab.

## Features

- 📊 **Real-time Market Data** - Track IBM, Microsoft, Oracle, SAP, and Salesforce
- 📈 **Multiple Time Windows** - View current day, last 7 days, or last quarter data
- 🎨 **Interactive Charts** - Beautiful visualizations using Recharts
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ⚡ **Fast Performance** - Optimized with caching and efficient data fetching
- 🔄 **Auto-refresh** - Data updates automatically every 60 seconds
- 🎯 **Error Handling** - Graceful degradation with retry capabilities

## Project Structure

```
finance-app/
├── src/
│   ├── components/          # React UI components
│   │   ├── Dashboard/       # Main dashboard container
│   │   ├── CompanyCard/     # Individual company summary cards
│   │   ├── ChartPanel/      # Reusable chart wrapper
│   │   ├── TimeWindowSelector/ # Day/Week/Quarter toggle
│   │   ├── LoadingSpinner/  # Loading state component
│   │   └── ErrorBoundary/   # Error handling component
│   ├── services/            # Data layer abstraction
│   │   ├── financeService.js    # Yahoo Finance integration
│   │   └── mockData.js          # Fallback/test data
│   ├── hooks/               # Custom React hooks
│   │   └── useMarketData.js     # Data fetching hook
│   ├── context/             # React Context providers
│   │   └── AppContext.js        # Global state management
│   ├── utils/               # Helper functions
│   │   ├── dateHelpers.js       # Date range calculations
│   │   └── formatters.js        # Price/percentage formatting
│   ├── constants/           # Configuration
│   │   ├── companies.js         # IBM + competitor definitions
│   │   └── chartConfig.js       # Chart styling constants
│   ├── App.js               # Root component
│   └── index.js             # Entry point
├── public/
├── package.json
└── README.md
```

## Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000).
The page will reload when you make changes.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.
Optimizes the build for best performance.

### `npm run eject`
**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## Usage

### Time Window Selection
Use the time window selector to switch between different views:
- **Current Day** - Intraday market data with 5-minute intervals
- **Last 7 Days** - Week-over-week comparison with hourly data
- **Last Quarter** - 90-day trend analysis with daily data

### Company Cards
Each company card displays:
- Current stock price
- Price change (absolute and percentage)
- Mini sparkline chart showing recent trend
- Color-coded indicators (green for positive, red for negative)

### Comparison Chart
The main chart shows all companies on a single timeline for easy comparison:
- Hover over data points to see detailed information
- Legend shows company names and colors
- Responsive design adapts to screen size

### Error Handling
The app gracefully handles various error scenarios:
- **Network errors** - Shows retry button
- **Partial data failures** - Displays available data with warning
- **Complete failures** - Shows error message with retry option

## Data Source

Currently using **mock data** for demonstration purposes. The app is structured to easily integrate with real Yahoo Finance API or other data providers.

To switch to real data:
1. Set `USE_MOCK_DATA = false` in `src/services/financeService.js`
2. Implement the real API integration (may require backend proxy for CORS)

## Technologies Used

- **React** - UI framework
- **Recharts** - Chart library
- **date-fns** - Date manipulation
- **yahoo-finance2** - Market data (ready for integration)
- **Create React App** - Build tooling

## Component Architecture

### Data Flow
```
Dashboard (Container)
    ↓
useMarketData Hook
    ↓
financeService
    ↓
Mock Data / Yahoo Finance API
    ↓
Data Transformer
    ↓
Components (Presentational)
```

### State Management
- **Global State** - React Context for time window and market data
- **Local State** - Component-specific UI state
- **Derived State** - Computed values from market data

## Future Enhancements

Potential features for future development:
- [ ] User-selected company input
- [ ] Real-time WebSocket updates
- [ ] Portfolio tracking
- [ ] Price alerts and notifications
- [ ] Dark mode support
- [ ] Export data to CSV
- [ ] Technical indicators (RSI, MACD, etc.)
- [ ] Multi-currency support
- [ ] Historical data comparison

## Testing

Run tests with:
```bash
npm test
```

Test coverage includes:
- Unit tests for utilities and services
- Component rendering tests
- Integration tests for data flow
- Error handling scenarios

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Contributing

This project is part of the IBM Bob GitHub SDLC Lab. Contributions should follow the workshop guidelines:

1. Create a feature branch
2. Make your changes
3. Run tests and validation
4. Create a pull request
5. Wait for review and merge

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [Create React App](https://create-react-app.dev/)
- Charts powered by [Recharts](https://recharts.org/)
- Part of the IBM Bob GitHub SDLC Lab

## Support

For issues or questions:
1. Check the [Implementation Plan](../IMPLEMENTATION-PLAN.md)
2. Review the [Workshop Guide](../WORKSHOP-part1-BUILD.md)
3. Open an issue in the repository

---

**Note:** This is a demonstration application for educational purposes. Market data is simulated and should not be used for actual investment decisions.
