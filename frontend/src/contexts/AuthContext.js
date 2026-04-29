import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();
const INVALID_STORED_TOKENS = new Set(['', 'null', 'undefined']);

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        authorityMatrix: action.payload.authorityMatrix || state.authorityMatrix,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        authorityMatrix: null,
        loading: false,
        error: null,
      };
    case 'SET_AUTHORITY_MATRIX':
      return {
        ...state,
        authorityMatrix: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  authorityMatrix: null,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const fetchAuthorityMatrix = async () => {
    try {
      const response = await authAPI.getAuthorityMatrix();
      const matrix = response?.data || null;
      dispatch({ type: 'SET_AUTHORITY_MATRIX', payload: matrix });
      return matrix;
    } catch {
      dispatch({ type: 'SET_AUTHORITY_MATRIX', payload: null });
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const token = INVALID_STORED_TOKENS.has(storedToken || '') ? null : storedToken;

      if (token) {
        try {
          const response = await authAPI.getProfile();
          const authorityMatrix = await fetchAuthorityMatrix();
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: response.data,
              token: token,
              authorityMatrix,
            },
          });
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch({ type: 'LOGOUT' });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authAPI.login(credentials);
      const user = response.data?.user || response.data?.data?.user || null;
      const token = response.data?.token || response.data?.access_token || response.data?.data?.token || null;

      if (!user || !token) {
        throw new Error('Invalid login response from server');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      const authorityMatrix = await fetchAuthorityMatrix();
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token, authorityMatrix },
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authAPI.register(userData);
      const user = response.data?.user || response.data?.data?.user || null;
      const token = response.data?.token || response.data?.access_token || response.data?.data?.token || null;

      if (!user || !token) {
        throw new Error('Invalid registration response from server');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      const authorityMatrix = await fetchAuthorityMatrix();
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token, authorityMatrix },
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch({
      type: 'UPDATE_USER',
      payload: userData,
    });
  };

  const hasPermission = (permissionKey) => {
    const role = state?.user?.role;
    const rule = state?.authorityMatrix?.permissions?.[permissionKey]?.[role];
    if (rule === true) return true;
    if (typeof rule === 'string') return true; // scoped permissions enforced in API
    return false;
  };

  const value = {
    ...state,
    hasPermission,
    refreshAuthorityMatrix: fetchAuthorityMatrix,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
