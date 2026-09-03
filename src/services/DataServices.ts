import { BaseUrl } from './BaseUrl';
import {
    AUTH_CONFIG,
    ERROR_CONFIG,
} from './Configuration';
import type { ApiResponse, AuthResponse } from '../types';

type JsonResponse<T = unknown> = ApiResponse<T> & Record<string, unknown>;

export const createDataServices = () => {

    const Login = async (data: unknown, serviceName: string): Promise<AuthResponse> => {
        try {
            const response = await fetch(BaseUrl + serviceName, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + AUTH_CONFIG.getToken(),
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = new Error();
                (error as Error & { response?: { status: number } }).response = { status: response.status };
                throw error;
            }

            return await response.json() as AuthResponse;
        } catch (error) {
            const errorMessage = ERROR_CONFIG.getErrorMessage(error as { response?: { status?: number }; message?: string });
            console.error("Error in Login:", errorMessage);
            throw new Error(errorMessage);
        }
    }

    const Register = async <T = unknown>(data: unknown, serviceName: string): Promise<JsonResponse<T>> => {
        try {
            const response = await fetch(BaseUrl + serviceName, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            let responseData: JsonResponse<T> = { success: false };
            try {
                responseData = await response.json();
            } catch {
                responseData = { success: false, message: await response.text() || ERROR_CONFIG.defaultErrorMessages.unknown };
            }

            if (!response.ok) {
                const errorMessage = responseData.message || ERROR_CONFIG.getErrorMessage({ response: { status: response.status } });
                throw new Error(errorMessage);
            }

            return responseData;
        } catch (error) {
            console.error("Error in Register:", (error as Error).message);
            throw error;
        }
    };

    const Logout = async <T = unknown>(serviceName: string): Promise<JsonResponse<T>> => {
        try {
            const response = await fetch(BaseUrl + serviceName, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + AUTH_CONFIG.getToken(),
                },
            });

            if (!response.ok) {
                const error = new Error();
                (error as Error & { response?: { status: number } }).response = { status: response.status };
                throw error;
            }

            return await response.json() as JsonResponse<T>;
        } catch (error) {
            const errorMessage = ERROR_CONFIG.getErrorMessage(error as { response?: { status?: number }; message?: string });
            console.error("Error in Logout:", errorMessage);
            throw new Error(errorMessage);
        }
    };

    const retrievePOST = async <T = unknown>(data: unknown, serviceName: string): Promise<JsonResponse<T>> => {
        try {
            const response = await fetch(BaseUrl + serviceName, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + AUTH_CONFIG.getToken(),
                },
                body: JSON.stringify(data),
            });

            let responseData: JsonResponse<T> = { success: false };
            try {
                responseData = await response.json();
            } catch {
                responseData = { success: false, message: await response.text() || ERROR_CONFIG.defaultErrorMessages.unknown };
            }

            if (!response.ok) {
                const errorMessage = responseData.message || ERROR_CONFIG.getErrorMessage({ response: { status: response.status } });
                throw new Error(errorMessage);
            }

            return responseData;
        } catch (error) {
            console.error("Error in retrievePOST:", (error as Error).message);
            throw error;
        }
    };

    const retrieve = async <T = unknown>(serviceName: string, serviceAction: string = ""): Promise<JsonResponse<T>> => {
        try {
            const response = await fetch(BaseUrl + serviceName + serviceAction, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + AUTH_CONFIG.getToken(),
                },
            });

            let responseData: JsonResponse<T> = { success: false };
            try {
                responseData = await response.json();
            } catch {
                responseData = { success: false, message: await response.text() || ERROR_CONFIG.defaultErrorMessages.unknown };
            }

            if (!response.ok) {
                const errorMessage = responseData.message || ERROR_CONFIG.getErrorMessage({ response: { status: response.status } });
                throw new Error(errorMessage);
            }

            return responseData;
        } catch (error) {
            console.error("Error in retrieveGET:", (error as Error).message);
            throw error;
        }
    };

    const retrieveImage = (imageUrl: string): string => {
        // Disabled proxy image API - return original URL directly
        return imageUrl;
    };

    const retrievePOSTFormData = async <T = unknown>(data: FormData, serviceName: string): Promise<JsonResponse<T>> => {
        try {
            const response = await fetch(BaseUrl + serviceName, {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + AUTH_CONFIG.getToken(),
                },
                body: data,
            });

            let responseData: JsonResponse<T> = { success: false };
            try {
                responseData = await response.json();
            } catch {
                responseData = { success: false, message: await response.text() || ERROR_CONFIG.defaultErrorMessages.unknown };
            }

            if (!response.ok) {
                const errorMessage = responseData.message || ERROR_CONFIG.getErrorMessage({ response: { status: response.status } });
                throw new Error(errorMessage);
            }

            return responseData;
        } catch (error) {
            console.error("Error in retrievePOSTFormData:", (error as Error).message);
            throw error;
        }
    };

    const retrievePUT = async <T = unknown>(data: unknown, serviceName: string): Promise<JsonResponse<T>> => {
        try {
            const response = await fetch(BaseUrl + serviceName, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + AUTH_CONFIG.getToken(),
                },
                body: JSON.stringify(data),
            });

            let responseData: JsonResponse<T> = { success: false };
            try {
                responseData = await response.json();
            } catch {
                responseData = { success: false, message: await response.text() || ERROR_CONFIG.defaultErrorMessages.unknown };
            }

            if (!response.ok) {
                const errorMessage = responseData.message || ERROR_CONFIG.getErrorMessage({ response: { status: response.status } });
                throw new Error(errorMessage);
            }

            return responseData;
        } catch (error) {
            console.error("Error in retrievePUT:", (error as Error).message);
            throw error;
        }
    };

    const retrieveDELETE = async <T = unknown>(serviceName: string, serviceAction: string = ""): Promise<JsonResponse<T>> => {
        try {
            const response = await fetch(BaseUrl + serviceName + serviceAction, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + AUTH_CONFIG.getToken(),
                },
            });

            let responseData: JsonResponse<T> = { success: false };
            try {
                responseData = await response.json();
            } catch {
                responseData = { success: false, message: await response.text() || ERROR_CONFIG.defaultErrorMessages.unknown };
            }

            if (!response.ok) {
                const errorMessage = responseData.message || ERROR_CONFIG.getErrorMessage({ response: { status: response.status } });
                throw new Error(errorMessage);
            }

            return responseData;
        } catch (error) {
            console.error("Error in retrieveDELETE:", (error as Error).message);
            throw error;
        }
    };

    return {
        retrievePOST,
        retrieve,
        retrieveImage,
        retrievePOSTFormData,
        retrievePUT,
        retrieveDELETE,
        Register,
        Login,
        Logout
    };
};
