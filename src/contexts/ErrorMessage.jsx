import { createContext, useContext, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

export const SnackbarContext = createContext();

export function SnackbarProvider({ children }) {
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: "",
		severity: "info",
	});

	const showSnackbar = (message, severity = "error") => {
		setSnackbar({ open: true, message, severity });
	};

	const handleClose = () => {
		setSnackbar((prev) => ({ ...prev, open: false }));
	};

	return (
		<SnackbarContext.Provider value={{ showSnackbar }}>
			{children}
			<Snackbar
				open={snackbar.open}
				autoHideDuration={3000}
				onClose={handleClose}
				anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
				<Alert
					onClose={handleClose}
					severity={snackbar.severity}
					sx={{ width: "100%" }}>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</SnackbarContext.Provider>
	);
}
export const useSnackbar = () => {
	const context = useContext(SnackbarContext);
	if (!context) {
		throw new Error("useSnackbar must be used within a SnackbarProvider");
	}
	return context;
};
