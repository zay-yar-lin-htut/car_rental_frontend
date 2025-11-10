import React, { useEffect, useState, useMemo } from "react";
import { createDataServices } from "../../../services/DataServices";
import ReusableTable from "./ReusableTable";
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
	const [sort, setSort] = useState({ by: "created_at", order: "desc" });
	const [openManageCarDialog, setOpenManageCarDialog] = useState(false);

	const [selectedFile, setSelectedFile] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [editingCar, setEditingCar] = useState(null); // State to hold the car being edited
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
	});

	const fetchCars = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams({
				first: page + 1,
				max: rowsPerPage,
				search_by: debouncedSearchTerm,
				filter_by:
					availabilityFilter === "All" ? "" : availabilityFilter.toLowerCase(),
				sort_by: sort.by,
				order: sort.order,
			});

			const response = await dataServices.retrieve(
				API_ENDPOINTS.cars.base,
				`${API_ENDPOINTS.cars.getAll}?${params.toString()}`
			);
			setCars(response.data.cars || []);
			setTotalCars(response.data.totalCars || 0);
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
	}, [page, rowsPerPage, debouncedSearchTerm, availabilityFilter, sort]);

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
			transmission: "Automatic",
			fuel_type: "petrol",
			car_type_id: "",

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
		}
	};

	const handleOpenAddDialog = () => {
		setOpenManageCarDialog(true);
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
			ownership_condition: "",
		});
		setImagePreview(null);
		setSelectedFile(null);
	};

	const handleFormSubmit = () => {
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
		setEditingCar(car);
		console.log("car", car);

		setCarFormData({
			...car,
			license_plate: car.license_plate,
			car_type_id: car.car_type_id || "",
		});
		setImagePreview(car.car_image_url);
		setSelectedFile(null); // Clear previous file selection
		setOpenManageCarDialog(true);
	};

	const handleDelete = async (car) => {
		if (!window.confirm(`Are you sure you want to delete ${car.model}?`))
			return;

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

	const columns = [
		{
			id: "image",
			label: "Image",
			render: (car) => (
				<img
					src={car.car_image_url || undefined}
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
					? `$${Number(car.price_per_day).toFixed(2)}`
					: "-",
		},
		{
			id: "number_of_seats",
			label: "number_of_seats",
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
			id: "owner_name",
			label: "Owner",
			render: (car) => car.owner_name || car.ownership_condition || "-",
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
					<Tooltip title='Delete Car'>
						<IconButton onClick={() => handleDelete(car)}>
							<DeleteIcon
								style={{
									color: "var(--error-color)",
								}}
							/>
						</IconButton>
					</Tooltip>
				</>
			),
		},
	];

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
					label='Search by make, model, license...'
					variant='outlined'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					sx={{ flexGrow: 1, minWidth: "250px" }}
				/>
				<FormControl
					variant='outlined'
					sx={{ minWidth: 120, color: "white" }}>
					<InputLabel>Availability</InputLabel>
					<Select
						value={availabilityFilter}
						onChange={handleAvailabilityFilterChange}
						label='Availability'
						sx={{
							color: "white",
						}}>
						<MenuItem value='All'>All</MenuItem>
						<MenuItem value='Available'>Available</MenuItem>
						<MenuItem value='Unavailable'>Unavailable</MenuItem>
					</Select>
				</FormControl>
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
									InputLabelProps={{ style: { color: "white" } }}
								/>
							</Box>

							<Box sx={{ width: { xs: "100%", sm: "calc(33.33% - 11px)" } }}>
								<TextField
									fullWidth
									label='Color'
									name='color'
									value={carFormData.color}
									onChange={handleNewCarChange}
									InputLabelProps={{ style: { color: "white" } }}
								/>
							</Box>
							<Box sx={{ width: { xs: "100%", sm: "calc(33.33% - 11px)" } }}>
								<TextField
									fullWidth
									label='License No.'
									name='license_plate'
									value={carFormData.license_plate}
									onChange={handleNewCarChange}
									InputLabelProps={{ style: { color: "white" } }}
								/>
							</Box>
							<Box sx={{ width: { xs: "100%", sm: "calc(33.33% - 11px)" } }}>
								<TextField
									fullWidth
									label='number_of_seats'
									name='number_of_seats'
									type='number'
									value={carFormData.number_of_seats}
									onChange={handleNewCarChange}
									InputLabelProps={{ style: { color: "white" } }}
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
									InputLabelProps={{ style: { color: "white" } }}
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
									InputLabelProps={{ style: { color: "white" } }}
								/>
							</Box>

							<Box sx={{ width: { xs: "100%", sm: "calc(25% - 12px)" } }}>
								<TextField
									fullWidth
									label='Luggage Capacity'
									name='luggage_capacity'
									type='number'
									value={carFormData.luggage_capacity}
									onChange={handleNewCarChange}
									InputLabelProps={{ style: { color: "white" } }}
								/>
							</Box>
							<Box sx={{ width: { xs: "100%", sm: "calc(25% - 12px)" } }}>
								<FormControl fullWidth>
									<InputLabel sx={{ color: "white" }}>Transmission</InputLabel>
									<Select
										name='transmission'
										value={carFormData.transmission}
										label='Transmission'
										onChange={handleNewCarChange}>
										<MenuItem value='auto'>Auto</MenuItem>
										<MenuItem value='manual'>Manual</MenuItem>
									</Select>
								</FormControl>
							</Box>
							<Box sx={{ width: { xs: "100%", sm: "calc(25% - 12px)" } }}>
								<FormControl fullWidth>
									<InputLabel sx={{ color: "white" }}>Fuel Type</InputLabel>
									<Select
										name='fuel_type'
										value={carFormData.fuel_type}
										label='Fuel Type'
										onChange={handleNewCarChange}>
										<MenuItem value='petrol'>Petrol</MenuItem>
										<MenuItem value='diesel'>Diesel</MenuItem>
										<MenuItem value='electric'>Electric</MenuItem>
									</Select>
								</FormControl>
							</Box>
							<Box sx={{ width: { xs: "100%", sm: "calc(25% - 12px)" } }}>
								<FormControl fullWidth>
									<InputLabel sx={{ color: "white" }}>Car Type</InputLabel>
									<Select
										name='car_type_id'
										value={carFormData.car_type_id}
										label='Car Type'
										onChange={handleNewCarChange}>
										<MenuItem value={1}>Small</MenuItem>
										<MenuItem value={2}>Medium</MenuItem>
										<MenuItem value={3}>Large</MenuItem>
										<MenuItem value={4}>Luxury</MenuItem>
										<MenuItem value={5}>People Carrier</MenuItem>
										<MenuItem value={6}>Van</MenuItem>
									</Select>
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
						) : editingCar ? (
							"Update Car"
						) : (
							"Add Car"
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default CarManagement;
