import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';


// User Context
const UserContext = createContext();

// Action types
const USER_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  UPDATE_USER: 'UPDATE_USER',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state
const initialState = {
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false
};

// Reducer
function userReducer(state, action) {
  switch (action.type) {
    case USER_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case USER_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null,
        isAuthenticated: !!action.payload
      };
    
    case USER_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        error: null
      };
    
    case USER_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case USER_ACTIONS.LOGOUT:
      return {
        ...initialState,
        loading: false
      };
    
    case USER_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
}

// API Helper
const makeApiRequest = async (url, options = {}) => {
  try {
    const token = localStorage.getItem("authToken");
    
    const response = await axios({
      url: `${API_BASE_URL}${url}`,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        "ngrok-skip-browser-warning": "true",
        ...options.headers
      },
      ...options,
    });
    
    return { data: response.data, error: null };
  } catch (error) {
    console.error(`API Error for ${url}:`, error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      return { data: null, error: "Session expired" };
    }
    
    return { 
      data: null, 
      error: error.response?.data?.message || error.message || 'An unexpected error occurred'
    };
  }
};

// Provider Component
export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Fetch user data
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      dispatch({ type: USER_ACTIONS.SET_USER, payload: null });
      return;
    }

    dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
    
    const { data, error } = await makeApiRequest('/api/users/profile');
    
    if (error) {
      if (error === "Session expired") {
        dispatch({ type: USER_ACTIONS.LOGOUT });
      } else {
        dispatch({ type: USER_ACTIONS.SET_ERROR, payload: error });
      }
    } else {
      const user = data.user || data;
      dispatch({ type: USER_ACTIONS.SET_USER, payload: user });
      localStorage.setItem('userData', JSON.stringify(user));
    }
  }, []);

  // Update user profile
  const updateUserProfile = useCallback(async (formData) => {
    const { data, error } = await makeApiRequest('/api/users/profile', {
      method: 'PUT',
      data: formData
    });

    if (error) {
      if (error === "Session expired") {
        dispatch({ type: USER_ACTIONS.LOGOUT });
        window.location.href = "/login";
      }
      throw new Error(error);
    } else {
      const updatedUser = data.user || data;
      dispatch({ type: USER_ACTIONS.UPDATE_USER, payload: updatedUser });
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      return updatedUser;
    }
  }, []);

  // Login
  const login = useCallback((token, userData, callback) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userData", JSON.stringify(userData));
    dispatch({ type: USER_ACTIONS.SET_USER, payload: userData });
    
    // استدعاء callback بعد تحديث الـ state
    if (callback && typeof callback === 'function') {
      // استخدام queueMicrotask للتأكد من تحديث الـ state أولاً
      queueMicrotask(() => {
        callback();
      });
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    dispatch({ type: USER_ACTIONS.LOGOUT });
    window.location.replace("/");
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: USER_ACTIONS.CLEAR_ERROR });
  }, []);

  // Initial load
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const value = {
    ...state,
    fetchUser,
    updateUserProfile,
    login,
    logout,
    clearError
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use user context
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}