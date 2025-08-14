import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api.js';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
    tasks: [],
    stats: null,
    isLoading: false,
    error: null,
    filters: {
        search: '',
        completed: '',
        priority: ''
    },
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    }
};

// Actions
const TASK_ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_TASKS: 'SET_TASKS',
    ADD_TASK: 'ADD_TASK',
    UPDATE_TASK: 'UPDATE_TASK',
    DELETE_TASK: 'DELETE_TASK',
    SET_STATS: 'SET_STATS',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
    SET_FILTERS: 'SET_FILTERS',
    SET_PAGINATION: 'SET_PAGINATION'
};

// Reducer
const taskReducer = (state, action) => {
    switch (action.type) {
        case TASK_ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };
            
        case TASK_ACTIONS.SET_TASKS:
            return {
                ...state,
                tasks: action.payload,
                isLoading: false,
                error: null
            };
            
        case TASK_ACTIONS.ADD_TASK:
            return {
                ...state,
                tasks: [action.payload, ...state.tasks],
                error: null
            };
            
        case TASK_ACTIONS.UPDATE_TASK:
            return {
                ...state,
                tasks: state.tasks.map(task =>
                    task._id === action.payload._id ? action.payload : task
                ),
                error: null
            };
            
        case TASK_ACTIONS.DELETE_TASK:
            return {
                ...state,
                tasks: state.tasks.filter(task => task._id !== action.payload),
                error: null
            };
            
        case TASK_ACTIONS.SET_STATS:
            return {
                ...state,
                stats: action.payload
            };
            
        case TASK_ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                isLoading: false
            };
            
        case TASK_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null
            };
            
        case TASK_ACTIONS.SET_FILTERS:
            return {
                ...state,
                filters: { ...state.filters, ...action.payload }
            };
            
        case TASK_ACTIONS.SET_PAGINATION:
            return {
                ...state,
                pagination: { ...state.pagination, ...action.payload }
            };
            
        default:
            return state;
    }
};

// Create context
const TaskContext = createContext();

// Task provider component
export const TaskProvider = ({ children }) => {
    const [state, dispatch] = useReducer(taskReducer, initialState);
    const { isAuthenticated } = useAuth();

    // Fetch tasks
    const fetchTasks = async (params = {}) => {
        if (!isAuthenticated) return;
        
        dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });
        
        try {
            const queryParams = {
                ...state.filters,
                page: state.pagination.page,
                limit: state.pagination.limit,
                ...params
            };
            
            const response = await apiService.getTasks(queryParams);
            
            if (response.success) {
                dispatch({ type: TASK_ACTIONS.SET_TASKS, payload: response.data });
                dispatch({ type: TASK_ACTIONS.SET_PAGINATION, payload: response.pagination });
            }
        } catch (error) {
            dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: error.message });
        }
    };

    // Create task
    const createTask = async (taskData) => {
        try {
            const response = await apiService.createTask(taskData);
            
            if (response.success) {
                dispatch({ type: TASK_ACTIONS.ADD_TASK, payload: response.data });
                return { success: true };
            }
        } catch (error) {
            dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: error.message });
            return { success: false, error: error.message };
        }
    };

    // Update task
    const updateTask = async (taskId, updates) => {
        try {
            const response = await apiService.updateTask(taskId, updates);
            
            if (response.success) {
                dispatch({ type: TASK_ACTIONS.UPDATE_TASK, payload: response.data });
                return { success: true };
            }
        } catch (error) {
            dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: error.message });
            return { success: false, error: error.message };
        }
    };

    // Delete task
    const deleteTask = async (taskId) => {
        try {
            const response = await apiService.deleteTask(taskId);
            
            if (response.success) {
                dispatch({ type: TASK_ACTIONS.DELETE_TASK, payload: taskId });
                return { success: true };
            }
        } catch (error) {
            dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: error.message });
            return { success: false, error: error.message };
        }
    };

    // Fetch stats
    const fetchStats = async () => {
        if (!isAuthenticated) return;
        
        try {
            const response = await apiService.getTaskStats();
            
            if (response.success) {
                dispatch({ type: TASK_ACTIONS.SET_STATS, payload: response.data });
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    // Set filters
    const setFilters = (filters) => {
        dispatch({ type: TASK_ACTIONS.SET_FILTERS, payload: filters });
    };

    // Clear error
    const clearError = () => {
        dispatch({ type: TASK_ACTIONS.CLEAR_ERROR });
    };

    // Load tasks when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchTasks();
            fetchStats();
        }
    }, [isAuthenticated, state.filters, state.pagination.page]);

    const value = {
        ...state,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        fetchStats,
        setFilters,
        clearError
    };

    return (
        <TaskContext.Provider value={value}>
            {children}
        </TaskContext.Provider>
    );
};

// Custom hook to use task context
export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};