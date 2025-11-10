import React, { useEffect, useState, useRef } from "react";
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	useMap,
	useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import {
	TextField,
	InputAdornment,
	IconButton,
	Paper,
	Button,
	Box,
	Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

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

const humanIcon = new L.Icon({
	iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149060.png", // Simple person icon
	iconSize: [30, 30],
	iconAnchor: [15, 30],
});

const MapEvents = ({ onMapClick }) => {
	useMapEvents({
		click: (e) => {
			onMapClick(e.latlng);
		},
	});
	return null;
};

// Component to handle routing to a selected location
const MapUpdater = ({ currentPosition, destination, showRoute }) => {
	const map = useMap();
	useEffect(() => {
		if (!map) return;

		// Clear existing routes before adding a new one
		map.eachLayer((layer) => {
			if (layer instanceof L.Routing.Control) {
				map.removeControl(layer);
			}
		});

		if (showRoute && currentPosition && destination) {
			const primaryColor = getComputedStyle(
				document.documentElement
			).getPropertyValue("--primary-color");

			L.Routing.control({
				waypoints: [
					L.latLng(currentPosition[0], currentPosition[1]),
					L.latLng(destination.position[0], destination.position[1]),
				],
				lineOptions: {
					styles: [{ color: primaryColor || "#ff9800", weight: 5 }],
				},
				addWaypoints: false,
				draggableWaypoints: false,
				createMarker: () => null, // No default markers
				show: false, // hide directions box
				routeWhileDragging: false,
			}).addTo(map);

			// Fit map to the route bounds
			map.fitBounds([currentPosition, destination.position]);
		} else if (destination) {
			// If not showing route, just fly to the destination
			map.flyTo(destination.position, 13);
		}
	}, [currentPosition, destination, showRoute, map]);

	return null;
};

const Map = ({
	selectedLocation, // This can be used for initial center
	currentPosition,
	showRoute,
	onMapClick,
	activeMarker,
	onPickupSelect,
	onDropoffSelect,
	onClose,
	selectionMode,
}) => {
	const mapRef = useRef();
	const [searchTerm, setSearchTerm] = useState("");
	const [suggestions, setSuggestions] = useState([]);

	const triggerSearch = async () => {
		if (searchTerm.length > 2) {
			try {
				const response = await fetch(
					`https://nominatim.openstreetmap.org/search?format=json&q=${searchTerm}`
				);
				const data = await response.json();
				setSuggestions(data);
			} catch (error) {
				console.error("Error fetching search suggestions:", error);
				setSuggestions([]);
			}
		} else {
			setSuggestions([]);
		}
	};

	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value);
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			triggerSearch();
		}
	};

	const handleSelectSuggestion = (suggestion) => {
		const latlng = {
			lat: parseFloat(suggestion.lat),
			lng: parseFloat(suggestion.lon),
		};
		onMapClick(latlng); // This will trigger handleMapClick in parent
		setSearchTerm(suggestion.display_name);
		setSuggestions([]);

		// Pan the map to avoid the search bar
		if (mapRef.current) {
			const map = mapRef.current;
			map.flyTo([latlng.lat, latlng.lng], 13);
			setTimeout(() => map.panBy([0, -100]), 500); // Pan down slightly after flyTo animation
		}
	};

	const handlePopupSelect = () => {
		if (selectionMode === "pickup") {
			onPickupSelect(activeMarker);
		} else {
			onDropoffSelect(activeMarker);
		}
		onClose();
	};

	return (
		<MapContainer
			center={activeMarker?.position || selectedLocation?.position}
			zoom={13}
			scrollWheelZoom
			style={{ height: "100%", width: "100%" }}
			whenCreated={(map) => (mapRef.current = map)}>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
				url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
			/>

			<div
				style={{
					position: "absolute",
					top: "70px",
					right: "10px",
					zIndex: 1100,
				}}>
				<Paper
					elevation={4}
					sx={{
						backgroundColor: "rgba(0,0,0,0.6)",
						backdropFilter: "blur(5px)",
						borderRadius: "8px",
					}}>
					<TextField
						placeholder='Search for a location...'
						value={searchTerm}
						onChange={handleSearchChange}
						onKeyDown={handleKeyDown}
						variant='standard'
						sx={{
							width: "300px",
							"& .MuiInputBase-root": {
								color: "white",
								padding: "8px 12px",
							},
							"& .MuiInput-underline:before": {
								borderBottom: "none",
							},
							"& .MuiInput-underline:hover:not(.Mui-disabled):before": {
								borderBottom: "none",
							},
						}}
						InputProps={{
							endAdornment: (
								<InputAdornment position='end'>
									<IconButton onClick={triggerSearch} sx={{ color: "white" }}>
										<SearchIcon />
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
					{suggestions.length > 0 && (
						<ul
							style={{
								listStyle: "none",
								padding: 0,
								margin: 0,
								maxHeight: "200px",
								overflowY: "auto",
								color: "white",
							}}>
							{suggestions.map((suggestion) => (
								<li
									key={suggestion.place_id}
									onClick={() => handleSelectSuggestion(suggestion)}
									style={{
										padding: "10px 12px",
										cursor: "pointer",
										borderTop: "1px solid #555",
									}}>
									{suggestion.display_name}
								</li>
							))}
						</ul>
					)}
				</Paper>
			</div>

			{activeMarker && (
				<Marker
					position={activeMarker.position}
					icon={
						activeMarker.name === "Your Location" ? humanIcon : customMarker
					}>
					<Popup>
						<Box sx={{ textAlign: "center" }}>
							<Typography variant='body2' sx={{ mb: 1 }}>
								{activeMarker.name}
							</Typography>
							<Button
								variant='contained'
								size='small'
								onClick={handlePopupSelect}>
								Select
							</Button>
						</Box>
					</Popup>
				</Marker>
			)}

			<MapUpdater
				currentPosition={currentPosition}
				destination={activeMarker}
				showRoute={showRoute}
			/>
			<MapEvents onMapClick={onMapClick} />
		</MapContainer>
	);
};

export default Map;
