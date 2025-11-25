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
    userDataKey: 'userData',

    // Get the authentication token from storage
    getToken: () => {
        return localStorage.getItem(AUTH_CONFIG.tokenKey) || sessionStorage.getItem(AUTH_CONFIG.tokenKey);
    },

    // Set the authentication token in storage based on rememberMe flag
    setToken: (token, rememberMe) => {
        if (rememberMe) {
            localStorage.setItem(AUTH_CONFIG.tokenKey, token);
            sessionStorage.removeItem(AUTH_CONFIG.tokenKey); // Clear from session if now remembering
        } else {
            sessionStorage.setItem(AUTH_CONFIG.tokenKey, token);
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
    setUserData: (userData, rememberMe) => {
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
        contact: "/api/contact-us-create"
    },
    // Car endpoints
    cars: {
        base: '/api',
        getAll: '/cars',
        // Sample query parameters:
        // http://127.0.0.1:8000/api/cars?
        // first=1&max=5&
        // asc_day=false&
        // asc_hour=true&
        // asc_total=true&
        // pickup_datetime=2025-10-24%2022%3A50%3A38&
        // dropoff_datetime=2025-10-30%2022%3A50%3A38&
        // car_type_id=4&
        // fuel_type=petrol
        //
        // sample response
        //    {
        //         "success": true,
        //         "message": "Cars Retrieved Successfully",
        //         "data": {
        //             "data": [
        //                 {
        //                     "car_id": 11,
        //                     "car_type": "small",
        //                     "model": "Honda Fit",
        //                     "description": "Fuel-efficient subcompact hatchback.",
        //                     "license_plate": "06-HF0A (MDY)",
        //                     "price_per_hour": "5000.00",
        //                     "price_per_day": "80000.00",
        //                     "availability": 1,
        //                     "number_of_seats": 5,
        //                     "luggage_capacity": 3,
        //                     "color": "Black",
        //                     "transmission": "auto",
        //                     "fuel_type": "petrol",
        //                     "created_at": "2025-11-08 12:29:37",
        //                     "updated_at": "2025-11-08 12:29:37",
        //                     "car_image_url": "https://pub-64f9509f377f4746abc03aba2add5b1c.r2.dev/Cars/honda_fit_black.png",
        //                     "total_price": 480000
        //                 },
        //             ],
        //             "first": 1,
        //             "max": 10,
        //             "total": 26,
        //             "total_page": 3
        //         }
        //     },

        getById: (id) => `/cars/${id}`,
        create: '/api/admin/car-create',
        update: (id) => `/api/admin/car-update/${id}`,
        delete: (id) => `/admin/car-delete/${id}`,
    },
    // Pricing endpoints
    carTypes: {
        base: '/api',
        getAll: '/car-types',
    },
    // Location endpoints
    locations: {
        base: '/api',
        getAll: '/locations',
        // sample response
        // {
        //     "sucess": true,
        //     "message": "Office locations found",
        //     "data": [
        //         {
        //             "office_location_id": 1,
        //             "location_name": "Mandalay office",
        //             "location": [
        //                 "21.869075",
        //                 "96.105194"
        //             ],
        //             "created_at": "2025-08-20 10:04:54",
        //             "updated_at": "2025-10-06 18:28:28"
        //         },
        //     ]
        // }
    },
    // Booking endpoints
    bookings: {
        base: '/api',
        getAll: '/bookings',
        getById: (id) => `/bookings/${id}`,
        create: '/api/booking-create',
        cancel: (id) => `/booking-cancel/${id}`,
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
        // sample response
        // {
        //     "success": true,
        //     "message": "Fines Status Retrieved Successfully",
        //     "data": {
        //         "No-show Fine": 40000,
        //         "Cancellation Fine": 210000,
        //         "Total Fine": 250000
        //     }
        // }
    },
    staff: {
        tdyTakeBack: "/staff/today-takebacks",
        tdyDeli: "/staff/today-deliveries",
    },
    // Image proxy endpoint
    image: {
        proxy: '/api/proxy-image',
    },
    location: {
        base: '/api',
        getOffice: '/office-locations',
    },
    contact: {
        base: '/api',
        getContactUs: '/admin/contact-us',
        createContactUs: '/contact-us-create',
        resolveAdmin: (id) => `/admin/resolve-contact-us/${id}`,
        resolveWithStaffAssign: '/admin/assign-contact-us',
    },
    review: {
        base: '/api',
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