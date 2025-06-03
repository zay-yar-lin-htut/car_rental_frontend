/**
 * Global configuration settings for the data fetching system
 */

// Default timeout for requests in milliseconds (10 seconds)
export const DEFAULT_TIMEOUT = 10000;

// Default headers for all requests
export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

// Cache configuration
export const CACHE_CONFIG = {
    // Default stale time (5 minutes)
    defaultStaleTime: 5 * 60 * 1000,
    // Default cache time (10 minutes)
    defaultCacheTime: 10 * 60 * 1000,
    // Cache time for frequently changing data (1 minute)
    shortCacheTime: 60 * 1000,
    // Cache time for rarely changing data (1 hour)
    longCacheTime: 60 * 60 * 1000,
};

// Retry configuration
export const RETRY_CONFIG = {
    // Maximum number of retries
    maxRetries: 3,
    // Base delay between retries in milliseconds
    retryDelay: 1000,
    // Function to determine if a request should be retried
    shouldRetry: (error) => {
        // Retry on network errors or 5xx server errors
        if (!error.response) return true; // Network error
        const status = error.response?.status;
        return status >= 500 && status < 600; // Server error
    },
};

// Authentication configuration
export const AUTH_CONFIG = {
    // Storage key for the authentication token
    tokenKey: 'car_rental_auth_token',

    // Get the authentication token from storage
    getToken: () => {
        return localStorage.getItem(AUTH_CONFIG.tokenKey);
    },

    // Set the authentication token in storage
    setToken: (token) => {
        localStorage.setItem(AUTH_CONFIG.tokenKey, token);
    },

    // Clear the authentication token from storage
    clearToken: () => {
        localStorage.removeItem(AUTH_CONFIG.tokenKey);
    },

    // Check if the user is authenticated
    isAuthenticated: () => {
        return !!AUTH_CONFIG.getToken();
    },

    // Get the authorization headers
    getAuthHeaders: () => {
        const token = AUTH_CONFIG.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    },
    //store user data in local storage
    setUserData: (userData) => {
        localStorage.setItem('userData', JSON.stringify(userData));
    },
    //get user data from local storage
    getUserData: () => {
        const userData = localStorage.getItem('userData');
        return userData
            ? JSON.parse(userData) : null;
    },
    //clear user data from local storage
    clearUserData: () => {
        localStorage.removeItem('userData');
    },
};

// Error handling configuration
export const ERROR_CONFIG = {
    // Default error messages
    defaultErrorMessages: {
        network: 'Network error. Please check your internet connection.',
        server: 'Server error. Please try again later.',
        unauthorized: 'You are not authorized to perform this action.',
        notFound: 'The requested resource was not found.',
        validation: 'Validation error. Please check your input.',
        unknown: 'An unknown error occurred. Please try again.',
    },

    // Get error message based on error object
    getErrorMessage: (error) => {
        if (!error.response) {
            return ERROR_CONFIG.defaultErrorMessages.network;
        }

        const status = error.response.status;

        switch (status) {
            case 401:
                return ERROR_CONFIG.defaultErrorMessages.unauthorized;
            case 404:
                return ERROR_CONFIG.defaultErrorMessages.notFound;
            case 422:
                return ERROR_CONFIG.defaultErrorMessages.validation;
            case 500:
                return ERROR_CONFIG.defaultErrorMessages.server;
            default:
                return error.message || ERROR_CONFIG.defaultErrorMessages.unknown;
        }
    },
};

// API endpoints
export const API_ENDPOINTS = {
    // Authentication endpoints
    auth: {
        login: '/api/login',
        register: '/api/register',
        logout: '/api/user/logout',
        refreshToken: '/auth/refresh-token',
    },
    // Car endpoints
    cars: {
        base: '/cars',
        getAll: '/cars',
        getById: (id) => `/cars/${id}`,
        create: '/cars',
        update: (id) => `/cars/${id}`,
        delete: (id) => `/cars/${id}`,
    },
    // Booking endpoints
    bookings: {
        base: '/bookings',
        getAll: '/bookings',
        getById: (id) => `/bookings/${id}`,
        create: '/bookings',
        update: (id) => `/bookings/${id}`,
        delete: (id) => `/bookings/${id}`,
        getUserBookings: (userId) => `/users/${userId}/bookings`,
    },
    // User endpoints
    users: {
        base: '/users',
        getAll: '/users',
        getById: (id) => `/users/${id}`,
        create: '/users',
        update: (id) => `/users/${id}`,
        delete: (id) => `/users/${id}`,
        profile: '/users/profile',
    },
};