import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import { createDataServices } from "../services/DataServices";
import { API_ENDPOINTS } from "../services/Configuration";
import { useSnackbar } from "./ErrorMessage";

const CarTypeContext = createContext();
const dataServices = createDataServices();
export const CarTypeProvider = ({ children }) => {
	const [carTypes, setCarTypes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { showSnackbar } = useSnackbar();

    const effectRan = useRef(false);

	useEffect(() => {
        if (effectRan.current === false) {
            const fetchCarTypes = async () => {
                try {
                    setLoading(true);
                    const response = await dataServices.retrieve(
                        API_ENDPOINTS.carTypes.base,
                        API_ENDPOINTS.carTypes.getAll
                    );
                    setCarTypes(response.data || []);
                    setError(null);
                } catch (err) {
                    const errorMessage = err.message || "Failed to fetch car types.";
                    setError(errorMessage);
                    showSnackbar(errorMessage, "error");
                } finally {
                    setLoading(false);
                }
            };

            fetchCarTypes();

            return () => {
                effectRan.current = true;
            };
        }
	}, []);

	const refreshCarTypes = async () => {
		// Function to manually refresh the car types list
		setLoading(true);
		try {
			const response = await dataServices.retrieve(
				API_ENDPOINTS.carTypes.base,
				API_ENDPOINTS.carTypes.getAll
			);
			setCarTypes(response.data || []);
			setError(null);
		} catch (err) {
			const errorMessage = err.message || "Failed to refetch car types.";
			setError(errorMessage);
			showSnackbar(errorMessage, "error");
		}
		setLoading(false);
	};

	return (
		<CarTypeContext.Provider
			value={{ carTypes, loading, error, refreshCarTypes }}>
			{children}
		</CarTypeContext.Provider>
	);
};

export const useCarType = () => useContext(CarTypeContext);
