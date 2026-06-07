import React, { createContext, useContext, useReducer } from 'react';
import { TIME_WINDOWS } from '../constants/chartConfig';

// Initial state
const initialState = {
  timeWindow: TIME_WINDOWS.DAY,
  selectedCompany: null,
  marketData: {},
  loading: false,
  error: null
};

// Action types
export const ActionTypes = {
  SET_TIME_WINDOW: 'SET_TIME_WINDOW',
  SET_SELECTED_COMPANY: 'SET_SELECTED_COMPANY',
  SET_MARKET_DATA: 'SET_MARKET_DATA',
  UPDATE_COMPANY_DATA: 'UPDATE_COMPANY_DATA',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_TIME_WINDOW:
      return {
        ...state,
        timeWindow: action.payload
      };
    
    case ActionTypes.SET_SELECTED_COMPANY:
      return {
        ...state,
        selectedCompany: action.payload
      };
    
    case ActionTypes.SET_MARKET_DATA:
      return {
        ...state,
        marketData: action.payload,
        loading: false,
        error: null
      };
    
    case ActionTypes.UPDATE_COMPANY_DATA:
      return {
        ...state,
        marketData: {
          ...state.marketData,
          [action.payload.symbol]: action.payload.data
        }
      };
    
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value = {
    state,
    dispatch,
    // Action creators
    setTimeWindow: (window) => 
      dispatch({ type: ActionTypes.SET_TIME_WINDOW, payload: window }),
    
    setSelectedCompany: (symbol) => 
      dispatch({ type: ActionTypes.SET_SELECTED_COMPANY, payload: symbol }),
    
    setMarketData: (data) => 
      dispatch({ type: ActionTypes.SET_MARKET_DATA, payload: data }),
    
    updateCompanyData: (symbol, data) => 
      dispatch({ type: ActionTypes.UPDATE_COMPANY_DATA, payload: { symbol, data } }),
    
    setLoading: (loading) => 
      dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    
    setError: (error) => 
      dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    
    clearError: () => 
      dispatch({ type: ActionTypes.CLEAR_ERROR })
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;

// Made with Bob
