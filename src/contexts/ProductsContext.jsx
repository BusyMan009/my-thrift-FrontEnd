import { createContext, useContext, useReducer, useCallback } from 'react';

const ProductsContext = createContext();

const ACTIONS = {
  SET_PRODUCTS: 'SET_PRODUCTS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_PAGINATION: 'SET_PAGINATION',
  APPEND_PRODUCTS: 'APPEND_PRODUCTS',
  CLEAR: 'CLEAR'
};

const initialState = {
  products: [],
  loading: false,
  error: null,
  pagination: null,
  lastFetch: 0
};

function productsReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_PRODUCTS:
      return {
        ...state,
        products: action.payload,
        loading: false,
        error: null,
        lastFetch: Date.now()
      };
    
    case ACTIONS.APPEND_PRODUCTS:
      return {
        ...state,
        products: [...state.products, ...action.payload],
        loading: false
      };
    
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.SET_PAGINATION:
      return { ...state, pagination: action.payload };
    
    case ACTIONS.CLEAR:
      return initialState;
    
    default:
      return state;
  }
}

export function ProductsProvider({ children }) {
  const [state, dispatch] = useReducer(productsReducer, initialState);

  const setProducts = useCallback((products) => {
    dispatch({ type: ACTIONS.SET_PRODUCTS, payload: products });
  }, []);

  const appendProducts = useCallback((products) => {
    dispatch({ type: ACTIONS.APPEND_PRODUCTS, payload: products });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: error });
  }, []);

  const setPagination = useCallback((pagination) => {
    dispatch({ type: ACTIONS.SET_PAGINATION, payload: pagination });
  }, []);

  const clearProducts = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR });
  }, []);

  const value = {
    ...state,
    setProducts,
    appendProducts,
    setLoading,
    setError,
    setPagination,
    clearProducts
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductsProvider');
  }
  return context;
}