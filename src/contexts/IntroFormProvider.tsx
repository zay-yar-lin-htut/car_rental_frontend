import React, { createContext, useState, useContext, useCallback, type ReactNode, type Dispatch, type SetStateAction } from "react";
import type { Dayjs } from "dayjs";

export interface FormLocationValue {
    lat?: number;
    lng?: number;
    label?: string;
    [key: string]: unknown;
}

export interface SelectedVehicle {
    car_id: number;
    car_image_url?: string;
    model?: string;
    type_name?: string;
    car_type?: string;
    description?: string;
    license_plate?: string;
    price_per_hour?: number;
    price_per_day?: number;
    number_of_seats?: number;
    luggage_capacity?: number;
    transmission?: string;
    fuel_type?: string;
    total_price?: number;
    [key: string]: unknown;
}

export interface IntroFormValues {
    pickupLocation: FormLocationValue | null;
    dropSameAsPickup: boolean;
    dropoffLocation: FormLocationValue | null;
    pickupDate: Dayjs | null;
    pickupTime: Dayjs | null;
    dropDate: Dayjs | null;
    dropTime: Dayjs | null;
    vehicleType: SelectedVehicle | null;
    [key: string]: unknown;
}

interface IntroFormContextValue {
    formValues: IntroFormValues;
    setFormValues: Dispatch<SetStateAction<IntroFormValues>>;
    expanded: boolean;
    setExpanded: Dispatch<SetStateAction<boolean>>;
    isLoading: boolean;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    resetForm: () => void;
}

const emptyForm: IntroFormValues = {
    pickupLocation: null,
    dropSameAsPickup: true,
    dropoffLocation: null,
    pickupDate: null,
    pickupTime: null,
    dropDate: null,
    dropTime: null,
    vehicleType: null,
};

const IntroFormContext = createContext<IntroFormContextValue | null>(null);

export const useIntroForm = (): IntroFormContextValue => {
    const context = useContext(IntroFormContext);
    if (!context) {
        throw new Error("useIntroForm must be used within an IntroFormProvider");
    }
    return context;
};

export const IntroFormProvider = ({ children }: { children: ReactNode }) => {
	const [isLoading, setIsLoading] = useState(false);

	const [formValues, setFormValues] = useState<IntroFormValues>({ ...emptyForm });

	const [expanded, setExpanded] = useState(false);

	const resetForm = useCallback(() => {
		setFormValues({ ...emptyForm });
		setExpanded(false);
	}, []);

	const value = {
		formValues,
		setFormValues,
		expanded,
		setExpanded,
		isLoading,
		setIsLoading,
		resetForm,
	};

	return (
		<IntroFormContext.Provider value={value}>
			{children}
		</IntroFormContext.Provider>
	);
};
