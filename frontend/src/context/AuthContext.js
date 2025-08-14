import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api.js';

// Initial state
const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
};

// Actions
const AUTH_ACTIONS = {
    LOGIN_START: 'LOGIN_START',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    REGISTER_START: 'REGISTER_START',
    REGISTER_SUCCESS: 'REGISTER_SUCCESS',
    REGISTER_FAILURE: 'REGISTER_FAILURE',
    LOGOUT: 'LOGOUT',
    CLEAR_ERROR: 'CLEAR_ERROR',
    SET_LOADING: 'SET_LOADING'
};

// Reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_START:
        case AUTH_ACTIONS.REGISTER_START:
            return {
                ...state,
                isLoading: true,
                error: null
            };
            
        case AUTH_ACTIONS.LOGIN_SUCCESS:
        case AUTH_ACTIONS.REGISTER_SUCCESS:
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                isLoading: false,
                error: null
            };
            
        case AUTH_ACTIONS.LOGIN_FAILURE:
        case AUTH_ACTIONS.REGISTER_FAILURE:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: action.payload
            };
            
        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
            };
            
        case AUTH_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null
            };
            
        case AUTH_ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };
            
        default:
            return state;
    }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check for existing user on mount
    useEffect(() => {
        const checkAuthStatus = () => {
            const user = apiService.getCurrentUser();
            if (user && apiService.isAuthenticated()) {
                dispatch({
                    type: AUTH_ACTIONS.LOGIN_SUCCESS,
                    payload: user
                });
            } else {
                dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            }
        };

        checkAuthStatus();
    }, []);

    // Login function
    const login = async (credentials) => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START });
        
        try {
            const response = await apiService.login(credentials);
            
            if (response.success) {
                dispatch({
                    type: AUTH_ACTIONS.LOGIN_SUCCESS,
                    payload: response.data
                });
                return { success: true };
            }
        } catch (error) {
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: error.message
            });
            return { success: false, error: error.message };
        }
    };

    // Register function
    const register = async (userData) => {
        dispatch({ type: AUTH_ACTIONS.REGISTER_START });
        
        try {
            const response = await apiService.register(userData);
            
            if (response.success) {
                dispatch({
                    type: AUTH_ACTIONS.REGISTER_SUCCESS,
                    payload: response.data
                });
                return { success: true };
            }
        } catch (error) {
            dispatch({
                type: AUTH_ACTIONS.REGISTER_FAILURE,
                payload: error.message
            });
            return { success: false, error: error.message };
        }
    };

    // Logout function
    const logout = () => {
        apiService.logout();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
    };

    // Clear error function
    const clearError = () => {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    };

    const value = {
        ...state,
        login,
        register,
        logout,
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};