import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import dayjs from "dayjs";

const IntroFormContext = createContext();

export const useIntroForm = () => useContext(IntroFormContext);

export const IntroFormProvider = ({ children }) => {
	const [isLoading, setIsLoading] = useState(false);

	const [formValues, setFormValues] = useState({
		pickupLocation: null,
		dropSameAsPickup: true,
		dropoffLocation: null,
		pickupDate: null,
		pickupTime: null,
		dropDate: null,
		dropTime: null,
	});

	const [expanded, setExpanded] = useState(false);

	const resetForm = useCallback(() => {
		setFormValues({
			pickupLocation: null,
			dropSameAsPickup: true,
			dropoffLocation: null,
			pickupDate: null,
			pickupTime: null,
			dropDate: null,
			dropTime: null,
		});
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
