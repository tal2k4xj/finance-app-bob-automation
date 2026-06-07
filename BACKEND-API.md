# Backend API for Real Yahoo Finance Data

## Overview

The finance dashboard application uses **mock data by default** for development and demonstration purposes. To use real Yahoo Finance data, you need to implement a backend API server that acts as a proxy between the React frontend and the Yahoo Finance API.

## Why a Backend Proxy is Required

The `yahoo-finance2` npm package is designed for Node.js and cannot run in the browser because it:
- Uses Node.js-specific modules (`fs`, `net`, `os`, etc.)
- Requires server-side execution for API calls
- Handles authentication and rate limiting server-side

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  React Frontend │ ◄─────► │  Backend Proxy   │ ◄─────► │ Yahoo Finance   │
│  (Browser)      │  HTTP   │  (Node.js)       │  API    │  API            │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

## Switching Between Mock and Real Data

Set the environment variable in your `.env` file:

```bash
# Use mock data (default)
REACT_APP_USE_MOCK_DATA=true

# Use real Yahoo Finance data via backend
REACT_APP_USE_MOCK_DATA=false
REACT_APP_BACKEND_API_URL=http://localhost:3001/api
```

## Backend API Endpoints

Your backend server should implement the following REST API endpoints:

### 1. Get Single Quote
```
GET /api/quote/:symbol
```

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "IBM",
    "name": "International Business Machines Corporation",
    "price": 185.42,
    "change": 2.15,
    "changePercent": 1.17,
    "volume": 4523000,
    "marketCap": 170500000000,
    "high": 186.50,
    "low": 183.20,
    "open": 184.00,
    "previousClose": 183.27
  }
}
```

### 2. Get Historical Data
```
GET /api/historical/:symbol?period1=<timestamp>&period2=<timestamp>&interval=<interval>
```

**Query Parameters:**
- `period1`: Start timestamp (Unix epoch)
- `period2`: End timestamp (Unix epoch)
- `interval`: Data interval (`1d`, `1wk`, `1mo`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15T00:00:00.000Z",
      "open": 184.00,
      "high": 186.50,
      "low": 183.20,
      "close": 185.42,
      "volume": 4523000
    }
  ]
}
```

### 3. Get Batch Quotes
```
POST /api/quotes
Content-Type: application/json

{
  "symbols": ["IBM", "MSFT", "ORCL", "SAP", "CRM"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "IBM": { /* quote data */ },
    "MSFT": { /* quote data */ },
    "ORCL": { /* quote data */ },
    "SAP": { /* quote data */ },
    "CRM": { /* quote data */ }
  }
}
```

### 4. Get Batch Historical Data
```
POST /api/historical-batch?period1=<timestamp>&period2=<timestamp>&interval=<interval>
Content-Type: application/json

{
  "symbols": ["IBM", "MSFT", "ORCL", "SAP", "CRM"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "IBM": [ /* historical data array */ ],
    "MSFT": [ /* historical data array */ ],
    "ORCL": [ /* historical data array */ ],
    "SAP": [ /* historical data array */ ],
    "CRM": [ /* historical data array */ ]
  }
}
```

### 5. Search Symbols
```
GET /api/search?q=<query>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "IBM",
      "name": "International Business Machines Corporation",
      "exchange": "NYSE"
    }
  ]
}
```

## Example Backend Implementation

Here's a minimal Express.js backend server implementation:

### 1. Install Dependencies

```bash
mkdir finance-backend
cd finance-backend
npm init -y
npm install express cors yahoo-finance2 dotenv
```

### 2. Create `server.js`

```javascript
const express = require('express');
const cors = require('cors');
const yahooFinance = require('yahoo-finance2').default;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Get single quote
app.get('/api/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const quote = await yahooFinance.quote(symbol);
    
    res.json({
      success: true,
      data: {
        symbol: quote.symbol,
        name: quote.longName || quote.shortName,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        volume: quote.regularMarketVolume,
        marketCap: quote.marketCap,
        high: quote.regularMarketDayHigh,
        low: quote.regularMarketDayLow,
        open: quote.regularMarketOpen,
        previousClose: quote.regularMarketPreviousClose
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

// Get historical data
app.get('/api/historical/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period1, period2, interval } = req.query;
    
    const result = await yahooFinance.historical(symbol, {
      period1: new Date(parseInt(period1) * 1000),
      period2: new Date(parseInt(period2) * 1000),
      interval: interval || '1d'
    });
    
    const data = result.map(item => ({
      date: item.date.toISOString(),
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume
    }));
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

// Get batch quotes
app.post('/api/quotes', async (req, res) => {
  try {
    const { symbols } = req.body;
    const quotes = await Promise.all(
      symbols.map(symbol => yahooFinance.quote(symbol))
    );
    
    const data = {};
    quotes.forEach(quote => {
      data[quote.symbol] = {
        symbol: quote.symbol,
        name: quote.longName || quote.shortName,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        volume: quote.regularMarketVolume,
        marketCap: quote.marketCap,
        high: quote.regularMarketDayHigh,
        low: quote.regularMarketDayLow,
        open: quote.regularMarketOpen,
        previousClose: quote.regularMarketPreviousClose
      };
    });
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

// Get batch historical data
app.post('/api/historical-batch', async (req, res) => {
  try {
    const { symbols } = req.body;
    const { period1, period2, interval } = req.query;
    
    const results = await Promise.all(
      symbols.map(symbol =>
        yahooFinance.historical(symbol, {
          period1: new Date(parseInt(period1) * 1000),
          period2: new Date(parseInt(period2) * 1000),
          interval: interval || '1d'
        })
      )
    );
    
    const data = {};
    symbols.forEach((symbol, index) => {
      data[symbol] = results[index].map(item => ({
        date: item.date.toISOString(),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume
      }));
    });
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

// Search symbols
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    const results = await yahooFinance.search(q);
    
    const data = results.quotes.map(quote => ({
      symbol: quote.symbol,
      name: quote.longname || quote.shortname,
      exchange: quote.exchange
    }));
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API server running on http://localhost:${PORT}`);
});
```

### 3. Run the Backend Server

```bash
node server.js
```

### 4. Update Frontend Environment

Create or update `finance-app/.env`:

```bash
REACT_APP_USE_MOCK_DATA=false
REACT_APP_BACKEND_API_URL=http://localhost:3001/api
```

## Production Considerations

### 1. Rate Limiting
Implement rate limiting to avoid hitting Yahoo Finance API limits:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 2. Caching
Add caching to reduce API calls:

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 }); // 60 second TTL

app.get('/api/quote/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const cacheKey = `quote_${symbol}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  
  // Fetch from API and cache
  const data = await fetchQuote(symbol);
  cache.set(cacheKey, data);
  res.json(data);
});
```

### 3. Error Handling
Add comprehensive error handling and logging:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    data: null
  });
});
```

### 4. Authentication
Add API key authentication for production:

```javascript
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      data: null
    });
  }
  next();
};

app.use('/api/', authenticateApiKey);
```

## Testing the Backend

Use curl or Postman to test endpoints:

```bash
# Test single quote
curl http://localhost:3001/api/quote/IBM

# Test historical data
curl "http://localhost:3001/api/historical/IBM?period1=1704067200&period2=1704672000&interval=1d"

# Test batch quotes
curl -X POST http://localhost:3001/api/quotes \
  -H "Content-Type: application/json" \
  -d '{"symbols":["IBM","MSFT","ORCL"]}'
```

## Deployment

Deploy the backend to:
- **Heroku**: `git push heroku main`
- **AWS Lambda**: Use serverless framework
- **Google Cloud Run**: Containerize with Docker
- **DigitalOcean App Platform**: Connect GitHub repo

Update `REACT_APP_BACKEND_API_URL` to your production backend URL.

## Summary

1. **Development**: Use mock data (default, no backend needed)
2. **Production**: Implement backend proxy with yahoo-finance2
3. **Configuration**: Toggle via environment variables
4. **Security**: Add rate limiting, caching, and authentication
5. **Deployment**: Deploy backend separately from frontend