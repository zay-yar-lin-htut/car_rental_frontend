import React, { useEffect, useState, useMemo } from "react";
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
	useTheme,
	Pagination,
	Fab,
	Zoom,
} from "@mui/material";

import { useNavigate, Link, useSearchParams } from "react-router";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { createDataServices } from "../../services/DataServices";
import { API_ENDPOINTS, AUTH_CONFIG } from "../../services/Configuration";
import { useSnackbar } from "../../contexts/ErrorMessage";

import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PeopleIcon from "@mui/icons-material/People";
import WorkIcon from "@mui/icons-material/Work";
import FlareIcon from "@mui/icons-material/Flare";
import Review from "./Review";
import InputLabel from "@mui/material/InputLabel";
import BookingLayout from "./BookingLayout";
import FullPageLoader from "../../common/FullPageLoader";
import dayjs from "dayjs";
import CommonAppBar from "../common/AppBar";



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
	const max = 10;

	const [totalPages, setTotalPages] = useState(0);
	const [fuelType, setFuelType] = useState("");
	const [carTypeId, setCarTypeId] = useState("");
	const [sortOrder, setSortOrder] = useState("Low to High");
	const [showBackToTop, setShowBackToTop] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const searchBy = useMemo(() => searchParams.get('search_by') || '', [searchParams]);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isContactUsOpen, setContactUsOpen] = useState(false);
	const [logouting, setLogouting] = useState(false);
	const isLogin = AUTH_CONFIG.isAuthenticated();

	const handleLogout = () => {
		setLogouting(true);
		AUTH_CONFIG.clearToken();
		AUTH_CONFIG.clearUserData();
		navigate("/");
	};
	useEffect(() => {
		setSearchTerm(searchBy);
	}, [searchBy]);

	useEffect(() => {
		// Simulate a data fetch or processing delay
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1500); // 1.5 seconds delay

		// Cleanup the timer if the component unmounts
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		setSearchTerm(searchBy);
	}, [searchBy]);

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
			const pickupDateTime = formValues.pickupDate && formValues.pickupTime
				? dayjs(formValues.pickupDate).hour(dayjs(formValues.pickupTime).hour()).minute(dayjs(formValues.pickupTime).minute())
						.toISOString()
						.slice(0, 19)
						.replace("T", " ")
				: "";
			const dropoffDateTime = formValues.dropDate && formValues.dropTime
				? dayjs(formValues.dropDate).hour(dayjs(formValues.dropTime).hour()).minute(dayjs(formValues.dropTime).minute())
						.toISOString()
						.slice(0, 19)
						.replace("T", " ")
				: "";
			const getCoords = (location) => {
				if (!location) return [null, null];
				const coords = location.location || location.position || location.latlng;
				return Array.isArray(coords) ? coords : [null, null];
			};

			const [pickupLat, pickupLon] = getCoords(formValues.pickupLocation);

			const params = new URLSearchParams({
				first: page,
				max: max,
				pickup_datetime: pickupDateTime,
				dropoff_datetime: dropoffDateTime,
				pickup_latitude: pickupLat,
				pickup_longitude: pickupLon,
				car_type_id: carTypeId,
				fuel_type: fuelType,
				availibility: true,
				asc_total: sortOrder === "Low to High" ? "true" : "false",
			});
			if (searchBy) params.append('search_by', searchBy);

			const response = await dataServices().retrieve(
				API_ENDPOINTS.cars.base,
				`${API_ENDPOINTS.cars.getAll}?${params.toString()}`
			);
			let fetchedVehicles = response.data.data || [];
			// Sort vehicles client-side based on sortOrder
			fetchedVehicles.sort((a, b) => {
				const aPrice = a.total_price || 0;
				const bPrice = b.total_price || 0;
				if (sortOrder === "Low to High") {
					return aPrice - bPrice;
				} else {
					return bPrice - aPrice;
				}
			});
			setVehicles(fetchedVehicles);
			setTotalPages(Math.ceil(response.data.total / max));
		} catch (error) {
			showSnackbar(error.message, "error");
		} finally {
			setIsVehiclesLoading(false);
		}
	};

	useEffect(() => {
		fetchVehicles();
	}, [page, max, fuelType, carTypeId, sortOrder, searchBy]);

	useEffect(() => {
		setPage(1);
	}, [searchBy]);

	useEffect(() => {
		if (formValues.pickupDate) {
			fetchVehicles();
		}
	}, [formValues]);

	const handleFuelTypeChange = (e) => {
		setFuelType(e.target.value);
		setPage(1); // Reset to first page on filter change
	};

	const handleCarTypeChange = (e) => {
		setCarTypeId(e.target.value);
		setPage(1);
	};

	const handleSortChange = (e) => {
		setSortOrder(e.target.value);
		setPage(1);
	};

	// Helper to safely format dates, returning an empty string if the date is invalid/null

  if (isLoading) {
    return <FullPageLoader message="Finding your ride..." />;
  }

	const renderCostCalculation = (vehicle) => {
		return (
			<Box sx={{ textAlign: "right", width: "100%", mb: 1 }}>
				<Box>
					<Typography
						variant='h6'
						component='span'
						sx={{ fontWeight: 600 }}>
						{vehicle.total_price ? vehicle.total_price.toLocaleString() : "N/A"}
					</Typography>
					<Typography
						variant='body2'
						component='span'
						color='text.secondary'>
						{" MMK total"}
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
 			pickupLocation: null,
 			dropoffLocation: null,
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
		<Box>
			<CommonAppBar
				navLinks={[]}
				isLogin={isLogin}
				handleLogout={handleLogout}
				isLogouting={logouting}
				isMenuOpen={isMenuOpen}
				setIsMenuOpen={setIsMenuOpen}
				setContactUsOpen={setContactUsOpen}
				hideNavbarOnMobile={false}
			/>
				<BookingLayout title='Choose Your Vehicle'>
					<>
						<Box
							sx={{
								display: "flex",
								flexDirection: { xs: "column", md: "row" },
								gap: 3,
								p: 3,
							}}>
							{/* Left Sidebar: Filters */}
							<Box
								sx={{
									width: { xs: "100%", md: "20%" },
									minWidth: 200,
								}}>
								<Paper
									sx={{
										p: 2,
										bgcolor: "background.paper",
										borderRadius: 2,
									}}>
									<Typography variant='h6' gutterBottom>
										Filters
									</Typography>
									<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
										<FormControl fullWidth sx={{ minHeight: 56 }}>
											<InputLabel>Car Type</InputLabel>
											<Select
												value={carTypeId}
												label='Car Type'
												onChange={handleCarTypeChange}>
												<MenuItem value=''>
													<em>All Types</em>
												</MenuItem>
												{carTypes.map((type) => (
													<MenuItem key={type.car_type_id} value={type.car_type_id}>
														{type.type_name}
													</MenuItem>
												))}
											</Select>
										</FormControl>
										<FormControl fullWidth sx={{ minHeight: 56 }}>
											<InputLabel>Fuel Type</InputLabel>
											<Select
												value={fuelType}
												label='Fuel Type'
												onChange={handleFuelTypeChange}>
												<MenuItem value=''>
													<em>All Fuels</em>
												</MenuItem>
												<MenuItem value='petrol'>Petrol</MenuItem>
												<MenuItem value='diesel'>Diesel</MenuItem>
												<MenuItem value='electric'>Electric</MenuItem>
											</Select>
										</FormControl>
										<FormControl fullWidth sx={{ minHeight: 56 }}>
											<InputLabel>Sort by</InputLabel>
											<Select
												value={sortOrder}
												label='Sort by'
												onChange={handleSortChange}>
												<MenuItem value='Low to High'>Low to High</MenuItem>
												<MenuItem value='High to Low'>High to Low</MenuItem>
											</Select>
										</FormControl>
									</Box>
								</Paper>
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
								<Box sx={{ width:"100%", mb: 2, display: "flex" }}>
									<TextField
										label="Search by model, type..."
										variant="outlined"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												setSearchParams(searchTerm ? { search_by: searchTerm } : {});
											}
										}}
										sx={{ minWidth: "100%" }}
									/>
								</Box>
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
						) : (
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
								<Box sx={{ width:"100%", mb: 2, display: "flex" }}>
									<TextField
										label="Search by model, type..."
										variant="outlined"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												setSearchParams(searchTerm ? { search_by: searchTerm } : {});
											}
										}}
										sx={{ minWidth: "100%" }}
									/>
								</Box>
								{vehicles.length > 0 ? (
									<>
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
											image={dataServices().retrieveImage(vehicle.car_image_url)}
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
								{totalPages > 1 && (
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
									</>
								) : (
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
										<Typography
											align='center'
											sx={{ my: 4, color: "text.secondary" }}>
											No vehicles found matching your criteria.
										</Typography>
									</Box>
								)}
							</Box>
						)}
							</Box>
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
					</>
				</BookingLayout>
		</Box>
	);
};

export default Ride;
