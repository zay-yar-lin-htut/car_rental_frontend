import React, { createContext, useState, useContext } from "react";

const IntroFormContext = createContext();

export const useIntroForm = () => useContext(IntroFormContext);

export const IntroFormProvider = ({ children }) => {
	const [formValues, setFormValues] = useState({
		pickupLocation: "",
		dropSameAsPickup: true,
		dropoffLocation: "",
		pickupDate: null,
		pickupTime: null,
		dropDate: null,
		dropTime: null,
	});

	const [expanded, setExpanded] = useState(false);

	const value = {
		formValues,
		setFormValues,
		expanded,
		setExpanded,
	};

	return (
		<IntroFormContext.Provider value={value}>
			{children}
		</IntroFormContext.Provider>
	);
};
