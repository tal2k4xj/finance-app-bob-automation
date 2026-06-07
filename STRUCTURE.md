# Finance App Structure Overview

## Component Architecture

### Core Components

1. **Dashboard** (`src/components/Dashboard/`)
   - Main container component
   - Orchestrates data fetching and state management
   - Renders all child components
   - Handles time window selection

2. **CompanyCard** (`src/components/CompanyCard/`)
   - Displays individual company metrics
   - Shows current price, change, and mini sparkline
   - Color-coded positive/negative indicators
   - Handles loading and error states

3. **ChartPanel** (`src/components/ChartPanel/`)
   - Multi-company comparison chart
   - Uses Recharts for visualization
   - Responsive design with custom tooltips
   - Supports multiple time windows

4. **TimeWindowSelector** (`src/components/TimeWindowSelector/`)
   - Toggle between day/week/quarter views
   - Controlled component pattern
   - Accessible button group

5. **LoadingSpinner** (`src/components/LoadingSpinner/`)
   - Reusable loading indicator
   - Customizable message
   - CSS animation

6. **ErrorBoundary** (`src/components/ErrorBoundary/`)
   - Error handling UI
   - Retry functionality
   - Partial data support
   - Development error details

## Service Layer

### financeService.js
- Singleton service for data fetching
- Caching layer with TTL
- Batch operations support
- Error classification and user-friendly messages
- Mock data integration for demo

### mockData.js
- Generates realistic mock data
- Supports quotes and historical data
- Configurable delay simulation
- Used for development and demos

## Custom Hooks

### useMarketData
- Fetches data for multiple symbols
- Manages loading and error states
- Auto-refresh capability
- Retry functionality
- Cleanup on unmount

## Utilities

### formatters.js
- Currency formatting
- Percentage formatting
- Date formatting
- Large number abbreviations

### dateHelpers.js
- Date range calculations
- Unix timestamp conversion
- Market hours checking

## Constants

### companies.js
- Company definitions (symbol, name, color)
- Helper functions for company lookup
- Color mapping for charts

### chartConfig.js
- Chart styling configuration
- Time window definitions
- Tooltip and legend settings

## State Management

### AppContext
- Global state using React Context
- Time window selection
- Market data cache
- Loading and error states
- Action creators for state updates

## Data Flow

```
User Interaction
    ↓
Dashboard Component
    ↓
useMarketData Hook
    ↓
financeService
    ↓
Cache Check
    ↓
Mock Data / API
    ↓
Data Transformation
    ↓
State Update
    ↓
Component Re-render
```

## File Organization

```
src/
├── components/       # UI components (presentational + container)
├── services/         # Data fetching and business logic
├── hooks/           # Custom React hooks
├── context/         # Global state management
├── utils/           # Pure utility functions
├── constants/       # Configuration and constants
├── App.js           # Root component
└── index.js         # Entry point
```

## Key Design Patterns

1. **Container/Presentational Pattern**
   - Dashboard = Container (logic)
   - CompanyCard, ChartPanel = Presentational (UI)

2. **Custom Hooks Pattern**
   - useMarketData encapsulates data fetching logic
   - Reusable across components

3. **Service Layer Pattern**
   - financeService abstracts data source
   - Easy to swap mock/real data

4. **Context Pattern**
   - AppContext for global state
   - Avoids prop drilling

5. **Error Boundary Pattern**
   - Graceful error handling
   - Partial data support

## Extensibility Points

### Adding New Companies
1. Update `src/constants/companies.js`
2. Add company to COMPANIES array
3. No other changes needed

### Adding New Time Windows
1. Update `src/constants/chartConfig.js`
2. Add to TIME_WINDOWS and TIME_WINDOW_LABELS
3. Update date range logic in `dateHelpers.js`

### Switching to Real API
1. Set `USE_MOCK_DATA = false` in `financeService.js`
2. Implement real API calls in service methods
3. May need backend proxy for CORS

### Adding New Features
- **User-selected companies**: Add CompanySelector component
- **Real-time updates**: Integrate WebSocket in service layer
- **Alerts**: Add notification system in context
- **Export**: Add export utility in utils folder

## Testing Strategy

### Unit Tests
- Utils (formatters, dateHelpers)
- Services (financeService, mockData)
- Pure components (CompanyCard, ChartPanel)

### Integration Tests
- Dashboard data flow
- Hook behavior
- Error handling

### E2E Tests
- User workflows
- Time window switching
- Error recovery

## Performance Considerations

1. **Caching**: 60-second TTL reduces API calls
2. **Memoization**: React.memo for expensive components
3. **Code Splitting**: Lazy load chart library if needed
4. **Debouncing**: Prevent rapid re-fetches
5. **Virtualization**: For large company lists (future)

## Accessibility

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast compliance
- Screen reader friendly error messages

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

### Production
- react: ^18.x
- react-dom: ^18.x
- recharts: ^2.x
- date-fns: ^2.x
- yahoo-finance2: ^2.x

### Development
- react-scripts: ^5.x
- @testing-library/react: ^13.x
- @testing-library/jest-dom: ^5.x