import {
	createContext,
	useContext,
	useState,
	type ReactNode,
} from "react";
import { Snackbar, Alert, type AlertColor } from "@mui/material";

type SnackbarSeverity = "success" | "info" | "warning" | "error";

interface SnackbarContextValue {
	showSnackbar: (message: string, severity?: SnackbarSeverity) => void;
}

export const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function SnackbarProvider({ children }: { children: ReactNode }) {
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: SnackbarSeverity;
	}>({
		open: false,
		message: "",
		severity: "info",
	});

	const showSnackbar = (message: string, severity: SnackbarSeverity = "error") => {
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
					severity={snackbar.severity as AlertColor}
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
