import React, { useEffect, useState } from "react";
import { useIntroForm } from "../../contexts/IntroFormProvider";
import {
	Box,
	CircularProgress,
	Typography,
	TextField,
	FormControlLabel,
	Checkbox,
	Button,
	Paper,
	Grid,
	Card,
	CardActionArea,
	CardMedia,
	CardContent,
	Skeleton,
	Select,
	MenuItem,
	FormControl,
	Pagination,
	Fab,
	Zoom,
	useTheme,
} from "@mui/material";
import clsx from "clsx";
import { useNavigate } from "react-router";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { createDataServices } from "../../services/DataServices";
import { API_ENDPOINTS } from "../../services/Configuration";
import { useSnackbar } from "../../contexts/ErrorMessage";

import EventIcon from "@mui/icons-material/Event";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PeopleIcon from "@mui/icons-material/People";
import WorkIcon from "@mui/icons-material/Work";
import Divider from "@mui/material/Divider";
import FlareIcon from "@mui/icons-material/Flare";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { calculateRentalCost } from "./costCalculator";
import Review from "./Review";
import InputLabel from "@mui/material/InputLabel";
import BookingLayout from "./BookingLayout";

const Ride = () => {
	const theme = useTheme();
	const dataServices = () => createDataServices();
	const { formValues, setFormValues, isLoading, setIsLoading } = useIntroForm();
	const [isReviewing, setIsReviewing] = useState(false);
	const [vehicles, setVehicles] = useState([]);
	const [carTypes, setCarTypes] = useState([]);
	const [isVehiclesLoading, setIsVehiclesLoading] = useState(false);
	const { showSnackbar } = useSnackbar();
	const [page, setPage] = useState(1);
	const [max, setMax] = useState(10);
	const [asc, setAsc] = useState(true);
	const [totalPages, setTotalPages] = useState(0);
	const [fuelType, setFuelType] = useState("");
	const [carTypeId, setCarTypeId] = useState("");
	const [showBackToTop, setShowBackToTop] = useState(false);
	const navigate = useNavigate();
	useEffect(() => {
		// Simulate a data fetch or processing delay
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1500); // 1.5 seconds delay

		// Cleanup the timer if the component unmounts
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (!formValues.pickupDate && !formValues.dropDate) return navigate("/");

		const handleScroll = () => {
			if (window.pageYOffset > 300) {
				setShowBackToTop(true);
			} else {
				setShowBackToTop(false);
			}
		};

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	useEffect(() => {
		const fetchCarTypes = async () => {
			try {
				const response = await dataServices().retrieve(
					API_ENDPOINTS.carTypes.base,
					API_ENDPOINTS.carTypes.getAll
				);
				setCarTypes(response.data);
			} catch (error) {
				showSnackbar("Could not fetch car types.", "error");
			}
		};
		fetchCarTypes();
	}, []);

	const fetchVehicles = async () => {
		setIsVehiclesLoading(true);
		try {
			const pickupDateTime = formValues.pickupDate
				? new Date(formValues.pickupDate)
						.toISOString()
						.slice(0, 19)
						.replace("T", " ")
				: "";
			const dropoffDateTime = formValues.dropDate
				? new Date(formValues.dropDate)
						.toISOString()
						.slice(0, 19)
						.replace("T", " ")
				: "";

			const params = new URLSearchParams({
				first: page,
				max: max,
				asc_total: asc,
				pickup_datetime: pickupDateTime,
				dropoff_datetime: dropoffDateTime,
				car_type_id: carTypeId,
				fuel_type: fuelType,
			});
			console.log("params", params);

			const response = await dataServices().retrieve(
				API_ENDPOINTS.cars.base,
				`${API_ENDPOINTS.cars.getAll}?${params.toString()}`
			);
			setVehicles(response.data.cars);
			setTotalPages(Math.ceil(response.data.totalCars / max));
		} catch (error) {
			showSnackbar(error.message, "error");
		} finally {
			setIsVehiclesLoading(false);
		}
	};

	useEffect(() => {
		fetchVehicles();
		// This effect should re-run when any of these dependencies change. We don't add formValues to avoid extra calls.
	}, [page, max, asc, fuelType, carTypeId]);

	const handleFuelTypeChange = (e) => {
		setFuelType(e.target.value);
		setPage(1); // Reset to first page on filter change
	};

	const handleCarTypeChange = (e) => {
		setCarTypeId(e.target.value);
		setPage(1);
	};

	// Helper to safely format dates, returning an empty string if the date is invalid/null

	if (isLoading) {
		return (
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					height: "100vh",
					gap: 2,
				}}>
				<CircularProgress />
				<Typography variant='h6'>Finding your ride...</Typography>
			</Box>
		);
	}

	const renderCostCalculation = (vehicle) => {
		return (
			<Box sx={{ textAlign: "right", width: "100%", mb: 1 }}>
				<Box>
					<Typography
						variant='h6'
						component='span'
						sx={{ fontWeight: 600 }}>
						{vehicle.total_price.toLocaleString()}
					</Typography>
					<Typography
						variant='body2'
						component='span'
						color='text.secondary'>
						{" MMK  total"}
					</Typography>
				</Box>
			</Box>
		);
	};

	const handleVehicleSelect = (vehicle) => {
		setFormValues((prev) => ({ ...prev, vehicleType: vehicle }));
		setIsReviewing(true);
		window.scrollTo(0, 0);
	};

	const handleBackToSelect = () => {
		// Reset form values but keep the vehicle type for context if needed,
		// or reset completely by removing the vehicleType as well.
		setFormValues((prev) => ({
			...prev,
			pickupLocation: "",
			dropoffLocation: "",
		}));
		navigate("/");
	};

	const handlePageChange = (event, value) => {
		setPage(value);
		window.scrollTo(0, 0); // Scroll to top on page change
	};

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	if (isReviewing) {
		return <Review onBackToSelect={handleBackToSelect} />;
	}
	return (
		<BookingLayout title='Choose Your Vehicle'>
			<Box
				sx={{
					display: "flex",
					flexDirection: { xs: "column", sm: "row" },
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
					gap: 2,
				}}>
				<Box
					sx={{
						display: "flex",
						gap: 2,
						width: { xs: "100%", sm: "300px" },
					}}>
					<FormControl fullWidth>
						<InputLabel>Car Type</InputLabel>
						<Select
							value={carTypeId}
							label='Car Type'
							onChange={handleCarTypeChange}>
							<MenuItem value=''>
								<em>All Types</em>
							</MenuItem>
							{carTypes.map((type) => (
								<MenuItem
									key={type.car_type_id}
									value={type.car_type_id}>
									{type.type_name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControl fullWidth>
						<InputLabel>Fuel Type</InputLabel>
						<Select
							value={fuelType}
							label='Fuel Type'
							onChange={handleFuelTypeChange}>
							<MenuItem value=''>All</MenuItem>
							<MenuItem value='petrol'>Petrol</MenuItem>
							<MenuItem value='diesel'>Diesel</MenuItem>
							<MenuItem value='electric'>Electric</MenuItem>
						</Select>
					</FormControl>
				</Box>
				<Button
					onClick={() => {
						setPage(1);
						setAsc(!asc);
					}}
					variant='contained'>
					{asc ? "Price: Low to High" : "Price: High to Low"}
				</Button>
			</Box>
			{isVehiclesLoading ? (
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 4,
						width: "100%",
						maxWidth: "920px",
						mx: "auto",
						my: 4,
					}}>
					{Array.from(new Array(3)).map((_, index) => (
						<Box key={index}>
							<Card
								sx={{
									display: "flex",
									flexDirection: { xs: "column", sm: "row" },
									p: 2,
									borderRadius: 3,
								}}>
								<Skeleton
									variant='rectangular'
									sx={{
										width: { xs: "100%", sm: 180 },
										height: { xs: 150, sm: 120 },
										borderRadius: 2,
										mr: { xs: 0, sm: 2 },
									}}
								/>
								<CardContent sx={{ flex: 1, p: "0 !important" }}>
									<Skeleton
										variant='text'
										width='40%'
										sx={{ mb: 1 }}
									/>
									<Skeleton
										variant='text'
										width='80%'
									/>
									<Skeleton
										variant='text'
										width='60%'
									/>
								</CardContent>
								<Box sx={{ pl: { sm: 2 }, pt: { xs: 2, sm: 0 } }}>
									<Skeleton
										variant='rectangular'
										width={90}
										height={36}
										sx={{ borderRadius: 3 }}
									/>
								</Box>
							</Card>
						</Box>
					))}
				</Box>
			) : vehicles.length > 0 ? (
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 4,
						my: 4,
						width: "100%",
						maxWidth: "920px",
						mx: "auto",
					}}>
					{vehicles.map((vehicle) => (
						<Card
							sx={{
								display: "flex",
								flexDirection: { xs: "column", sm: "row" },
								p: { xs: 2, sm: 3 },
								bgcolor: "background.paper",
								borderRadius: 3,
								boxShadow: `0px 4px 12px ${theme.palette.primary.main}1A`,
								transition: "transform 0.2s ease",
								"&:hover": { transform: "scale(1.01)" },
								width: "100%",
							}}
							key={vehicle.car_id}>
							{/* Left Column: Car Image */}
							<CardMedia
								component='img'
								sx={{
									width: { xs: "100%", sm: 200 },
									height: { xs: 180, sm: 180 },
									objectFit: "contain",
									mr: { sm: 3 },
									borderRadius: 2,
								}}
								image={vehicle.car_image_url}
								alt={vehicle.type_name}
							/>

							{/* Middle Column: Details */}
							<CardContent
								sx={{
									flex: 1,
									p: "0 !important",
									pt: { xs: 2, sm: 0 },
									display: "flex",
									flexDirection: "column",
									justifyContent: "space-around",
								}}>
								<Typography
									variant='h6'
									fontSize={{ xs: "1.1rem", sm: "1.25rem" }} // Responsive font size
									sx={{ fontWeight: 600 }}>
									{vehicle.model || "Renault Captur or similar"}
								</Typography>
								<Typography
									color='text.secondary'
									sx={{ mb: 1 }}
									variant='body2'>
									{vehicle.car_type}
								</Typography>
								<Typography
									color='text.secondary'
									sx={{ mb: 1 }}
									variant='body2'>
									{vehicle.description}
								</Typography>

								<Box
									display='flex'
									alignItems='center'
									gap={2}
									flexWrap='wrap'>
									<Box
										display='flex'
										alignItems='center'
										gap={0.5}>
										<DirectionsCarIcon fontSize='small' />{" "}
										<Typography variant='body2'>
											{vehicle.transmission}
										</Typography>
									</Box>
									<Box
										display='flex'
										alignItems='center'
										gap={0.5}>
										<PeopleIcon fontSize='small' />{" "}
										<Typography variant='body2'>
											{vehicle.number_of_seats} People
										</Typography>
									</Box>
									<Box
										display='flex'
										alignItems='center'
										gap={0.5}>
										<WorkIcon fontSize='small' />{" "}
										<Typography variant='body2'>
											{vehicle.luggage_capacity} Bags
										</Typography>
									</Box>
									<Box
										display='flex'
										alignItems='center'
										gap={0.5}>
										<FlareIcon fontSize='small' />{" "}
										<Typography variant='body2'>{vehicle.fuel_type}</Typography>
									</Box>
								</Box>
							</CardContent>

							{/* Right Column: Price & Button */}
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "space-around",
									mt: { xs: 2, sm: 0 },
									minWidth: 160,
								}}>
								{renderCostCalculation(vehicle)}
								<Button
									variant='contained'
									color='primary'
									sx={{
										textTransform: "none",
										borderRadius: 3,
										fontWeight: 600,
										px: 3,
									}}
									onClick={() => handleVehicleSelect(vehicle)}>
									Select
								</Button>
							</Box>
						</Card>
					))}
				</Box>
			) : (
				<Typography
					align='center'
					sx={{ my: 4, color: "text.secondary" }}>
					No vehicles found matching your criteria.
				</Typography>
			)}
			{vehicles.length > 0 && totalPages > 1 && (
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						mt: 4,
					}}>
					<Pagination
						count={totalPages}
						page={page}
						onChange={handlePageChange}
						color='primary'
					/>
				</Box>
			)}
			<Zoom in={showBackToTop}>
				<Fab
					color='primary'
					size='small'
					onClick={scrollToTop}
					sx={{
						position: "fixed",
						bottom: 16,
						right: 16,
					}}>
					<KeyboardArrowUpIcon />
				</Fab>
			</Zoom>
		</BookingLayout>
	);
};

export default Ride;
