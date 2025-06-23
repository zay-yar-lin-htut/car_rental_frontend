import { BaseUrl } from './BaseUrl';
import {
    DEFAULT_HEADERS,
    AUTH_CONFIG,
    API_ENDPOINTS,
    ERROR_CONFIG,
} from './Configuration';


export const createDataServices = () => {

    const Login = async (data, serviceName) => {
        console.log(BaseUrl + serviceName);
        try {
            const response = await fetch(BaseUrl + serviceName, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + AUTH_CONFIG.getToken(),

                },
                body: JSON.stringify(data),
            });
            console.log("data", JSON.stringify(data));

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
        console.log(BaseUrl + serviceName);
        try {
            const response = await fetch(BaseUrl + serviceName, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            console.log("data", JSON.stringify(data));

            if (!response.ok) {
                const error = new Error();
                error.response = { status: response.status };
                throw error;
            }

            return await response.json();
        } catch (error) {
            const errorMessage = ERROR_CONFIG.getErrorMessage(error);
            console.error("Error in Register:", errorMessage);
            throw new Error(errorMessage);
        }
    };

    const Logout = async (serviceName) => {
        console.log(BaseUrl + serviceName);
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
        console.log(BaseUrl + serviceName);
        try {
            const response = await fetch(BaseUrl + serviceName, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + AUTH_CONFIG.getToken(),
                },
                body: JSON.stringify(data),
            });
            console.log("data", JSON.stringify(data));

            if (!response.ok) {
                const error = new Error();
                error.response = { status: response.status };
                throw error;
            }

            return await response.json();
        } catch (error) {
            const errorMessage = ERROR_CONFIG.getErrorMessage(error);
            console.error("Error in retrievePOST:", errorMessage);
            throw new Error(errorMessage);
        }
    };

    const retrieve = async (serviceName, serviceAction) => {
        console.log(BaseUrl + serviceName + serviceAction);
        try {
            const response = await fetch(BaseUrl + serviceName + serviceAction, {
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
            console.error("Error in retrieveGET:", errorMessage);
            throw new Error(errorMessage);
        }
    };

    const retrievePOSTFormData = async (data, serviceName) => {
        console.log(BaseUrl + serviceName);
        try {
            const response = await fetch(BaseUrl + serviceName, {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + AUTH_CONFIG.getToken(),
                },
                body: data,
            });

            if (!response.ok) {
                const error = new Error();
                error.response = { status: response.status };
                throw error;
            }

            return await response.json();
        } catch (error) {
            const errorMessage = ERROR_CONFIG.getErrorMessage(error);
            console.error("Error in retrievePOSTFormData:", errorMessage);
            throw new Error(errorMessage);
        }
    };

    const retrievePUT = async (data, serviceName) => {
        console.log(BaseUrl + serviceName);
        console.log(JSON.stringify(data));
        try {
            const response = await fetch(BaseUrl + serviceName, {
                method: "PUT",
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
            console.error("Error in retrievePUT:", errorMessage);
            throw new Error(errorMessage);
        }
    };

    const retrieveDELETE = async (serviceName, serviceAction) => {
        console.log(BaseUrl + serviceName + serviceAction);
        try {
            const response = await fetch(BaseUrl + serviceName + serviceAction, {
                method: "DELETE",
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
            console.error("Error in retrieveDELETE:", errorMessage);
            throw new Error(errorMessage);
        }
    };

    return {
        retrievePOST,
        retrieve,
        retrievePOSTFormData,
        retrievePUT,
        retrieveDELETE,
        Register,
        Login,
        Logout
    };
};






