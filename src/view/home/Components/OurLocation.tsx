import React, { useEffect, useState } from "react";
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
	TextField,
	InputAdornment,
	CircularProgress,
	useTheme,
	useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import DirectionsIcon from "@mui/icons-material/Directions";
import CloseIcon from "@mui/icons-material/Close";
import { createDataServices } from "../../../services/DataServices";
import { API_ENDPOINTS, AUTH_CONFIG } from "../../../services/Configuration";
import Map from "./Map";
import type { ActiveMarker } from "./Map";

const { retrieve } = createDataServices();

interface MappedLocation {
	name: string;
	position: [number, number];
}

interface MapSuggestion {
	display_name: string;
	lat: number;
	lon: number;
}

interface LocationDisplay {
	name: string;
	position?: [number, number];
	latitude?: number;
	longitude?: number;
	isSuggestion?: boolean;
	id?: number | string;
}

interface OurLocationsPageProps {
	open: boolean;
	onClose: () => void;
	onPickupSelect: (marker: ActiveMarker) => void;
	onDropoffSelect: (marker: ActiveMarker) => void;
	editingMode: string;
}

const OurLocationsPage = ({
	open = false,
	onClose = () => {},
	onPickupSelect = () => {},
	onDropoffSelect = () => {},
	editingMode = "pickup",
}: Partial<OurLocationsPageProps>) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));

	const [locations, setLocations] = useState<MappedLocation[]>([]);
	const [preferredLocations, setPreferredLocations] = useState<MappedLocation[]>([]);
	const [selectedLocation, setSelectedLocation] = useState<LocationDisplay | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [mapSuggestions, setMapSuggestions] = useState<MapSuggestion[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const filteredLocations = locations.filter(loc => loc.name.toLowerCase().includes(searchTerm.toLowerCase()));
	const filteredPreferred = preferredLocations.filter(loc => loc.name.toLowerCase().includes(searchTerm.toLowerCase()));
	const displayLocations: LocationDisplay[] = [
		...filteredLocations,
		...mapSuggestions.map(s => ({
			name: s.display_name,
			latitude: s.lat,
			longitude: s.lon,
			isSuggestion: true,
			id: s.lat,
		})),
	];
	const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);

  const fetchCitiesForLocations = async (locs: MappedLocation[]) => {
    try {
      const TOMTOM_KEY = import.meta.env.VITE_TOMTOM_KEY;
      if (!TOMTOM_KEY) return;

      const cities = new Set<string>();

      for (const location of locs) {
        try {
          const response = await fetch(
            `https://api.tomtom.com/search/2/reverseGeocode/${location.position[0]},${location.position[1]}.json?key=${TOMTOM_KEY}`
          );
          const data = await response.json();
          const address = data.addresses?.[0]?.address;
          if (address) {
            // Try to get city, municipality, or town
            const city = address.municipality || address.city || address.town || address.village;
            if (city) {
              cities.add(city.toLowerCase());
            }
          }
        } catch (error) {
          console.error("Error fetching city for location:", location, error);
        }
      }

      setAllowedCities(Array.from(cities));
    } catch (error) {
      console.error("Error fetching cities for locations:", error);
    }
  };
  const [showRoute, setShowRoute] = useState(false);
  const [selectionMode, setSelectionMode] = useState("pickup");
  const [activeMarker, setActiveMarker] = useState<ActiveMarker | null>(null);
  const [allowedCities, setAllowedCities] = useState<string[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);



	useEffect(() => {
		if (open) {
			setIsLoading(true);
			const fetchLocations = async () => {
				try {
					const response = await retrieve(API_ENDPOINTS.location.base, API_ENDPOINTS.location.getOffice);
					if (response.success) {
						const data = response.data as Array<{ location_name?: string; location?: unknown }>;
						const mappedLocations: MappedLocation[] = data.map(loc => {
							const raw = loc.location as any;
							const coords = Array.isArray(raw) ? raw : [raw[0] || 0, raw[1] || 0];
							return {
								name: loc.location_name || "",
								position: [parseFloat(coords[0]) || 0, parseFloat(coords[1]) || 0] as [number, number],
							};
						});
						setLocations(mappedLocations);

						// Get the cities/towns for all office locations
						if (mappedLocations.length > 0) {
							await fetchCitiesForLocations(mappedLocations);
						}
					}
				} catch (error) {
					console.error('Error fetching locations:', error);
				}
			};
			const fetchPreferredLocations = async () => {
				if (AUTH_CONFIG.isAuthenticated()) {
					try {
						console.log('Fetching preferred locations');
						const response = await retrieve(API_ENDPOINTS.userPreferenceLocations.base, API_ENDPOINTS.userPreferenceLocations.getAll);
						console.log('Preferred response:', response);
						if (response.success) {
							const data = response.data as Array<{ location_name?: string; location?: unknown }>;
							const mappedPreferred: MappedLocation[] = data.map(loc => {
								const raw = loc.location as any;
								const coords = Array.isArray(raw) ? raw : [raw[0] || 0, raw[1] || 0];
								return {
									name: loc.location_name || "",
									position: [parseFloat(coords[0]) || 0, parseFloat(coords[1]) || 0] as [number, number],
								};
							});
							console.log('Mapped preferred:', mappedPreferred);
							// if (mappedPreferred.length === 0) {
							// 	mappedPreferred.push({ name: 'Dummy Preferred', position: [16.8, 96.1] });
							// }
							setPreferredLocations(mappedPreferred);
							console.log('Preferred locations set to state');
						}
					} catch (error) {
						console.error('Error fetching preferred locations:', error);
					}
				} else {
					console.log('User not authenticated, skipping preferred locations fetch');
				}
			};
			Promise.all([fetchLocations(), fetchPreferredLocations()]).finally(() => setIsLoading(false));
		}
	}, [open]);

	useEffect(() => {
		if (locations.length > 0) {
			const defaultLoc = locations[0];
			setSelectedLocation(defaultLoc);
			setActiveMarker({
				position: defaultLoc.position,
				name: defaultLoc.name,
			});
		}
	}, [locations]);

	useEffect(() => {
		if (open) {
			setSelectionMode(editingMode);
			// Set the initial marker to the default office location when dialog opens
			if (locations.length > 0) {
				setActiveMarker({
					position: locations[0].position,
					name: locations[0].name,
				});
			}
		}
	}, [open, editingMode, locations]);



  const handleMapClick = async (latlng: { lat: number; lng: number }) => {
 		try {
 			const TOMTOM_KEY = import.meta.env.VITE_TOMTOM_KEY;
 			if (!TOMTOM_KEY) {
 				console.error("TomTom key not found");
 				setActiveMarker({
 					position: [latlng.lat, latlng.lng] as [number, number],
 					name: "Selected Location",
 				});
 				setSelectedLocation(null);
 				setLocationError(null);
 				return;
 			}
 			const response = await fetch(
 				`https://api.tomtom.com/search/2/reverseGeocode/${latlng.lat},${latlng.lng}.json?key=${TOMTOM_KEY}`
 			);
 			const data = await response.json();
 			const address = data.addresses?.[0]?.address;
 			const location: ActiveMarker = {
 				position: [latlng.lat, latlng.lng] as [number, number],
 				name: address?.freeformAddress || "Selected Location",
 			};

 			// Check if location is in allowed cities
 			if (allowedCities.length > 0 && address) {
 				const selectedCity = (address.municipality || address.city || address.town || address.village)?.toLowerCase();
 				if (selectedCity && !allowedCities.includes(selectedCity)) {
 					const cityList = allowedCities.map(city => city.charAt(0).toUpperCase() + city.slice(1)).join(' or ');
 					setLocationError(`Location must be within ${cityList}. Please select a location in one of these cities.`);
 					setActiveMarker(null);
 					return;
 				}
 			}

 			setActiveMarker(location);
 			setSelectedLocation(null); // Deselect any office
 			setLocationError(null);
 		} catch (error) {
 			console.error("Error fetching location name:", error);
 			setActiveMarker({
 				position: [latlng.lat, latlng.lng] as [number, number],
 				name: "Selected Location",
 			});
 			setSelectedLocation(null);
 			setLocationError(null);
 		}
 	};

  const handleLocationSelect = async (loc: LocationDisplay) => {
 		// For map suggestions, validate city
 		if (loc.isSuggestion && allowedCities.length > 0) {
 			try {
 				const TOMTOM_KEY = import.meta.env.VITE_TOMTOM_KEY;
 				if (TOMTOM_KEY) {
 					const response = await fetch(
 						`https://api.tomtom.com/search/2/reverseGeocode/${loc.latitude},${loc.longitude}.json?key=${TOMTOM_KEY}`
 					);
 					const data = await response.json();
 					const address = data.addresses?.[0]?.address;
 					if (address) {
 						const selectedCity = (address.municipality || address.city || address.town || address.village)?.toLowerCase();
 						if (selectedCity && !allowedCities.includes(selectedCity)) {
 							const cityList = allowedCities.map(city => city.charAt(0).toUpperCase() + city.slice(1)).join(' or ');
 							setLocationError(`Location must be within ${cityList}. Please select a location in one of these cities.`);
 							return;
 						}
 					}
 				}
 			} catch (error) {
 				console.error("Error validating suggestion location:", error);
 			}
 		}

 		setSelectedLocation(loc);
 		setShowRoute(false);
 		// Handle both office locations (position array) and map suggestions (latitude/longitude)
 		const position: [number, number] = loc.latitude && loc.longitude
 			? [loc.latitude, loc.longitude] as [number, number]
 			: loc.position!;
 		setActiveMarker({ position, name: loc.name });
 		setLocationError(null);
 	};

  const clearAllData = () => {
 		setLocations([]);
 		setPreferredLocations([]);
 		setSelectedLocation(null);
 		setSearchTerm("");
 		setMapSuggestions([]);
 		setCurrentPosition(null);
 		setShowRoute(false);
 		setActiveMarker(null);
 		setLocationError(null);
 	};

  const handleClose = () => {
 		clearAllData();
 		setLocationError(null);
 		onClose();
 	};

	const handleConfirmSelection = async () => {
		if (activeMarker) {
			// Call userpreference API to add the selected location, but not for office locations
			const isOfficeLocation = locations.some(loc => loc.name === activeMarker.name);
			if (!isOfficeLocation) {
				try {
					const dataServices = createDataServices();
					await dataServices.retrievePOST(
						{
							location_name: activeMarker.name,
							latitude: activeMarker.position[0],
							longitude: activeMarker.position[1],
						},
						API_ENDPOINTS.userPreferenceLocations.base + API_ENDPOINTS.userPreferenceLocations.add
					);
				} catch (error) {
					console.error("Error adding user preference location:", error);
				}
			}

			if (selectionMode === "pickup") {
				onPickupSelect(activeMarker);
			} else {
				onDropoffSelect(activeMarker);
			}
		}
		handleClose();
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth='lg'
			fullWidth
			fullScreen={isMobile}
			disableEnforceFocus={true}
			disablePortal={true}
			PaperProps={{
				sx: {
					width: "100%",
					height: isMobile ? "100vh" : "85vh",
					backgroundColor: "var(--background-paper)",
					zIndex: 1400,
				},
			}}>
			<DialogContent sx={{ p: 0, height: "100%", display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
				<IconButton
					aria-label='close'
					onClick={handleClose}
					sx={{
						position: "absolute",
						right: 8,
						top: 8,
						color: "var(--text-color)",
						backgroundColor: "var(--background-paper)",
						"&:hover": {
							backgroundColor: "var(--divider-color)",
						},
						zIndex: 1000,
					}}>
					<CloseIcon />
				</IconButton>
				{/* Sidebar */}
				<Paper
					elevation={12}
					sx={{
						width: isMobile ? '100%' : 350,
						height: isMobile ? '40vh' : '100%',
						display: "flex",
						flexDirection: "column",
						backgroundColor: "var(--background-paper)",
						borderRadius: 4,
						border: "none",
						overflow: "hidden",
					}}>
					<Box sx={{ p: 2 }}>
						<TextField
							fullWidth
							variant="outlined"
							placeholder="Search locations..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon sx={{ color: "var(--text-color)" }} />
									</InputAdornment>
								),
							}}
							sx={{
								"& .MuiOutlinedInput-root": {
									backgroundColor: "var(--background-paper)",
									color: "var(--text-color)",
									"& fieldset": {
										borderColor: "var(--divider-color)",
									},
									"&:hover fieldset": {
										borderColor: "var(--primary-color)",
									},
									"&.Mui-focused fieldset": {
										borderColor: "var(--primary-color)",
									},
								},
								"& .MuiInputBase-input::placeholder": {
									color: "var(--text-color)",
									opacity: 0.7,
								},
							}}
						/>
					</Box>
					<Box sx={{ flex: 1, overflowY: "auto", display: 'flex', flexDirection: 'column', justifyContent: isLoading ? 'center' : 'flex-start', alignItems: 'center' }}>
						{isLoading ? (
							<CircularProgress sx={{ color: "var(--primary-color)" }} />
						) : (
							<>
								<List sx={{ width: '100%' }}>
									{displayLocations.map((loc, index) => (
										<ListItemButton
											key={`office-${index}`}
										selected={selectedLocation?.name === loc.name}
										onClick={() => handleLocationSelect(loc)}
										sx={{
											"&.Mui-selected": {
												backgroundColor: "var(--primary-color)",
												color: "var(--primary-contrast-text)",
												"&:hover": {
													backgroundColor: "var(--primary-color)",
												},
											},
											"&:hover": {
												backgroundColor: "var(--divider-color)",
											},
										}}>
										{loc.isSuggestion ? (
											<ListItemText
												primary={loc.name}
												sx={{ color: "var(--text-color)" }}
											/>
										) : (
											<ListItemText
												primary={loc.name}
												secondary="(office)"
												sx={{ display:"flex", justifyContent:"space-between", color: "var(--text-color)" }}
											/>
										)}
									</ListItemButton>
								))}
							</List>
							{filteredPreferred.length > 0 && (
									<List sx={{ width: '100%' }}>
										{filteredPreferred.map((loc, index) => (
											<ListItemButton
												key={`preferred-${index}`}
											selected={selectedLocation?.name === loc.name}
											onClick={() => handleLocationSelect(loc)}
											sx={{
												"&.Mui-selected": {
													backgroundColor: "var(--primary-color)",
													color: "var(--primary-contrast-text)",
													"&:hover": {
														backgroundColor: "var(--primary-color)",
													},
												},
												"&:hover": {
													backgroundColor: "var(--divider-color)",
												},
											}}>
											<ListItemText
												primary={
													<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
														<span>{loc.name}</span>
														<span style={{ color: 'var(--text-color)', opacity: 0.7 }}>(recent)</span>
													</Box>
												}
												sx={{ color: "var(--text-color)" }}
											/>
										</ListItemButton>
									))}
								</List>
							)}
							</>
						)}
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
								backgroundColor: "var(--primary-color)",
								color: "var(--primary-contrast-text)",
								"&:hover": {
									backgroundColor: "var(--primary-color)",
								},
							}}>
							Select This Location
						</Button>
					</Box>
				</Paper>
 				{/* MAP */}
 				<Box sx={{ flex: 1, height: isMobile ? '60vh' : '100%', position: 'relative' }}>
 					<Map
 						currentPosition={currentPosition}
 						showRoute={showRoute}
 						onMapClick={handleMapClick}
 						activeMarker={activeMarker}
 						onPickupSelect={onPickupSelect}
 						onDropoffSelect={onDropoffSelect}
 						onClose={onClose}
 						selectionMode={selectionMode}
 						searchTerm={searchTerm}
 						onSuggestionsChange={setMapSuggestions}
 					/>
 					{locationError && (
 						<Box
 							sx={{
 								position: 'absolute',
 								top: 10,
 								left: 10,
 								right: 10,
 								backgroundColor: 'error.main',
 								color: 'error.contrastText',
 								padding: 2,
 								borderRadius: 1,
 								zIndex: 1000,
 							}}
 						>
 							<Typography variant="body2">{locationError}</Typography>
 						</Box>
 					)}
 				</Box>
			</DialogContent>
		</Dialog>
	);
};

export default OurLocationsPage;
