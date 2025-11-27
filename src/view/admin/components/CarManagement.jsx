import React, { useEffect, useState, useMemo } from "react";
import { createDataServices } from "../../../services/DataServices";
import ReusableTable from "./ReusableTable";
import ConfirmDialog from "../../../common/ConfirmDialog";
import {
	Box,
	TextField,
	Button,
	Chip,
	Tooltip,
	IconButton,
	FormControl,
	CircularProgress,
	InputLabel,
	Select,
	MenuItem,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Paper,
	Typography,
	FormControlLabel,
	Switch,
} from "@mui/material";
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	Add as AddIcon,
	CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { API_ENDPOINTS } from "../../../services/Configuration";
import { useSnackbar } from "../../../contexts/ErrorMessage";
import useDebouncedSearch from "../../common/useDebouncedSearch";

const dataServices = createDataServices();

const CarManagement = () => {
	const { showSnackbar } = useSnackbar();
	const [cars, setCars] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [totalCars, setTotalCars] = useState(0);
	const { searchTerm, setSearchTerm, debouncedSearchTerm } = useDebouncedSearch(
		"",
		1500
	);
	const [availabilityFilter, setAvailabilityFilter] = useState("All");
	const [fuelTypeFilter, setFuelTypeFilter] = useState("All");
	const [carTypeFilter, setCarTypeFilter] = useState("All");
	const [officeLocationFilter, setOfficeLocationFilter] = useState("All");
	const [sort, setSort] = useState({ by: "price_per_day", order: "desc" });
	const [openManageCarDialog, setOpenManageCarDialog] = useState(false);

	const [selectedFile, setSelectedFile] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [officeLocations, setOfficeLocations] = useState([]);
	const [carTypes, setCarTypes] = useState([]);
	const [editingCar, setEditingCar] = useState(null); // State to hold the car being edited
	const [confirmDialog, setConfirmDialog] = useState({ open: false, car: null });
	const [errors, setErrors] = useState({});
	const [carFormData, setCarFormData] = useState({
		model: "",
		color: "",
		license_plate: "",
		price_per_hour: "",
		price_per_day: "",
		number_of_seats: "",
		luggage_capacity: "",
		transmission: "Automatic",
		fuel_type: "petrol",
		car_type_id: "",
		car_image: "",
		office_location_id: "",
	});

	useEffect(() => {
		const getOfficeLocation = async () => {
			try {
				const response = await dataServices.retrieve(
					API_ENDPOINTS.location.base,
					API_ENDPOINTS.location.getOffice
				);
				setOfficeLocations(response.data || []);
			} catch (error) {}
		};

		const getCarTypes = async () => {
			try {
				const response = await dataServices.retrieve(
					API_ENDPOINTS.carTypes.base,
					API_ENDPOINTS.carTypes.getAll
				);
				setCarTypes(response.data || []);
			} catch (error) {}
		};

		getOfficeLocation();
		getCarTypes();
	}, []);

	const fetchCars = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams({
				first: page + 1,
				max: rowsPerPage,
			});

			if (debouncedSearchTerm) params.append('search_by', debouncedSearchTerm);
			if (carTypeFilter !== "All") params.append('car_type_id', carTypeFilter);
			if (fuelTypeFilter !== "All") params.append('fuel_type', fuelTypeFilter);
			if (availabilityFilter !== "All") params.append('availability', (availabilityFilter === "Available").toString());
			if (officeLocationFilter !== "All") params.append('office_location_id', officeLocationFilter);

			// Add sorting parameter
			if (sort.by === 'price_per_day') {
				params.append('asc_day', (sort.order === 'asc').toString());
			} else if (sort.by === 'price_per_hour') {
				params.append('asc_hour', (sort.order === 'asc').toString());
			}
			// No sorting for other fields

			const response = await dataServices.retrieve(
				API_ENDPOINTS.cars.base,
				`${API_ENDPOINTS.cars.getAll}?${params.toString()}`
			);
			setCars(response.data.data || response.data.cars || response.data || []);
			setTotalCars(response.data.total || response.data.totalCars || 0);
			setError(null);
		} catch (err) {
			const errorMessage = err.message || "Failed to fetch cars.";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCars();
	}, [page, rowsPerPage, debouncedSearchTerm, availabilityFilter, fuelTypeFilter, carTypeFilter, officeLocationFilter, sort]);

	const handleAvailabilityFilterChange = (event) => {
		setPage(0);
		setAvailabilityFilter(event.target.value);
	};

	const handleCloseManageCarDialog = () => {
		setOpenManageCarDialog(false);
		setEditingCar(null);
		setCarFormData({
			model: "",
			color: "",
			license_plate: "",
			price_per_hour: "",
			price_per_day: "",
			number_of_seats: "",
			luggage_capacity: "",
			transmission: "",
			fuel_type: "",
			car_type_id: "",
			office_location_id: "",
			car_image: "",
		});
		setSelectedFile(null);
		setImagePreview(null);
	};

	const handleNewCarChange = (event) => {
		const { name, value, type, checked } = event.target;
		setCarFormData({
			...carFormData,
			[name]: type === "checkbox" ? checked : value,
		});
		setErrors(prev => ({ ...prev, [name]: '' }));
	};

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (file) {
			setSelectedFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
			};
			reader.readAsDataURL(file);
			setErrors(prev => ({ ...prev, image: '' }));
		}
	};

	const handleOpenAddDialog = () => {
		setOpenManageCarDialog(true);
		setEditingCar(null);
		setErrors({});
		setCarFormData({
			model: "",
			color: "",
			license_plate: "",
			price_per_hour: "",
			price_per_day: "",
			number_of_seats: "",
			luggage_capacity: "",
			transmission: "",
			fuel_type: "",
			car_type_id: "",
			office_location_id: "",
			car_image: "",
		});
		setImagePreview(null);
		setSelectedFile(null);
	};

	const validateForm = () => {
		const newErrors = {};
		const requiredFields = [
			'model', 'color', 'license_plate', 'price_per_hour', 'price_per_day',
			'number_of_seats', 'luggage_capacity', 'fuel_type', 'car_type_id',
			'transmission', 'office_location_id'
		];
		for (const field of requiredFields) {
			if (!carFormData[field] || carFormData[field] === "") {
				newErrors[field] = `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
			}
		}
		if (carFormData.price_per_hour && parseFloat(carFormData.price_per_hour) <= 0) {
			newErrors.price_per_hour = "Price per hour must be greater than 0";
		}
		if (carFormData.price_per_day && parseFloat(carFormData.price_per_day) <= 0) {
			newErrors.price_per_day = "Price per day must be greater than 0";
		}
		if (carFormData.number_of_seats && parseInt(carFormData.number_of_seats) <= 0) {
			newErrors.number_of_seats = "Number of seats must be greater than 0";
		}
		if (carFormData.luggage_capacity && parseInt(carFormData.luggage_capacity) < 0) {
			newErrors.luggage_capacity = "Luggage capacity must be 0 or greater";
		}
		if (!editingCar && !selectedFile && !imagePreview) {
			newErrors.image = "Please upload a car image";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleFormSubmit = () => {
		if (!validateForm()) return;

		setIsSubmitting(true);
		const formData = new FormData();
		const isEditing = !!editingCar;

		// Populate FormData
		Object.keys(carFormData).forEach((key) => {
			// Don't append the image URL string on updates
			if (isEditing && key === "car_image") return;
			formData.append(key, carFormData[key]);
		});

		if (selectedFile) {
			// A new file was selected
			formData.append("car_image", selectedFile);
		}

		const apiCall = isEditing
			? dataServices.retrievePOSTFormData(
					formData,
					API_ENDPOINTS.cars.update(editingCar.car_id)
			  )
			: dataServices.retrievePOSTFormData(formData, API_ENDPOINTS.cars.create);
		apiCall
			.then(() => {
				showSnackbar(
					`Car ${editingCar ? "updated" : "added"} successfully!`,
					"success"
				);
				handleCloseManageCarDialog();
				fetchCars();
			})
			.catch((err) =>
				showSnackbar(
					err.message || `Failed to ${editingCar ? "update" : "add"} car.`,
					"error"
				)
			)
			.finally(() => setIsSubmitting(false));
	};

	const handleEdit = (car) => {
		const carType = carTypes.find(type => type.type_name === car.car_type);
		setEditingCar(car);
		setErrors({});
		setCarFormData({
			...car,
			license_plate: car.license_plate,
			car_type_id: carType ? carType.car_type_id : "",
		});
		setImagePreview(dataServices.retrieveImage(car.car_image_url));
		setSelectedFile(null); // Clear previous file selection
		setOpenManageCarDialog(true);
	};

	const handleDelete = (car) => {
		setConfirmDialog({ open: true, car });
	};

	const handleConfirmDelete = async () => {
		const car = confirmDialog.car;
		setConfirmDialog({ open: false, car: null });
		try {
			await dataServices.retrieveDELETE(
				API_ENDPOINTS.cars.base,
				API_ENDPOINTS.cars.delete(car.car_id)
			);
			showSnackbar("Car deleted successfully!", "success");
			fetchCars(); // Refresh the list
		} catch (err) {
			showSnackbar(err.message || "Failed to delete car.", "error");
		}
	};

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const columns = useMemo(
		() => [
			{
				id: "image",
				label: "Image",
				render: (car) => (
					<img
						src={dataServices.retrieveImage(car.car_image_url) || undefined}
						alt={car.model || "car"}
						style={{
							width: 100,
							height: 60,
							objectFit: "cover",
							borderRadius: 4,
						}}
					/>
				),
				sx: {
					color: "var(--text-color)",
				},
			},

			{
				id: "license_plate",
				label: "License Plate",
				sx: {
					color: "var(--text-color)",
				},
			},
			{
				id: "price_per_day",
				label: "Price / day",
				align: "right",
				sx: {
					color: "var(--text-color)",
				},
				render: (car) =>
					car.price_per_day != null
						? `${Number(car.price_per_day).toFixed(2)} MMK`
						: "-",
			},
			{
				id: "price_per_hour",
				label: "Price / hour",
				align: "right",
				sx: {
					color: "var(--text-color)",
				},
				render: (car) =>
					car.price_per_hour != null
						? `${Number(car.price_per_hour).toFixed(2)} MMK`
						: "-",
			},
			{
				id: "model",
				label: "Model",
				sx: {
					color: "var(--text-color)",
				},
			},
			{
				id: "car_type",
				label: "Car Type",
				sx: {
					color: "var(--text-color)",
				},
			},
			{
				id: "number_of_seats",
				label: "Seats",
				align: "center",
				sx: {
					color: "var(--text-color)",
				},
			},

			{
				id: "luggage_capacity",
				label: "Luggage",
				align: "center",
				sx: {
					color: "var(--text-color)",
				},
			},
			{
				id: "transmission",
				label: "Transmission",
				align: "center",
				sx: {
					color: "var(--text-color)",
				},
			},
			{
				id: "fuel_type",
				label: "Fuel",
				align: "center",
				sx: {
					color: "var(--text-color)",
				},
			},
			{
				id: "availability",
				label: "Availability",
				align: "center",
				sx: {
					color: "var(--text-color)",
				},
				render: (car) => (
					<Chip
						label={car.availability ? "Available" : "Unavailable"}
						color={car.availability ? "success" : "error"}
						variant='outlined'
					/>
				),
			},

			{
				id: "actions",
				label: "Action",
				align: "center",
				sx: {
					color: "var(--text-color)",
				},
				render: (car) => (
					<>
						<Tooltip title='Edit Car'>
							<IconButton onClick={() => handleEdit(car)}>
								<EditIcon
									style={{
										color: "var(--success-color)",
									}}
								/>
							</IconButton>
						</Tooltip>
						{car.availability ? (
							<Tooltip title='Delete Car'>
								<IconButton onClick={() => handleDelete(car)}>
									<DeleteIcon
										style={{
											color: "var(--error-color)",
										}}
									/>
								</IconButton>
							</Tooltip>
						) : null}
					</>
				),
			},
		],
		[]
	);

	return (
		<Box
			sx={{
				p: 2,
				bgcolor: "var(--background-paper)",
				color: "var(--text-color)",
			}}>
			<Typography
				variant='h4'
				marginBottom={2}
				gutterBottom>
				Car Management
			</Typography>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
					flexWrap: "wrap",
					gap: 2,
				}}>
				<TextField
					label='Search by type, model, license...'
					variant='outlined'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					sx={{ flexGrow: 1, minWidth: "250px" }}
				/>
				<FormControl
					variant='outlined'
					sx={{ minWidth: 120 }}>
					<InputLabel>Car Type</InputLabel>
					<Select
						value={carTypeFilter}
						onChange={(e) => setCarTypeFilter(e.target.value)}
						label='Car Type'
						sx={{
							color: "var(--text-color)",
						}}>
						<MenuItem value='All'>All</MenuItem>
						{carTypes.map((type) => (
							<MenuItem key={type.car_type_id} value={type.car_type_id}>
								{type.type_name}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<FormControl
					variant='outlined'
					sx={{ minWidth: 120 }}>
					<InputLabel>Fuel Type</InputLabel>
					<Select
						value={fuelTypeFilter}
						onChange={(e) => setFuelTypeFilter(e.target.value)}
						label='Fuel Type'
						sx={{
							color: "var(--text-color)",
						}}>
						<MenuItem value='All'>All</MenuItem>
						<MenuItem value='petrol'>Petrol</MenuItem>
						<MenuItem value='diesel'>Diesel</MenuItem>
						<MenuItem value='electric'>Electric</MenuItem>
					</Select>
				</FormControl>
				<FormControl
					variant='outlined'
					sx={{ minWidth: 120 }}>
					<InputLabel>Availability</InputLabel>
					<Select
						value={availabilityFilter}
						onChange={(e) => setAvailabilityFilter(e.target.value)}
						label='Availability'
						sx={{
							color: "var(--text-color)",
						}}>
						<MenuItem value='All'>All</MenuItem>
						<MenuItem value='Available'>Available</MenuItem>
						<MenuItem value='Unavailable'>Unavailable</MenuItem>
					</Select>
				</FormControl>
				<FormControl
					variant='outlined'
					sx={{ minWidth: 120 }}>
					<InputLabel>Office Location</InputLabel>
					<Select
						value={officeLocationFilter}
						onChange={(e) => setOfficeLocationFilter(e.target.value)}
						label='Office Location'
						sx={{
							color: "var(--text-color)",
						}}>
						<MenuItem value='All'>All</MenuItem>
						{officeLocations.map((location) => (
							<MenuItem key={location.office_location_id} value={location.office_location_id}>
								{location.location_name}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<FormControl
					variant='outlined'
					sx={{ minWidth: 120 }}>
					<InputLabel>Sort By</InputLabel>
					<Select
						value={sort.by}
						onChange={(e) => setSort(prev => ({ ...prev, by: e.target.value }))}
						label='Sort By'
						sx={{
							color: "var(--text-color)",
						}}>
						<MenuItem value='price_per_day'>Price per Day</MenuItem>
						<MenuItem value='price_per_hour'>Price per Hour</MenuItem>
					</Select>
				</FormControl>
				<FormControl
					variant='outlined'
					sx={{ minWidth: 120 }}>
					<InputLabel>Order</InputLabel>
					<Select
						value={sort.order}
						onChange={(e) => setSort(prev => ({ ...prev, order: e.target.value }))}
						label='Order'
						sx={{
							color: "var(--text-color)",
						}}>
						<MenuItem value='asc'>Ascending</MenuItem>
						<MenuItem value='desc'>Descending</MenuItem>
					</Select>
				</FormControl>
				{/* <FormControl
					variant='outlined'
					sx={{ minWidth: 120 }}>
					<InputLabel>Availability</InputLabel>
					<Select
						value={availabilityFilter}
						onChange={handleAvailabilityFilterChange}
						label='Availability'
						sx={{
							color: "var(--text-color)",
						}}>
						<MenuItem value='All'>All</MenuItem>
						<MenuItem value='Available'>Available</MenuItem>
						<MenuItem value='Unavailable'>Unavailable</MenuItem>
					</Select>
				</FormControl> */}
				<Button
					variant='contained'
					startIcon={<AddIcon />}
					sx={{
						p: 1.8,
					}}
					onClick={handleOpenAddDialog}>
					Add Car
				</Button>
			</Box>

			<ReusableTable
				columns={columns}
				data={cars}
				loading={loading}
				error={error}
				page={page}
				rowsPerPage={rowsPerPage}
				total={totalCars}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				keyExtractor={(car) => car.car_id}
			/>

			<Dialog
				open={openManageCarDialog}
				onClose={handleCloseManageCarDialog}
				maxWidth='md'
				fullWidth
				PaperProps={{
					sx: {
						bgcolor: "var(--background-paper)",
						color: "var(--text-color)",
					},
				}}>
				<DialogTitle>{editingCar ? "Edit Car" : "Add New Car"}</DialogTitle>
				<DialogContent>
					<Box
						sx={{
							display: "flex",
							flexDirection: { xs: "column", md: "row" },
							gap: 3,
							mt: 1,
							minHeight: 300,
						}}>
						{/* Left Column: Image Upload */}
						<Box
							component='label'
							sx={{ width: { xs: "100%", md: "40%" }, cursor: "pointer" }}>
							<Paper
								variant='outlined'
								sx={{
									height: "100%",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexDirection: "column",
									p: 2,
									boxSizing: "border-box",
									textAlign: "center",
									backgroundColor: "action.hover",
									minHeight: { xs: 200, md: "auto" },
									backgroundImage: imagePreview
										? `url(${imagePreview})`
										: "none",
									backgroundSize: "cover",
									backgroundPosition: "center",
								}}>
								{!imagePreview && (
									<>
										<CloudUploadIcon
											sx={{
												fontSize: 60,
												color: "var(--text-secondary-color)",
												mb: 2,
											}}
										/>
										<Typography
											variant='h6'
											sx={{
												color: "var(--text-secondary-color)",
											}}
											gutterBottom>
											Click to upload
										</Typography>
										<Typography
											variant='body2'
											color='var(--text-secondary-color)'>
											PNG, JPG, GIF up to 10MB
										</Typography>
									</>
								)}
								<input
									type='file'
									hidden
									accept='image/*'
									onChange={handleFileChange}
								/>
							</Paper>
							{errors.image && <Typography variant="caption" color="error" sx={{ mt: 1 }}>{errors.image}</Typography>}
						</Box>

						{/* Right Column: Form Fields */}
						<Box
							sx={{
								width: { xs: "100%", md: "60%" },
								display: "flex",
								flexWrap: "wrap",
								gap: 2,
							}}>
							<Box sx={{ width: { xs: "100%", sm: "calc(33.33% - 11px)" } }}>
								<TextField
									fullWidth
									label='Model'
									name='model'
									value={carFormData.model}
									onChange={handleNewCarChange}
									error={!!errors.model}
									helperText={errors.model}
								/>
							</Box>

							<Box sx={{ width: { xs: "100%", sm: "calc(33.33% - 11px)" } }}>
								<TextField
									fullWidth
									label='Color'
									name='color'
									value={carFormData.color}
									onChange={handleNewCarChange}
									error={!!errors.color}
									helperText={errors.color}
								/>
							</Box>
							<Box sx={{ width: { xs: "100%", sm: "calc(33.33% - 11px)" } }}>
								<TextField
									fullWidth
									label='License No.'
									name='license_plate'
									value={carFormData.license_plate}
									onChange={handleNewCarChange}
									error={!!errors.license_plate}
									helperText={errors.license_plate}
								/>
							</Box>

							<Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}>
								<TextField
									fullWidth
									label='Price per Hour'
									name='price_per_hour'
									type='number'
									value={carFormData.price_per_hour}
									onChange={handleNewCarChange}
									error={!!errors.price_per_hour}
									helperText={errors.price_per_hour}
								/>
							</Box>

							<Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}>
								<TextField
									fullWidth
									label='Price per Day'
									name='price_per_day'
									type='number'
									value={carFormData.price_per_day}
									onChange={handleNewCarChange}
									error={!!errors.price_per_day}
									helperText={errors.price_per_day}
								/>
							</Box>
							<Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}>
								<TextField
									fullWidth
									label='Number of Seats'
									name='number_of_seats'
									type='number'
									value={carFormData.number_of_seats}
									onChange={handleNewCarChange}
									error={!!errors.number_of_seats}
									helperText={errors.number_of_seats}
								/>
							</Box>

							<Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}>
								<TextField
									fullWidth
									label='Luggage Capacity'
									name='luggage_capacity'
									type='number'
									value={carFormData.luggage_capacity}
									onChange={handleNewCarChange}
									error={!!errors.luggage_capacity}
									helperText={errors.luggage_capacity}
								/>
							</Box>

							<Box sx={{ width: { xs: "100%", sm: "calc(33.33% - 11px)" } }}>
								<FormControl fullWidth error={!!errors.fuel_type}>
									<InputLabel>Fuel Type</InputLabel>
									<Select
										name='fuel_type'
										value={carFormData.fuel_type}
										label='Fuel Type'
										onChange={handleNewCarChange}>
										<MenuItem value='petrol'>Petrol</MenuItem>
										<MenuItem value='diesel'>Diesel</MenuItem>
										<MenuItem value='electric'>Electric</MenuItem>
									</Select>
									{errors.fuel_type && <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>{errors.fuel_type}</Typography>}
								</FormControl>
							</Box>
							<Box sx={{ width: { xs: "100%", sm: "calc(33.33% - 11px)" } }}>
								<FormControl fullWidth error={!!errors.car_type_id}>
									<InputLabel>Car Type</InputLabel>
									<Select
										name='car_type_id'
										value={carFormData.car_type_id}
										label='Car Type'
										onChange={handleNewCarChange}>
										{carTypes.map((type) => (
											<MenuItem key={type.car_type_id} value={type.car_type_id}>
												{type.type_name}
											</MenuItem>
										))}
									</Select>
									{errors.car_type_id && <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>{errors.car_type_id}</Typography>}
								</FormControl>
							</Box>
							<Box sx={{ width: { xs: "100%", sm: "calc(33.33% - 11px)" } }}>
								<FormControl fullWidth error={!!errors.transmission}>
									<InputLabel>Transmission</InputLabel>
									<Select
										name='transmission'
										value={carFormData.transmission}
										label='Transmission'
										onChange={handleNewCarChange}>
										<MenuItem value='auto'>Auto</MenuItem>
										<MenuItem value='manual'>Manual</MenuItem>
									</Select>
									{errors.transmission && <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>{errors.transmission}</Typography>}
								</FormControl>
							</Box>
							<Box sx={{ width: { xs: "100%" } }}>
								<FormControl fullWidth error={!!errors.office_location_id}>
									<InputLabel>
										Office Location
									</InputLabel>
									<Select
										name='office_location_id'
										value={carFormData.office_location_id}
										label='Office Location'
										onChange={handleNewCarChange}>
										{officeLocations.map((location) => (
											<MenuItem
												key={location.office_location_id}
												value={location.office_location_id}>
												{location.location_name}
											</MenuItem>
										))}
									</Select>
									{errors.office_location_id && <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>{errors.office_location_id}</Typography>}
								</FormControl>
							</Box>
						</Box>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseManageCarDialog}>Cancel</Button>
					<Button
						onClick={handleFormSubmit}
						variant='contained'
						disabled={isSubmitting}>
						{isSubmitting ? (
							<CircularProgress size={24} />
						) : (
							"Save Car"
						)}
					</Button>
				</DialogActions>
			</Dialog>

			<ConfirmDialog
				open={confirmDialog.open}
				onClose={() => setConfirmDialog({ open: false, car: null })}
				onConfirm={handleConfirmDelete}
				title="Delete Car"
				message={<>Are you sure you want to delete <strong>{confirmDialog.car?.model}</strong>? This action cannot be undone.</>}
				confirmText="Delete"
				cancelText="Cancel"
			/>
		</Box>
	);
};

export default CarManagement;
