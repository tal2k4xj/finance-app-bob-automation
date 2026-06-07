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

// Made with Bob
