import React, { useEffect, useState, lazy, Suspense } from "react";
import {
	Box,
	Typography,
	Paper,
	List,
	ListItemText,
	ListItemButton,
	Button,
	ThemeProvider,
	IconButton,
	Tooltip,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import DirectionsIcon from "@mui/icons-material/Directions";

import VideoBackground1 from "../../common/background1";
import { theme } from "../Config/theme";
import { useNavigate } from "react-router";

const Map = lazy(() => import("./Map"));

// Office locations
const locations = [
	{ name: "Mandalay office", position: [21.869075, 96.105194] },
	{ name: "Yangon office", position: [16.930086, 96.155242] },
];

const defaultLocation = locations[0];

const OurLocationsPage = () => {
	const [selectedLocation, setSelectedLocation] = useState(defaultLocation);
	const [currentPosition, setCurrentPosition] = useState(null);
	const [showRoute, setShowRoute] = useState(false);
	const navigate = useNavigate();

	const mapRef = React.useRef();

	// Request location every time page loads
	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((pos) => {
				setCurrentPosition([pos.coords.latitude, pos.coords.longitude]);
			});
		}
	}, []);

	const getCurrentLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((pos) => {
				const coords = [pos.coords.latitude, pos.coords.longitude];
				setCurrentPosition(coords);
				if (mapRef.current) mapRef.current.flyTo(coords, 13);
			});
		}
	};

	return (
		<ThemeProvider theme={theme}>
			<Box sx={{ position: "relative", width: "100%", height: "100vh" }}>
				<VideoBackground1 videoSrc='/bg-2.mp4' />

				{/* MAP */}
				<Suspense fallback={<div>Loading Map...</div>}>
					<Map
						selectedLocation={selectedLocation}
						currentPosition={currentPosition}
						showRoute={showRoute}
						locations={locations}
					/>
				</Suspense>

				{/* Sidebar */}
				<Paper
					elevation={12}
					sx={{
						position: { xs: "fixed", md: "absolute" },
						bottom: { xs: 0, md: "auto" },
						top: { xs: "auto", md: 40 },
						left: { xs: 0, md: 40 },
						width: { xs: "100%", md: 340 },
						height: { xs: "40%", md: "80%" },
						display: "flex",
						flexDirection: "column",
						bgcolor: "background.paper",
						borderRadius: { xs: "20px 20px 0 0", md: 4 },
						border: "1px solid rgba(255,255,255,0.12)",
						zIndex: 1000,
						overflow: "hidden",
						pointerEvents: "auto",
					}}>
					<Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
						<Typography
							variant='h5'
							fontWeight={800}
							sx={{ fontFamily: "'Orbitron', sans-serif" }}>
							Our Locations
						</Typography>
					</Box>

					<Box sx={{ flex: 1, overflowY: "auto" }}>
						<List>
							{locations.map((loc) => (
								<ListItemButton
									key={loc.name}
									selected={selectedLocation.name === loc.name}
									onClick={() => {
										setSelectedLocation(loc);
										setShowRoute(false);
									}}>
									<ListItemText primary={loc.name} />
								</ListItemButton>
							))}
						</List>
					</Box>

					<Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
						<Button
							variant='contained'
							color='primary'
							fullWidth
							onClick={() => navigate("/")}
							sx={{
								py: 1.2,
								fontFamily: "'Orbitron', sans-serif",
								fontWeight: "bold",
								fontSize: "1rem",
							}}>
							Back to Home
						</Button>
					</Box>
				</Paper>

				{/* Floating buttons */}
				<Box
					sx={{
						position: "fixed",
						bottom: 20,
						right: 20,
						display: "flex",
						flexDirection: "column",
						gap: 2,
						zIndex: 1500,
					}}>
					<Tooltip title='Get Current Location'>
						<IconButton
							color='primary'
							sx={{ bgcolor: "white" }}
							onClick={getCurrentLocation}>
							<MyLocationIcon />
						</IconButton>
					</Tooltip>

					<Tooltip title='Show Directions'>
						<IconButton
							color='primary'
							sx={{ bgcolor: "white" }}
							onClick={() => setShowRoute(true)}
							disabled={!currentPosition}>
							<DirectionsIcon />
						</IconButton>
					</Tooltip>
				</Box>
			</Box>
		</ThemeProvider>
	);
};

export default OurLocationsPage;
