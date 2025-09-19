import React, { useEffect, useState } from "react";
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
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import DirectionsIcon from "@mui/icons-material/Directions";

import VideoBackground1 from "../../common/Background1";
import { theme } from "../Config/theme";
import { useNavigate } from "react-router";

// Custom blue marker
const customMarker = new L.Icon({
	iconUrl:
		"https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

// Office locations
const locations = [
	{ name: "Mandalay office", position: [21.869075, 96.105194] },
	{ name: "Yangon office", position: [16.930086, 96.155242] },
];

const defaultLocation = locations[0];

// Component to handle routing to a selected location
const MapUpdater = ({ currentPosition, selectedLocation, showRoute }) => {
	const map = useMap();

	useEffect(() => {
		// Remove any existing routing control
		map.eachLayer((layer) => {
			if (layer instanceof L.Routing.Control) map.removeControl(layer);
		});

		if (showRoute && currentPosition && selectedLocation) {
			L.Routing.control({
				waypoints: [
					L.latLng(currentPosition[0], currentPosition[1]),
					L.latLng(selectedLocation.position[0], selectedLocation.position[1]),
				],
				lineOptions: { styles: [{ color: "#00F5D4", weight: 5 }] },
				addWaypoints: false,
				draggableWaypoints: false,
				createMarker: () => null,
				show: false, // hide directions box
				routeWhileDragging: false,
			}).addTo(map);

			map.fitBounds([currentPosition, selectedLocation.position]);
		} else if (selectedLocation) {
			map.flyTo(selectedLocation.position, 13);
		}
	}, [currentPosition, selectedLocation, showRoute, map]);

	return null;
};

const OurLocationsPage = () => {
	const [selectedLocation, setSelectedLocation] = useState(defaultLocation);
	const [currentPosition, setCurrentPosition] = useState(null);
	const [showRoute, setShowRoute] = useState(false);
	const navigate = useNavigate();

	const mapRef = React.useRef();

	// Request location every time page loads
	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					setCurrentPosition([pos.coords.latitude, pos.coords.longitude]);
				},
				(err) => console.warn("Geolocation permission denied", err)
			);
		}
	}, []);

	const getCurrentLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					const coords = [pos.coords.latitude, pos.coords.longitude];
					setCurrentPosition(coords);
					if (mapRef.current) mapRef.current.flyTo(coords, 13);
				},
				(err) => console.warn("Geolocation not available", err)
			);
		}
	};

	return (
		<ThemeProvider theme={theme}>
			<Box sx={{ position: "relative", width: "100%", height: "100vh" }}>
				<VideoBackground1 videoSrc='/bg-2.mp4' />

				{/* MAP */}
				<MapContainer
					center={selectedLocation.position}
					zoom={13}
					scrollWheelZoom
					style={{ height: "100%", width: "100%" }}
					whenCreated={(map) => (mapRef.current = map)}>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
						url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
					/>

					{locations.map((loc) => (
						<Marker
							key={loc.name}
							position={loc.position}
							icon={customMarker}
							eventHandlers={{
								click: () => {
									setSelectedLocation(loc);
									setShowRoute(false);
								},
							}}>
							<Popup>{loc.name}</Popup>
						</Marker>
					))}

					{currentPosition && (
						<Marker
							position={currentPosition}
							icon={L.icon({
								iconUrl:
									"https://cdn-icons-png.flaticon.com/512/149/149060.png",
								iconSize: [30, 30],
								iconAnchor: [15, 30],
							})}>
							<Popup>Your Location</Popup>
						</Marker>
					)}

					<MapUpdater
						currentPosition={currentPosition}
						selectedLocation={selectedLocation}
						showRoute={showRoute}
					/>
				</MapContainer>

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
