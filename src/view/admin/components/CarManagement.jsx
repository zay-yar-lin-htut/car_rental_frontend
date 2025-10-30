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

const dataServices = createDataServices();

const dummyCars = [
	{
		id: 1,
		make: "Toyota",
		model: "Camry",
		year: 2021,
		color: "Silver",
		license_no: "YGN-1234",
		price_per_hour: 15,
		price_per_day: 100,
		seats: 5,
		description: "A reliable and comfortable sedan for city driving.",
		luggage_capacity: 2,
		transmission: "Automatic",
		owner_name: "John Doe",
		fuel_type: "Petrol",
		available: true,
		image_url: "https://via.placeholder.com/150/92c952",
	},
	{
		id: 2,
		make: "Honda",
		model: "CR-V",
		year: 2022,
		color: "Blue",
		license_no: "MDY-5678",
		price_per_hour: 20,
		price_per_day: 150,
		seats: 5,
		description: "Spacious SUV, perfect for family trips.",
		luggage_capacity: 4,
		transmission: "Automatic",
		owner_name: "Jane Smith",
		fuel_type: "Petrol",
		available: false,
		image_url: "https://via.placeholder.com/150/771796",
	},
];

const CarManagement = () => {
	const [cars, setCars] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [searchTerm, setSearchTerm] = useState("");
	const [availabilityFilter, setAvailabilityFilter] = useState("All");
	const [openAddDialog, setOpenAddDialog] = useState(false);
	const [newCar, setNewCar] = useState({
		make: "",
		model: "",
		year: "",
		color: "",
		license_no: "",
		price_per_hour: "",
		price_per_day: "",
		seats: "",
		description: "",
		luggage_capacity: "",
		transmission: "Automatic",
		fuel_type: "Petrol",
		available: true,
	});

	useEffect(() => {
		const fetchCars = () => {
			setLoading(true);
			// Simulate API call
			setTimeout(() => {
				setCars(dummyCars);
				setLoading(false);
			}, 1000); // 1-second delay
		};
		fetchCars();
	}, []);

	const handleSearchChange = (event) => {
		setSearchTerm(event.target.value);
	};

	const handleAvailabilityFilterChange = (event) => {
		setPage(0);
		setAvailabilityFilter(event.target.value);
	};

	const handleOpenAddDialog = () => {
		setOpenAddDialog(true);
	};

	const handleCloseAddDialog = () => {
		setOpenAddDialog(false);
		setNewCar({
			make: "",
			model: "",
			year: "",
			color: "",
			license_no: "",
			price_per_hour: "",
			price_per_day: "",
			seats: "",
			description: "",
			luggage_capacity: "",
			transmission: "Automatic",
			fuel_type: "Petrol",
			available: true,
		});
	};

	const handleNewCarChange = (event) => {
		const { name, value, type, checked } = event.target;
		setNewCar({
			...newCar,
			[name]: type === "checkbox" ? checked : value,
		});
	};

	const handleAddCar = () => {
		// In a real app, you would make an API call here.
		const carToAdd = {
			id: cars.length + 1,
			...newCar,
			owner_name: "Current User", // Placeholder for owner
			image_url: "https://via.placeholder.com/150/cccccc", // Placeholder image
		};
		setCars([...cars, carToAdd]);
		handleCloseAddDialog();
	};

	const handleEdit = (car) => {
		// In a real app, you would likely open the add/edit dialog with the car's data.
		console.log("Edit car", car);
		alert(`Editing ${car.make} ${car.model}`);
	};

	const handleDelete = async (car) => {
		if (!window.confirm("Delete this car?")) return;
		try {
			// This is a placeholder for a real API call.
			// await dataServices.retrieveDELETE("cars", `/${car.id}`);
			setCars((prev) => prev.filter((c) => c.id !== car.id));
		} catch (err) {
			console.error("Delete failed", err);
			alert("Delete failed: " + (err.message || ""));
		}
	};

	const filteredCars = useMemo(() => {
		return cars
			.filter((car) => {
				if (availabilityFilter === "All") return true;
				if (availabilityFilter === "Available") return car.available;
				if (availabilityFilter === "Unavailable") return !car.available;
				return true;
			})
			.filter((car) => {
				if (!searchTerm) return true;
				const searchTermLower = searchTerm.toLowerCase();
				return (
					car.make.toLowerCase().includes(searchTermLower) ||
					car.model.toLowerCase().includes(searchTermLower) ||
					car.license_no.toLowerCase().includes(searchTermLower)
				);
			});
	}, [cars, searchTerm, availabilityFilter]);

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
					src={car.image_url || car.photo || ""}
					alt={car.model || "car"}
					style={{
						width: 100,
						height: 60,
						objectFit: "cover",
						borderRadius: 4,
					}}
				/>
			),
		},
		{
			id: "model",
			label: "Model",
			render: (car) => (
				<div>
					<div>{[car.make, car.model, car.year].filter(Boolean).join(" ")}</div>
					<div style={{ fontSize: "0.75rem", color: "gray" }}>
						{car.model_variant || ""}
					</div>
				</div>
			),
		},
		{ id: "license_no", label: "License No" },
		{
			id: "price_per_day",
			label: "Price / day",
			align: "right",
			render: (car) =>
				car.price_per_day != null ? `$${car.price_per_day}` : "-",
		},
		{ id: "seats", label: "Seats", align: "center" },

		{ id: "luggage_capacity", label: "Luggage", align: "center" },
		{ id: "transmission", label: "Transmission", align: "center" },
		{
			id: "owner_name",
			label: "Owner",
			render: (car) => car.owner_name || car.owner || "-",
		},
		{ id: "fuel_type", label: "Fuel", align: "center" },
		{
			id: "available",
			label: "Available",
			align: "center",
			render: (car) => (
				<Chip
					label={car.available ? "Yes" : "No"}
					color={car.available ? "success" : "error"}
					size='small'
				/>
			),
		},
		{
			id: "actions",
			label: "Action",
			align: "center",
			render: (car) => (
				<>
					<Tooltip title='Edit Car'>
						<IconButton onClick={() => handleEdit(car)}>
							<EditIcon />
						</IconButton>
					</Tooltip>
					<Tooltip title='Delete Car'>
						<IconButton onClick={() => handleDelete(car)}>
							<DeleteIcon />
						</IconButton>
					</Tooltip>
				</>
			),
		},
	];

	return (
		<Paper
			sx={{
				p: 2,
				// bgcolor: "var(--background-paper)",
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
					onChange={handleSearchChange}
					sx={{ flexGrow: 1, minWidth: "250px" }}
				/>
				<FormControl
					variant='outlined'
					sx={{ minWidth: 120 }}>
					<InputLabel>Availability</InputLabel>
					<Select
						value={availabilityFilter}
						onChange={handleAvailabilityFilterChange}
						label='Availability'>
						<MenuItem value='All'>All</MenuItem>
						<MenuItem value='Available'>Available</MenuItem>
						<MenuItem value='Unavailable'>Unavailable</MenuItem>
					</Select>
				</FormControl>
				<Button
					variant='contained'
					startIcon={<AddIcon />}
					onClick={handleOpenAddDialog}>
					Add Car
				</Button>
			</Box>

			<ReusableTable
				columns={columns}
				data={filteredCars}
				loading={loading}
				error={error}
				page={page}
				rowsPerPage={rowsPerPage}
				total={filteredCars.length}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				keyExtractor={(car) => car.id || car.license_no}
			/>

			<Dialog
				open={openAddDialog}
				onClose={handleCloseAddDialog}
				maxWidth='md'
				fullWidth>
				<DialogTitle>Add New Car</DialogTitle>
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
						<Box sx={{ width: { xs: "100%", md: "40%" } }}>
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
									cursor: "pointer",
									backgroundColor: "action.hover",
									minHeight: { xs: 200, md: "auto" },
								}}>
								<CloudUploadIcon
									sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
								/>
								<Typography
									variant='h6'
									gutterBottom>
									Click to upload
								</Typography>
								<Typography
									variant='body2'
									color='text.secondary'>
									PNG, JPG, GIF up to 10MB
								</Typography>
								{/* Hidden input for file upload */}
								<input
									type='file'
									hidden
									accept='image/*'
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
									value={newCar.model}
									onChange={handleNewCarChange}
								/>
							</Box>
							<Box sx={{ width: { xs: "100%", sm: "calc(33.33% - 11px)" } }}>
								<TextField
									fullWidth
									label='Year'
									name='year'
									type='number'
									value={newCar.year}
									onChange={handleNewCarChange}
								/>
							</Box>
							<Box sx={{ width: { xs: "100%", sm: "calc(33.33% - 11px)" } }}>
								<TextField
									fullWidth
									label='Color'
									name='color'
									value={newCar.color}
									onChange={handleNewCarChange}
								/>
							</Box>
							<Box sx={{ width: { xs: "100%", sm: "calc(33.33% - 11px)" } }}>
								<TextField
									fullWidth
									label='License No.'
									name='license_no'
									value={newCar.license_no}
									onChange={handleNewCarChange}
								/>
							</Box>
							<Box sx={{ width: { xs: "100%", sm: "calc(33.33% - 11px)" } }}>
								<TextField
									fullWidth
									label='Seats'
									name='seats'
									type='number'
									value={newCar.seats}
									onChange={handleNewCarChange}
								/>
							</Box>
							<Box sx={{ width: { xs: "100%", sm: "calc(33.33% - 11px)" } }}>
								<FormControl fullWidth>
									<InputLabel>Own By</InputLabel>
									<Select
										name='owner_id'
										value={newCar.owner_id}
										label='Owner'
										onChange={() => {} /* Placeholder */}>
										<MenuItem value='Company'>Company</MenuItem>
										<MenuItem value='User'>User</MenuItem>
									</Select>
								</FormControl>
							</Box>
							<Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}>
								<TextField
									fullWidth
									label='Price per Hour'
									name='price_per_hour'
									type='number'
									value={newCar.price_per_hour}
									onChange={handleNewCarChange}
								/>
							</Box>
							<Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)" } }}>
								<TextField
									fullWidth
									label='Price per Day'
									name='price_per_day'
									type='number'
									value={newCar.price_per_day}
									onChange={handleNewCarChange}
								/>
							</Box>
							{/* <Box sx={{ width: "100%" }}>
								<TextField
									fullWidth
									label='Description'
									name='description'
									multiline
									rows={3}
									value={newCar.description}
									onChange={handleNewCarChange}
								/>
							</Box> */}
							<Box sx={{ width: { xs: "100%", sm: "calc(25% - 12px)" } }}>
								<TextField
									fullWidth
									label='Luggage Capacity'
									name='luggage_capacity'
									type='number'
									value={newCar.luggage_capacity}
									onChange={handleNewCarChange}
								/>
							</Box>
							<Box sx={{ width: { xs: "100%", sm: "calc(25% - 12px)" } }}>
								<FormControl fullWidth>
									<InputLabel>Transmission</InputLabel>
									<Select
										name='transmission'
										value={newCar.transmission}
										label='Transmission'
										onChange={handleNewCarChange}>
										<MenuItem value='Automatic'>Automatic</MenuItem>
										<MenuItem value='Manual'>Manual</MenuItem>
									</Select>
								</FormControl>
							</Box>
							<Box sx={{ width: { xs: "100%", sm: "calc(25% - 12px)" } }}>
								<FormControl fullWidth>
									<InputLabel>Fuel Type</InputLabel>
									<Select
										name='fuel_type'
										value={newCar.fuel_type}
										label='Fuel Type'
										onChange={handleNewCarChange}>
										<MenuItem value='Petrol'>Petrol</MenuItem>
										<MenuItem value='Diesel'>Diesel</MenuItem>
										<MenuItem value='Electric'>Electric</MenuItem>
									</Select>
								</FormControl>
							</Box>
							<Box
								sx={{
									width: { xs: "100%", sm: "calc(25% - 12px)" },
									display: "flex",
									alignItems: "center",
								}}>
								<FormControlLabel
									control={
										<Switch
											checked={newCar.available}
											onChange={handleNewCarChange}
											name='available'
										/>
									}
									label='Available'
								/>
							</Box>
						</Box>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseAddDialog}>Cancel</Button>
					<Button
						onClick={handleAddCar}
						variant='contained'>
						Add Car
					</Button>
				</DialogActions>
			</Dialog>
		</Paper>
	);
};

export default CarManagement;
