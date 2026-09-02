import { BaseUrl } from './BaseUrl';
import {
    DEFAULT_HEADERS,
    AUTH_CONFIG,
    API_ENDPOINTS,
    ERROR_CONFIG,
} from './Configuration';


export const createDataServices = () => {

    const Login = async (data, serviceName) => {
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
                error.response = { status: response.status };
                throw error;
            }

            return await response.json();
        } catch (error) {
            const errorMessage = ERROR_CONFIG.getErrorMessage(error);
            console.error("Error in Login:", errorMessage);
            throw new Error(errorMessage);
        }
    }
    const Register = async (data, serviceName) => {
        try {
            const response = await fetch(BaseUrl + serviceName, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            let responseData;
            try {
                responseData = await response.json();
            } catch {
                responseData = { message: await response.text() || ERROR_CONFIG.defaultErrorMessages.unknown };
            }

            if (!response.ok) {
                const errorMessage = responseData.message || ERROR_CONFIG.getErrorMessage({ response: { status: response.status } });
                throw new Error(errorMessage);
            }

            return responseData;
        } catch (error) {
            console.error("Error in Register:", error.message);
            throw error;
        }
    };

    const Logout = async (serviceName) => {
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
                error.response = { status: response.status };
                throw error;
            }

            return await response.json();
        } catch (error) {
            const errorMessage = ERROR_CONFIG.getErrorMessage(error);
            console.error("Error in Logout:", errorMessage);
            throw new Error(errorMessage);
        }
    };

    const retrievePOST = async (data, serviceName) => {
        try {
            const response = await fetch(BaseUrl + serviceName, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + AUTH_CONFIG.getToken(),
                },
                body: JSON.stringify(data),
            });

            let responseData;
            try {
                responseData = await response.json();
            } catch {
                responseData = { message: await response.text() || ERROR_CONFIG.defaultErrorMessages.unknown };
            }

            if (!response.ok) {
                const errorMessage = responseData.message || ERROR_CONFIG.getErrorMessage({ response: { status: response.status } });
                throw new Error(errorMessage);
            }

            return responseData;
        } catch (error) {
            console.error("Error in retrievePOST:", error.message);
            throw error;
        }
    };

    const retrieve = async (serviceName, serviceAction) => {
        try {
            const response = await fetch(BaseUrl + serviceName + serviceAction, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + AUTH_CONFIG.getToken(),
                },
            });

            let responseData;
            try {
                responseData = await response.json();
            } catch {
                responseData = { message: await response.text() || ERROR_CONFIG.defaultErrorMessages.unknown };
            }

            if (!response.ok) {
                const errorMessage = responseData.message || ERROR_CONFIG.getErrorMessage({ response: { status: response.status } });
                throw new Error(errorMessage);
            }

            return responseData;
        } catch (error) {
            console.error("Error in retrieveGET:", error.message);
            throw error;
        }
    };

    const retrieveImage = (imageUrl) => {
        // Disabled proxy image API - return original URL directly
        return imageUrl;
    };

    const retrievePOSTFormData = async (data, serviceName) => {
        try {
            const response = await fetch(BaseUrl + serviceName, {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + AUTH_CONFIG.getToken(),
                },
                body: data,
            });

            let responseData;
            try {
                responseData = await response.json();
            } catch {
                responseData = { message: await response.text() || ERROR_CONFIG.defaultErrorMessages.unknown };
            }

            if (!response.ok) {
                const errorMessage = responseData.message || ERROR_CONFIG.getErrorMessage({ response: { status: response.status } });
                throw new Error(errorMessage);
            }

            return responseData;
        } catch (error) {
            console.error("Error in retrievePOSTFormData:", error.message);
            throw error;
        }
    };

    const retrievePUT = async (data, serviceName) => {
        try {
            const response = await fetch(BaseUrl + serviceName, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + AUTH_CONFIG.getToken(),
                },
                body: JSON.stringify(data),
            });

            let responseData;
            try {
                responseData = await response.json();
            } catch {
                responseData = { message: await response.text() || ERROR_CONFIG.defaultErrorMessages.unknown };
            }

            if (!response.ok) {
                const errorMessage = responseData.message || ERROR_CONFIG.getErrorMessage({ response: { status: response.status } });
                throw new Error(errorMessage);
            }

            return responseData;
        } catch (error) {
            console.error("Error in retrievePUT:", error.message);
            throw error;
        }
    };

    const retrieveDELETE = async (serviceName, serviceAction) => {
        try {
            const response = await fetch(BaseUrl + serviceName + serviceAction, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + AUTH_CONFIG.getToken(),
                },
            });

            let responseData;
            try {
                responseData = await response.json();
            } catch {
                responseData = { message: await response.text() || ERROR_CONFIG.defaultErrorMessages.unknown };
            }

            if (!response.ok) {
                const errorMessage = responseData.message || ERROR_CONFIG.getErrorMessage({ response: { status: response.status } });
                throw new Error(errorMessage);
            }

            return responseData;
        } catch (error) {
            console.error("Error in retrieveDELETE:", error.message);
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






