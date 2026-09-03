import React, { createContext, useState, useEffect, useContext, useRef, type ReactNode } from "react";
import { createDataServices } from "../services/DataServices";
import { API_ENDPOINTS } from "../services/Configuration";
import { useSnackbar } from "./ErrorMessage";
import type { CarType } from "../types";

interface CarTypeContextValue {
    carTypes: CarType[];
    loading: boolean;
    error: string | null;
    refreshCarTypes: () => Promise<void>;
}

const CarTypeContext = createContext<CarTypeContextValue | null>(null);
const dataServices = createDataServices();
export const CarTypeProvider = ({ children }: { children: ReactNode }) => {
	const [carTypes, setCarTypes] = useState<CarType[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
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
                    setCarTypes((response.data as CarType[]) || []);
                    setError(null);
                } catch (err) {
                    const errorMessage = (err as Error).message || "Failed to fetch car types.";
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
			setCarTypes((response.data as CarType[]) || []);
			setError(null);
		} catch (err) {
			const errorMessage = (err as Error).message || "Failed to refetch car types.";
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

export const useCarType = (): CarTypeContextValue => {
    const context = useContext(CarTypeContext);
    if (!context) {
        throw new Error("useCarType must be used within a CarTypeProvider");
    }
    return context;
};
