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
            return ERROR_CONFIG.defaultErrorMessages.unknown;
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
        logout: '/api/logout',
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
        updateProfile: '/api/update-profile',
        getUserProfile: '/api/profile'
    },
};

//User Role Type 
export const USER_ROLE_TYPE = {
    ADMIN: 3,
    STUFF: 2,
    USER: 1,
};