import React, { useState, useEffect } from "react";
import {
	Box,
	TextField,
	Button,
	Chip,
	Tooltip,
	IconButton,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Paper,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
	CircularProgress,
} from "@mui/material";
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	Add as AddIcon,
	Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { createDataServices } from "../../../services/DataServices";
import { API_ENDPOINTS } from "../../../services/Configuration";
import { useSnackbar } from "../../../contexts/ErrorMessage";
import ConfirmDialog from "../../../common/ConfirmDialog";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: markerIcon2x,
	iconUrl: markerIcon,
	shadowUrl: markerShadow,
});

interface LocationRow {
	office_location_id: number;
	location_name: string;
	location: [number, number];
	[key: string]: unknown;
}

interface LatLng {
	lat: number;
	lng: number;
}

// Component to fly to marker
const FlyToMarker = ({ position }: { position: [number, number] | null }) => {
	const map = useMap();

	useEffect(() => {
		if (position && position.length === 2 && !isNaN(position[0]) && !isNaN(position[1])) {
			const lat = position[0];
			const lng = position[1];

			map.flyTo([lat, lng], 16, {
				duration: 1.2,
				easeLinearity: 0.25,
			});
		}
	}, [position, map]);

	return null;
};

const dataServices = createDataServices();

// Map click handler component
const MapClickHandler = ({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) => {
	const map = useMap();

	useEffect(() => {
		if (!onMapClick) return;

		const handleMapClick = (e: L.LeafletMouseEvent) => {
			onMapClick(e.latlng);
		};

		map.on('click', handleMapClick);

		return () => {
			map.off('click', handleMapClick);
		};
	}, [map, onMapClick]);

	return null;
};

const LocationManagement = () => {
	const { showSnackbar } = useSnackbar();
	const [locations, setLocations] = useState<LocationRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [totalLocations, setTotalLocations] = useState(0);
	const [openDialog, setOpenDialog] = useState(false);
	const [editingLocation, setEditingLocation] = useState<LocationRow | null>(null);
	const [viewDetailDialog, setViewDetailDialog] = useState<{ open: boolean; location: LocationRow | null }>({ open: false, location: null });
	const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: string | null; location: any }>({ open: false, action: null, location: null });
	const [locationForm, setLocationForm] = useState({
		location_name: "",
		latitude: "",
		longitude: "",
	});
	const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null); // For map selection {lat, lng}

	const fetchLocations = async () => {
		try {
			setLoading(true);
			const response = await dataServices.retrieve(
				API_ENDPOINTS.location.base,
				API_ENDPOINTS.location.getOffice
			);
			const data = (response.data as LocationRow[]) || [];
			setLocations(data);
			setTotalLocations(data.length);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Failed to load locations";
			setError(msg);
			showSnackbar("Failed to load locations", "error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLocations();
	}, []);

	const handleOpenDialog = (location: LocationRow | null = null) => {
		setEditingLocation(location);
		setLocationForm(
			location
				? {
						location_name: location.location_name,
						latitude: String(location.location[0]),
						longitude: String(location.location[1]),
					}
				: { location_name: "", latitude: "", longitude: "" }
		);
		setSelectedLocation(location ? { lat: location.location[0], lng: location.location[1] } : null); // Set initial marker
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setEditingLocation(null);
		setSelectedLocation(null);
	};

	const handleViewDetail = (location: LocationRow) => {
		setViewDetailDialog({ open: true, location });
	};

	const handleCloseViewDetail = () => {
		setViewDetailDialog({ open: false, location: null });
	};

	const handleEdit = (location: LocationRow) => {
		handleOpenDialog(location);
	};

	const handleDelete = (location: LocationRow) => {
		setConfirmDialog({ open: true, action: 'delete', location });
	};

	const handleConfirmAction = async () => {
		const { action, location } = confirmDialog;
		setConfirmDialog({ open: false, action: null, location: null });
		if (action === 'delete') {
			try {
				await dataServices.retrieveDELETE(
					API_ENDPOINTS.location.base,
					API_ENDPOINTS.location.deleteOffice(location.office_location_id)
				);
				showSnackbar("Location deleted successfully", "success");
				fetchLocations();
			} catch {
				showSnackbar("Failed to delete location", "error");
			}
		}
	};

	const handleChangePage = (event: any, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: any) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleSave = async () => {
		if (!selectedLocation) {
			showSnackbar("Please select a location on the map", "error");
			return;
		}
		setConfirmDialog({
			open: true,
			action: 'save',
			location: { ...locationForm, latitude: selectedLocation.lat, longitude: selectedLocation.lng }
		});
	};

	const handleConfirmSave = async () => {
		const { location } = confirmDialog;
		setConfirmDialog({ open: false, action: null, location: null });
		try {
			const payload = {
				location_name: location.location_name,
				latitude: location.latitude,
				longitude: location.longitude,
			};
			if (editingLocation) {
				await dataServices.retrievePOST(
					payload,
					API_ENDPOINTS.location.base + API_ENDPOINTS.location.updateOffice(editingLocation.office_location_id)
				);
				showSnackbar("Location updated successfully", "success");
			} else {
				await dataServices.retrievePOST(
					payload,
					API_ENDPOINTS.location.base + API_ENDPOINTS.location.createOffice
				);
				showSnackbar("Location created successfully", "success");
			}
			fetchLocations();
			handleCloseDialog();
		} catch {
			showSnackbar("Failed to save location", "error");
		}
	};

	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "80vh",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 4 }}>
				<Typography color="error">{error}</Typography>
			</Box>
		);
	}

	return (
		<Box
			sx={{
				p: 2,
				bgcolor: "var(--background-paper)",
				color: "var(--text-color)",
			}}
		>
			<Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
				<Typography variant="h4">Location Management</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => handleOpenDialog()}
				>
					Add Location
				</Button>
			</Box>

			<Paper>
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Location Name</TableCell>
								<TableCell>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{locations.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((location) => (
								<TableRow key={location.office_location_id}>
									<TableCell>{location.location_name}</TableCell>
									<TableCell>
										<Tooltip title="View Detail">
											<IconButton onClick={() => handleViewDetail(location)}>
												<VisibilityIcon style={{ color: "var(--primary-color)" }} />
											</IconButton>
										</Tooltip>
										<Tooltip title="Edit">
											<IconButton onClick={() => handleEdit(location)}>
												<EditIcon style={{ color: "var(--success-color)" }} />
											</IconButton>
										</Tooltip>
										<Tooltip title="Delete">
											<IconButton onClick={() => handleDelete(location)}>
												<DeleteIcon style={{ color: "var(--error-color)" }} />
											</IconButton>
										</Tooltip>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			{/* View Detail Dialog */}
			<Dialog open={viewDetailDialog.open} onClose={handleCloseViewDetail} maxWidth="md" fullWidth>
				<DialogTitle>View Location: {viewDetailDialog.location?.location_name}</DialogTitle>
				<DialogContent>
					<Box sx={{ height: 400 }}>
						<MapContainer
							center={[16.8, 96.1]}
							zoom={13}
							style={{ height: '100%', width: '100%' }}
						>
							<TileLayer
								attribution='&copy; TomTom'
								url={`https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${import.meta.env.VITE_TOMTOM_KEY}`}
							/>
							<FlyToMarker position={viewDetailDialog.location?.location ? [viewDetailDialog.location.location[0], viewDetailDialog.location.location[1]] : null} />
							{viewDetailDialog.location?.location && (
								<Marker position={[viewDetailDialog.location.location[0], viewDetailDialog.location.location[1]]}>
									<Popup>{viewDetailDialog.location.location_name}</Popup>
								</Marker>
							)}
						</MapContainer>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseViewDetail}>Close</Button>
				</DialogActions>
			</Dialog>

			{/* Edit/Add Dialog */}
			<Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
				<DialogTitle>{editingLocation ? "Edit Location" : "Add Location"}</DialogTitle>
				<DialogContent>
					<TextField
						fullWidth
						label="Location Name"
						value={locationForm.location_name}
						onChange={(e) =>
							setLocationForm({ ...locationForm, location_name: e.target.value })
						}
						sx={{ mt: 2 }}
					/>
					<Box sx={{ mt: 2, height: 300 }}>
						<MapContainer
							center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : [0, 0]}
							zoom={13}
							style={{ height: '100%', width: '100%' }}
						>
							<TileLayer
								attribution='&copy; TomTom'
								url={`https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${import.meta.env.VITE_TOMTOM_KEY}`}
							/>
							<MapClickHandler onMapClick={(latlng: L.LatLng) => setSelectedLocation({ lat: latlng.lat, lng: latlng.lng })} />
							{selectedLocation && <Marker position={[selectedLocation.lat, selectedLocation.lng]} />}
						</MapContainer>
					</Box>
					{selectedLocation && (
						<Typography sx={{ mt: 1 }}>Selected: Lat {selectedLocation.lat}, Lng {selectedLocation.lng}</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog}>Cancel</Button>
					<Button onClick={handleSave} variant="contained">
						Save this location
					</Button>
				</DialogActions>
			</Dialog>

			{/* Confirm Dialog */}
			<ConfirmDialog
				open={confirmDialog.open}
				onClose={() => setConfirmDialog({ open: false, action: null, location: null })}
				onConfirm={confirmDialog.action === 'save' ? handleConfirmSave : handleConfirmAction}
				title={confirmDialog.action === 'delete' ? "Delete Location" : confirmDialog.action === 'save' ? "Save Location" : "Confirm Action"}
				message={
					confirmDialog.action === 'delete'
						? `Are you sure you want to delete ${confirmDialog.location?.location_name}? This action cannot be undone.`
						: confirmDialog.action === 'save'
						? `Are you sure you want to save this location?`
						: "Confirm this action?"
				}
				confirmText={confirmDialog.action === 'delete' ? "Delete" : "Confirm"}
				cancelText="Cancel"
			/>

			<TablePagination
				component="div"
				count={totalLocations}
				page={page}
				onPageChange={handleChangePage}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>
		</Box>
	);
};

export default LocationManagement;
