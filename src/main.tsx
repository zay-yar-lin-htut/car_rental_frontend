import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import App from "./App.tsx";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<App />
		</LocalizationProvider>
	</StrictMode>
);
