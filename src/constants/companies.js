// Company definitions for the finance dashboard
export const COMPANIES = [
  {
    symbol: 'IBM',
    name: 'International Business Machines',
    color: '#0f62fe'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    color: '#24a148'
  },
  {
    symbol: 'ORCL',
    name: 'Oracle Corporation',
    color: '#da1e28'
  },
  {
    symbol: 'SAP',
    name: 'SAP SE',
    color: '#8a3ffc'
  },
  {
    symbol: 'CRM',
    name: 'Salesforce Inc.',
    color: '#ff832b'
  }
];

export const COMPANY_SYMBOLS = COMPANIES.map(c => c.symbol);

export const COMPANY_COLORS = COMPANIES.reduce((acc, company) => {
  acc[company.symbol] = company.color;
  return acc;
}, {});

export const getCompanyBySymbol = (symbol) => {
  return COMPANIES.find(c => c.symbol === symbol);
};

/**
 * Generate a consistent color for user-selected companies
 * @param {string} symbol - Stock ticker symbol
 * @returns {string} Hex color code
 */
export const generateDynamicColor = (symbol) => {
  // Color palette for user-selected companies (distinct from default colors)
  const colors = ['#1192e8', '#fa4d56', '#198038', '#b28600', '#8a3800', '#ee5396', '#6929c4'];
  
  // Generate consistent hash from symbol
  const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return colors[hash % colors.length];
};

// Made with Bob
