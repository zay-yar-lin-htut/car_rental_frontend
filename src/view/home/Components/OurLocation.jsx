import React, { useEffect, useState, lazy, Suspense } from "react";
import {
	Box,
	Typography,
	Paper,
	List,
	ListItemText,
	ListItemButton,
	Button,
	IconButton,
	Tooltip,
	Dialog,
	DialogContent,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import DirectionsIcon from "@mui/icons-material/Directions";
import CloseIcon from "@mui/icons-material/Close";

const Map = lazy(() => import("./Map"));

// Office locations
const locations = [
	{ name: "Mandalay office", position: [21.869075, 96.105194] },
	{ name: "Yangon office", position: [16.930086, 96.155242] },
];

const defaultLocation = locations[0];

const OurLocationsPage = ({
	open,
	onClose,
	onPickupSelect,
	onDropoffSelect,
	editingMode,
}) => {
	const [selectedLocation, setSelectedLocation] = useState(defaultLocation);
	const [currentPosition, setCurrentPosition] = useState(null);
	const [showRoute, setShowRoute] = useState(false);
	const [selectionMode, setSelectionMode] = useState("pickup");
	const [activeMarker, setActiveMarker] = useState({
		position: defaultLocation.position,
		name: defaultLocation.name,
	});

	const mapRef = React.useRef();

	useEffect(() => {
		if (open) {
			setSelectionMode(editingMode);
			// Set the initial marker to the default office location when dialog opens
			setActiveMarker({
				position: defaultLocation.position,
				name: defaultLocation.name,
			});
		}
	}, [open, editingMode]);

	const getCurrentLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((pos) => {
				const coords = [pos.coords.latitude, pos.coords.longitude];
				setCurrentPosition(coords);
				setActiveMarker({ position: coords, name: "Your Location" });
				if (mapRef.current) mapRef.current.flyTo(coords, 13);
			});
		}
	};

	const handleMapClick = async (latlng) => {
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
			);
			const data = await response.json();
			const location = {
				position: [latlng.lat, latlng.lng],
				name: data.display_name || "Selected Location",
			};
			setActiveMarker(location);
			setSelectedLocation(null); // Deselect any office
		} catch (error) {
			console.error("Error fetching location name:", error);
		}
	};

	const handleOfficeSelect = (loc) => {
		setSelectedLocation(loc);
		setShowRoute(false);
		setActiveMarker({ position: loc.position, name: loc.name });
	};

	const handleConfirmSelection = () => {
		if (activeMarker) {
			if (selectionMode === "pickup") {
				onPickupSelect(activeMarker);
			} else {
				onDropoffSelect(activeMarker);
			}
		}
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth='lg'
			fullWidth
			PaperProps={{
				sx: {
					width: "100%",
					height: "85vh",
					backgroundColor: "rgba(0,0,0,0.5)",
					backdropFilter: "blur(10px)",
				},
			}}>
			<DialogContent sx={{ p: 0, height: "100%" }}>
				<Box sx={{ position: "relative", width: "100%", height: "100%" }}>
					<IconButton
						aria-label='close'
						onClick={onClose}
						sx={{
							position: "absolute",
							right: 8,
							top: 8,
							color: "white",
							backgroundColor: "rgba(0,0,0,0.5)",
							"&:hover": {
								backgroundColor: "rgba(0,0,0,0.7)",
							},
							zIndex: 1200, // Ensure it's above other elements
						}}>
						<CloseIcon />
					</IconButton>
					{/* MAP */}
					<Suspense fallback={<div>Loading Map...</div>}>
						<Map
							selectedLocation={selectedLocation}
							currentPosition={currentPosition}
							showRoute={showRoute}
							onMapClick={handleMapClick}
							activeMarker={activeMarker}
							onPickupSelect={onPickupSelect}
							onDropoffSelect={onDropoffSelect}
							onClose={onClose}
							selectionMode={selectionMode}
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
							backgroundColor: "rgba(0,0,0,0.5)",
							backdropFilter: "blur(10px)",
							borderRadius: { xs: "20px 20px 0 0", md: 4 },
							border: "none",
							zIndex: 1000,
							overflow: "hidden",
							pointerEvents: "auto",
						}}>
						<Box sx={{ p: 3 }}>
							<Typography
								variant='h5'
								fontWeight={800}
								sx={{ fontFamily: "'Orbitron', sans-serif", color: "white" }}>
								Our Locations
							</Typography>{" "}
						</Box>

						<Box sx={{ flex: 1, overflowY: "auto" }}>
							<List>
								{locations.map((loc) => (
									<ListItemButton
										key={loc.name}
										selected={selectedLocation?.name === loc.name}
										onClick={() => handleOfficeSelect(loc)}
										sx={{
											"&.Mui-selected": {
												backgroundColor: "rgba(255, 255, 255, 0.2)",
											},
											"&:hover": {
												backgroundColor: "rgba(255, 255, 255, 0.1)",
											},
										}}>
										<ListItemText
											primary={loc.name}
											sx={{ color: "white" }}
										/>{" "}
									</ListItemButton>
								))}
							</List>
						</Box>

						<Box sx={{ p: 2 }}>
							<Button
								variant='contained'
								color='primary'
								fullWidth
								onClick={handleConfirmSelection}
								sx={{
									py: 1.2,
									fontFamily: "'Orbitron', sans-serif",
									fontWeight: "bold",
									fontSize: "1rem",
									backgroundColor: "white",
									color: "black",
									"&:hover": {
										backgroundColor: "white",
										color: "black",
									},
								}}>
								Select This Location
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
								color='inherit'
								sx={{
									bgcolor: "rgba(0,0,0,0.5)",
									color: "white",
									"&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
								}}
								onClick={getCurrentLocation}>
								<MyLocationIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title='Show Directions'>
							<IconButton
								color='inherit'
								sx={{
									bgcolor: "rgba(0,0,0,0.5)",
									color: "white",
									"&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
								}}
								onClick={() => setShowRoute(true)}
								disabled={!currentPosition}>
								<DirectionsIcon />
							</IconButton>
						</Tooltip>{" "}
					</Box>
				</Box>
			</DialogContent>
		</Dialog>
	);
};

export default OurLocationsPage;
