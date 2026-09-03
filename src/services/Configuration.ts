/**
 * Global configuration settings for the data fetching system
 */

import { Dashboard } from "@mui/icons-material";

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
    userDataKey: 'userData',

    // Get the authentication token from storage
    getToken: () => {
        return localStorage.getItem(AUTH_CONFIG.tokenKey) || sessionStorage.getItem(AUTH_CONFIG.tokenKey);
    },

    // Set the authentication token in storage based on rememberMe flag
    setToken: (token: string | null, rememberMe: boolean = false) => {
        if (rememberMe) {
            localStorage.setItem(AUTH_CONFIG.tokenKey, token ?? "");
            sessionStorage.removeItem(AUTH_CONFIG.tokenKey); // Clear from session if now remembering
        } else {
            sessionStorage.setItem(AUTH_CONFIG.tokenKey, token ?? "");
            localStorage.removeItem(AUTH_CONFIG.tokenKey); // Clear from local if not remembering
        }
    },

    // Clear the authentication token from both storages
    clearToken: () => {
        localStorage.removeItem(AUTH_CONFIG.tokenKey);
        sessionStorage.removeItem(AUTH_CONFIG.tokenKey);
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

    // Store user data in storage based on rememberMe flag
    setUserData: (userData: unknown, rememberMe: boolean = false) => {
        const data = JSON.stringify(userData);
        if (rememberMe) {
            localStorage.setItem(AUTH_CONFIG.userDataKey, data);
            sessionStorage.removeItem(AUTH_CONFIG.userDataKey);
        } else {
            sessionStorage.setItem(AUTH_CONFIG.userDataKey, data);
            localStorage.removeItem(AUTH_CONFIG.userDataKey);
        }
    },

    // Get user data from storage
    getUserData: () => {
        const userData = localStorage.getItem(AUTH_CONFIG.userDataKey) || sessionStorage.getItem(AUTH_CONFIG.userDataKey);
        return userData ? JSON.parse(userData) : null;
    },

    // Clear user data from both storages
    clearUserData: () => {
        localStorage.removeItem(AUTH_CONFIG.userDataKey);
        sessionStorage.removeItem(AUTH_CONFIG.userDataKey);
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
    getErrorMessage: (error: { response?: { status?: number }; message?: string }) => {
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
        contact: "/api/contact-us-create"
    },
    // Car endpoints
    cars: {
        base: '/api',
        getAll: '/cars',
        getById: (id: number | string) => `/cars/${id}`,
        create: '/api/admin/car-create',
        update: (id: number | string) => `/api/admin/car-update/${id}`,
        delete: (id: number | string) => `/admin/car-delete/${id}`,
    },
    // Pricing endpoints
    carTypes: {
        base: '/api',
        getAll: '/car-types',
        create: '/admin/car-type-create',
        update: (id: number | string) => `/admin/car-type-update/${id}`,
        delete: (id: number | string) => `/admin/car-type-delete/${id}`,
    },
    // Booking endpoints
    bookings: {
        base: '/api',
        getAll: '/bookings',
        getById: (id: number | string) => `/bookings/${id}`,
        create: '/api/booking-create',
        cancel: (id: number | string) => `/booking-cancel/${id}`,
    },
    // User endpoints
    users: {
        base: '/api',
        getAll: '/admin/user-list',
        addStaff: '/api/admin/admin-register',
        updateProfile: '/api/update-profile',
        getUserProfile: '/profile',
        uploadImage: "/api/upload&update-profile-image",
        haveFine: "/is-have-fines",
        resetPass: "/admin/password-reset/",
        banUser: "/admin/ban-user/",
        myBookings: '/user/my-bookings',
        isHaveFine: '/is-have-fines',
        changePassword: '/change-password',
        // sample request body: { current_password: string, new_password: string, new_password_confirmation: string }
    },
    Dashboard: {
        base: '/api',
        getData: '/admin/revenue-dashboard',
    },
    staff: {
        baseStaff: '/api/staff',
        staffHaveTask: '/is-have-task',
        tdyTakeBack: "/today-takebacks",
        tdyDeli: "/today-deliveries",
        claimTakeBack: (id: number | string) => `/claim-takeback/${id}`,
        claimDelivery: (id: number | string) => `/claim-delivery/${id}`,
        completeTakeBack: (id: number | string) => `/complete-takeback/${id}`,
        completeDelivery: (id: number | string) => `/complete-delivery/${id}`,
        taskHistory: "/task-history",
        activeTasks: "/my-active-tasks",
        costByTicket: (ticket: number | string) => `/cost-by-ticket/${ticket}`,
        getContactUs: "/contact-us",
        resolveContactUs: (id: number | string) => `/resolve-contact-us/${id}`,
        maintenanceTasks: "/maintenance-tasks",
        createMaintenanceReport: "/report-damage",
        completeMaintenanceTask: (id: number | string) => `/complete-maintenance/${id}`,

        todayPickups: "/today-self-pickups",
        todayDropoffs: "/today-self-dropoffs",
        completeSelfPickup: `/complete-self-pickup`,
        completeSelfDropoff: `/complete-self-dropoff`,

        noshowPickup: `/no-show-pickup`,
        // sample request body: { booking_id: number }
        noshowDelivery: `/no-show-delivery`,
        // sample request body: { booking_id: number }
    },
    image: {
        proxy: '/api/proxy-image',
    },
    location: {
        base: '/api',
        getAll: '/locations',
        getOffice: '/office-locations',
        createOffice: '/admin/office-location-create',
        updateOffice: (id: number | string) => `/admin/office-location-update/${id}`,
        deleteOffice: (id: number | string) => `/admin/office-location-delete/${id}`,
    },
    contact: {
        base: '/api',
        getContactUs: '/admin/contact-us',
        createContactUs: '/contact-us-create',
        resolveAdmin: (id: number | string) => `/admin/resolve-contact-us/${id}`,
        resolveWithStaffAssign: '/admin/assign-contact-us',
    },
    review: {
        base: '/api',
        get: '/admin/reviews',
        create: '/user/review-create',
    },
    userPreferenceLocations: {
        base: '/api',
        getAll: '/user/preference-locations',
        add: '/user/preference-location',
    },
};

//User Role Type 
export const USER_ROLE = {
    ADMIN: 3,
    STAFF: 2,
    USER: 1,
};