import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BaseUrl } from './BaseUrl';
import {
    DEFAULT_HEADERS,
    DEFAULT_TIMEOUT,
    CACHE_CONFIG,
    RETRY_CONFIG,
    AUTH_CONFIG,
    ERROR_CONFIG,
    API_ENDPOINTS,
} from './Configuration';

/**
 * Custom hook for fetching data from the API
 * @param {string} endpoint - API endpoint to fetch data from
 * @param {Object} options - Additional options for the query
 * @param {Object} options.params - URL parameters
 * @param {Object} options.headers - Custom headers
 * @param {boolean} options.enabled - Whether the query should automatically run
 * @param {number} options.staleTime - Time in ms after data becomes stale
 * @param {number} options.cacheTime - Time in ms to keep unused data in cache
 * @param {Function} options.select - Transform or select a part of the data
 * @param {boolean} options.requireAuth - Whether the request requires authentication
 * @returns {Object} Query result object
 */
export const useFetch = (endpoint, options = {}) => {
    const {
        params = {},
        headers = {},
        enabled = true,
        staleTime = CACHE_CONFIG.defaultStaleTime,
        cacheTime = CACHE_CONFIG.defaultCacheTime,
        select,
        requireAuth = false,
        queryKey,
        ...restOptions
    } = options;

    // Build URL with query parameters
    const url = new URL(`${BaseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.append(key, value);
        }
    });

    // Prepare headers with defaults and auth if required
    const requestHeaders = {
        ...DEFAULT_HEADERS,
        ...headers,
        ...(requireAuth ? AUTH_CONFIG.getAuthHeaders() : {}),
    };

    // Use custom query key if provided, otherwise use endpoint and params
    const finalQueryKey = queryKey || [endpoint, params];

    return useQuery({
        queryKey: finalQueryKey,
        queryFn: async () => {
            try {
                // Create AbortController for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: requestHeaders,
                    signal: controller.signal,
                });
                console.log("response", response);


                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                        errorData.message || `Error ${response.status}: ${response.statusText}`
                    );
                }

                return await response.json();
            } catch (error) {
                console.error(`Error fetching data from ${endpoint}:`, error);
                // Handle authentication errors
                if (error.response?.status === 401 && requireAuth) {
                    AUTH_CONFIG.clearToken();
                }
                throw error;
            }
        },
        enabled: enabled && (!requireAuth || AUTH_CONFIG.isAuthenticated()),
        staleTime,
        gcTime: cacheTime,
        select,
        retry: (failureCount, error) => {
            if (failureCount >= RETRY_CONFIG.maxRetries) return false;
            return RETRY_CONFIG.shouldRetry(error);
        },
        retryDelay: (attemptIndex) => Math.min(
            attemptIndex * RETRY_CONFIG.retryDelay,
            30000 // Max delay of 30 seconds
        ),
        ...restOptions,
    });
};

/**
 * Custom hook for creating data via API
 * @param {string} endpoint - API endpoint to send data to
 * @param {Object} options - Additional options for the mutation
 * @param {Object} options.headers - Custom headers
 * @param {Function} options.onSuccess - Callback function on successful mutation
 * @param {Function} options.onError - Callback function on mutation error
 * @param {boolean} options.requireAuth - Whether the request requires authentication
 * @returns {Object} Mutation result object
 */
export const useCreate = (endpoint, options = {}) => {
    const queryClient = useQueryClient();
    const {
        headers = {},
        onSuccess,
        onError,
        requireAuth = true,
        invalidateQueries = true,
        ...restOptions
    } = options;

    return useMutation({
        mutationFn: async (data) => {
            try {
                // Create AbortController for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

                // Prepare headers with defaults and auth if required
                const requestHeaders = {
                    ...DEFAULT_HEADERS,
                    ...headers,
                    ...(requireAuth ? AUTH_CONFIG.getAuthHeaders() : {}),
                };

                const response = await fetch(`${BaseUrl}${endpoint}`, {
                    method: 'POST',
                    headers: requestHeaders,
                    body: JSON.stringify(data),
                    signal: controller.signal,
                });
                console.log("response", response);


                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                        errorData.message || `Error ${response.status}: ${response.statusText}`
                    );
                }

                return await response.json();
            } catch (error) {
                console.error(`Error creating data at ${endpoint}:`, error);
                // Handle authentication errors
                if (error.response?.status === 401 && requireAuth) {
                    AUTH_CONFIG.clearToken();
                }
                throw error;
            }
        },
        onSuccess: (data, variables, context) => {
            // Invalidate related queries to refetch data
            if (invalidateQueries) {
                queryClient.invalidateQueries({ queryKey: [endpoint] });
            }
            if (onSuccess) onSuccess(data, variables, context);
        },
        onError: (error, variables, context) => {
            if (onError) onError(error, variables, context);
        },
        retry: (failureCount, error) => {
            if (failureCount >= RETRY_CONFIG.maxRetries) return false;
            return RETRY_CONFIG.shouldRetry(error);
        },
        retryDelay: (attemptIndex) => Math.min(
            attemptIndex * RETRY_CONFIG.retryDelay,
            30000 // Max delay of 30 seconds
        ),
        ...restOptions,
    });
};

/**
 * Custom hook for updating data via API
 * @param {string} endpoint - Base API endpoint
 * @param {Object} options - Additional options for the mutation
 * @param {Object} options.headers - Custom headers
 * @param {Function} options.onSuccess - Callback function on successful mutation
 * @param {Function} options.onError - Callback function on mutation error
 * @param {boolean} options.requireAuth - Whether the request requires authentication
 * @returns {Object} Mutation result object
 */
export const useUpdate = (endpoint, options = {}) => {
    const queryClient = useQueryClient();
    const {
        headers = {},
        onSuccess,
        onError,
        requireAuth = true,
        invalidateQueries = true,
        ...restOptions
    } = options;

    return useMutation({
        mutationFn: async ({ id, data }) => {
            try {
                // Create AbortController for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

                // Prepare headers with defaults and auth if required
                const requestHeaders = {
                    ...DEFAULT_HEADERS,
                    ...headers,
                    ...(requireAuth ? AUTH_CONFIG.getAuthHeaders() : {}),
                };

                const response = await fetch(`${BaseUrl}${endpoint}/${id}`, {
                    method: 'PUT',
                    headers: requestHeaders,
                    body: JSON.stringify(data),
                    signal: controller.signal,
                });
                console.log("response", response);

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                        errorData.message || `Error ${response.status}: ${response.statusText}`
                    );
                }

                return await response.json();
            } catch (error) {
                console.error(`Error updating data at ${endpoint}/${id}:`, error);
                // Handle authentication errors
                if (error.response?.status === 401 && requireAuth) {
                    AUTH_CONFIG.clearToken();
                }
                throw error;
            }
        },
        onSuccess: (data, variables, context) => {
            // Invalidate related queries to refetch data
            if (invalidateQueries) {
                queryClient.invalidateQueries({ queryKey: [endpoint] });
                queryClient.invalidateQueries({ queryKey: [`${endpoint}/${variables.id}`] });
            }
            if (onSuccess) onSuccess(data, variables, context);
        },
        onError: (error, variables, context) => {
            if (onError) onError(error, variables, context);
        },
        retry: (failureCount, error) => {
            if (failureCount >= RETRY_CONFIG.maxRetries) return false;
            return RETRY_CONFIG.shouldRetry(error);
        },
        retryDelay: (attemptIndex) => Math.min(
            attemptIndex * RETRY_CONFIG.retryDelay,
            30000 // Max delay of 30 seconds
        ),
        ...restOptions,
    });
};

/**
 * Custom hook for deleting data via API
 * @param {string} endpoint - Base API endpoint
 * @param {Object} options - Additional options for the mutation
 * @param {Object} options.headers - Custom headers
 * @param {Function} options.onSuccess - Callback function on successful mutation
 * @param {Function} options.onError - Callback function on mutation error
 * @param {boolean} options.requireAuth - Whether the request requires authentication
 * @returns {Object} Mutation result object
 */
export const useDelete = (endpoint, options = {}) => {
    const queryClient = useQueryClient();
    const {
        headers = {},
        onSuccess,
        onError,
        requireAuth = true,
        invalidateQueries = true,
        ...restOptions
    } = options;

    return useMutation({
        mutationFn: async (id) => {
            try {
                // Create AbortController for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

                // Prepare headers with defaults and auth if required
                const requestHeaders = {
                    ...DEFAULT_HEADERS,
                    ...headers,
                    ...(requireAuth ? AUTH_CONFIG.getAuthHeaders() : {}),
                };

                const response = await fetch(`${BaseUrl}${endpoint}/${id}`, {
                    method: 'DELETE',
                    headers: requestHeaders,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                        errorData.message || `Error ${response.status}: ${response.statusText}`
                    );
                }

                return await response.json();
            } catch (error) {
                console.error(`Error deleting data at ${endpoint}/${id}:`, error);
                // Handle authentication errors
                if (error.response?.status === 401 && requireAuth) {
                    AUTH_CONFIG.clearToken();
                }
                throw error;
            }
        },
        onSuccess: (data, variables, context) => {
            // Invalidate related queries to refetch data
            if (invalidateQueries) {
                queryClient.invalidateQueries({ queryKey: [endpoint] });
            }
            if (onSuccess) onSuccess(data, variables, context);
        },
        onError: (error, variables, context) => {
            if (onError) onError(error, variables, context);
        },
        retry: (failureCount, error) => {
            if (failureCount >= RETRY_CONFIG.maxRetries) return false;
            return RETRY_CONFIG.shouldRetry(error);
        },
        retryDelay: (attemptIndex) => Math.min(
            attemptIndex * RETRY_CONFIG.retryDelay,
            30000 // Max delay of 30 seconds
        ),
        ...restOptions,
    });
};

/**
 * Custom hook for fetching a single item by ID
 * @param {string} endpoint - Base API endpoint
 * @param {string|number} id - ID of the item to fetch
 * @param {Object} options - Additional options for the query
 * @returns {Object} Query result object
 */
export const useFetchById = (endpoint, id, options = {}) => {
    const { enabled = !!id, ...restOptions } = options;

    return useFetch(`${endpoint}/${id}`, {
        ...restOptions,
        enabled,
        queryKey: [`${endpoint}/${id}`],
    });
};

/**
 * Custom hook for handling authentication
 * @returns {Object} Authentication methods and state
 */
export const useAuth = () => {
    const queryClient = useQueryClient();

    // Login mutation
    const login = useMutation({
        mutationFn: async (credentials) => {
            const response = await fetch(`${BaseUrl}${API_ENDPOINTS.auth.login}`, {
                method: 'POST',
                headers: DEFAULT_HEADERS,
                body: JSON.stringify(credentials),
            });
            console.log("response", response);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Login failed: ${response.statusText}`);
            }

            const data = await response.json();
            // Store the token
            AUTH_CONFIG.setToken(data.token);

            return data;

        },
        onSuccess: () => {
            // Refetch any queries that depend on authentication
            queryClient.invalidateQueries();
        },
    });

    // Logout mutation
    const logout = useMutation({
        mutationFn: async () => {
            // If your API has a logout endpoint
            if (AUTH_CONFIG.isAuthenticated()) {
                try {
                    await fetch(`${BaseUrl}${API_ENDPOINTS.auth.logout}`, {
                        method: 'GET',
                        headers: {
                            ...DEFAULT_HEADERS,
                            ...AUTH_CONFIG.getAuthHeaders(),
                        },
                    });
                    console.log("Logout API called:", `${BaseUrl}${API_ENDPOINTS.auth.logout}`);
                } catch (error) {
                    console.error('Logout API error:', error);
                    // Continue with local logout even if API fails
                }
            }
            // Clear the token regardless of API success
            AUTH_CONFIG.clearToken();
            AUTH_CONFIG.clearUserData(); // Make sure to also clear user data
            return true;
        },
        onSuccess: () => {
            // Clear all queries from the cache
            queryClient.clear();
        },
    });

    // Register mutation
    const register = useMutation({
        mutationFn: async (userData) => {
            const response = await fetch(`${BaseUrl}${API_ENDPOINTS.auth.register}`, {
                method: 'POST',
                headers: DEFAULT_HEADERS,
                body: JSON.stringify(userData),
            });
            console.log("response", `${BaseUrl}${API_ENDPOINTS.auth.register}`);


            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Registration failed: ${response.statusText}`);
            }
            return await response.json();
        },
    });

    return {
        login,
        logout,
        register,
        isAuthenticated: AUTH_CONFIG.isAuthenticated,
        getToken: AUTH_CONFIG.getToken,
    };
};

/**
 * Custom hook for infinite query (pagination)
 * @param {string} endpoint - API endpoint to fetch data from
 * @param {Object} options - Additional options for the query
 * @returns {Object} Infinite query result object
 */
export const useInfiniteList = (endpoint, options = {}) => {
    const {
        params = {},
        pageParam = 'page',
        limitParam = 'limit',
        pageSize = 10,
        ...restOptions
    } = options;

    const queryClient = useQueryClient();

    return useQuery({
        ...restOptions,
        queryKey: [endpoint, 'infinite', params],
        queryFn: async ({ pageParam = 1 }) => {
            const url = new URL(`${BaseUrl}${endpoint}`);

            // Add all params
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, value);
                }
            });

            // Add pagination params
            url.searchParams.append(pageParam, pageParam);
            url.searchParams.append(limitParam, pageSize);

            const response = await fetch(url.toString(), {
                headers: {
                    ...DEFAULT_HEADERS,
                    ...(restOptions.requireAuth ? AUTH_CONFIG.getAuthHeaders() : {}),
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || `Error ${response.status}: ${response.statusText}`
                );
            }

            return await response.json();
        },
        getNextPageParam: (lastPage, allPages) => {
            // Implement based on your API's pagination structure
            // Example: if the API returns a 'next' page number
            return lastPage.hasMore ? allPages.length + 1 : undefined;
        },
    });
};