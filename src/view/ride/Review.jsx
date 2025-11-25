import React, { useMemo, useEffect, useState } from "react";
import { useIntroForm } from "../../contexts/IntroFormProvider";
import { useSnackbar } from "../../contexts/ErrorMessage";
import { useNavigate, Link } from "react-router-dom";
import dayjs from "dayjs";
import {
	Box,
	Paper,
	Typography,
	Button,
	Divider,
	Card,
	CardMedia,
	CardContent,
	Skeleton,
	CircularProgress,
	useTheme,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	AppBar,
	Toolbar,
	useMediaQuery,
	IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { createDataServices } from "../../services/DataServices";
import { API_ENDPOINTS, AUTH_CONFIG } from "../../services/Configuration";
import BookingLayout from "./BookingLayout";
import { calculateRentalCost } from "./costCalculator";


const Review = ({ onBackToSelect }) => {
	const { formValues, resetForm } = useIntroForm();
	const theme = useTheme();
	const { showSnackbar } = useSnackbar();
	const [isConfirming, setIsConfirming] = useState(false);
	const navigate = useNavigate();
	const dataServices = useMemo(() => createDataServices(), []);
	const [fineDetails, setFineDetails] = useState(null);

	const TopAppBar = () => {
		const theme = useTheme();
		const isMobile = useMediaQuery(theme.breakpoints.down('md'));
		const [scrolled, setScrolled] = useState(false);

		useEffect(() => {
			const handleScroll = () => {
				setScrolled(window.scrollY > 10);
			};
			window.addEventListener("scroll", handleScroll);
			return () => window.removeEventListener("scroll", handleScroll);
		}, []);

		const handleLogout = () => {
			AUTH_CONFIG.clearToken();
			AUTH_CONFIG.clearUserData();
			navigate("/");
		};

		const isLogin = AUTH_CONFIG.isAuthenticated();

		return (
			<AppBar
				position='fixed'
				elevation={scrolled ? 4 : 0}
				sx={{
					py: 1,
					zIndex: 100,
					backgroundColor: "rgba(111, 111, 111, 0.9)",
					color: "var(--text-color)",
					px: { xs: 2, md: 4 },
					backdropFilter: scrolled ? "blur(10px)" : "none",
					transition:
						"background-color 0.3s ease, box-shadow 0.3s ease, py 0.3s ease, transform 0.3s ease",
				}}>
				<Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
					<Typography
						variant='h6'
						component='div'
						sx={{
							fontWeight: "bold",
							fontFamily: "'Orbitron', sans-serif",
							fontSize: { xs: "0.9rem", sm: "1.2rem", md: "1.5rem" },
						}}>
						JOURNEY WHEEL
					</Typography>
					<Box sx={{ display: { xs: "none", md: "block" } }}>
						<Button
							variant='contained'
							sx={{
								py: 1.5,
								fontSize: "1rem",
								fontWeight: "bold",
								bgcolor: "error.main",
								color: "white",
								"&:hover": { bgcolor: "error.dark" },
								"&.Mui-disabled": { bgcolor: "rgba(0, 0, 0, 0.12)" },
							}}
							onClick={handleLogout}>
							Sign Out
						</Button>
					</Box>
					<Box sx={{ display: { md: "none" } }}>
						{isLogin ? (
							<IconButton
								color='inherit'
								aria-label='logout'
								onClick={handleLogout}>
								<MenuIcon />
							</IconButton>
						) : (
							<Button
								variant='contained'
								sx={{
									py: 1.5,
									fontSize: "1rem",
									fontWeight: "bold",
									bgcolor: "var(--primary-color)",
									color: "var(--primary-contrast-text)",
									"&:hover": { bgcolor: "var(--primary-color)" },
									"&.Mui-disabled": { bgcolor: "rgba(0, 0, 0, 0.12)" },
								}}
								component={Link}
								to='/login'>
								Sign In
							</Button>
						)}
					</Box>
				</Toolbar>
			</AppBar>
		);
	};



	// Redirect if essential data is missing
	useEffect(() => {
		if (
			!formValues.pickupDate ||
			!formValues.dropDate ||
			!formValues.vehicleType
		) {
			showSnackbar("Your session is incomplete. Please start over.", "warning");
			navigate("/");
		}
	}, [formValues, navigate, showSnackbar]);
	console.log("FormValue", formValues);

	const handleConfirmBooking = async () => {
		const getCoords = (location) => {
			if (!location) return [null, null];
			return location.location || location.position || [null, null];
		};

		const pickupCoords = getCoords(formValues.pickupLocation);
		const dropoffCoords = getCoords(formValues.dropoffLocation);

		if (!pickupCoords || !Array.isArray(pickupCoords) || pickupCoords.length < 2 || !pickupCoords[0] || !pickupCoords[1] ||
			(!formValues.dropSameAsPickup && (!dropoffCoords || !Array.isArray(dropoffCoords) || dropoffCoords.length < 2 || !dropoffCoords[0] || !dropoffCoords[1]))) {
			showSnackbar(
				"Invalid location data. Please select locations again.",
				"error"
			);
			return;
		}

		setIsConfirming(true);
		try {
		const bookingData = {
			car_id: formValues.vehicleType.car_id,
			pickup_date: dayjs(formValues.pickupDate).format("YYYY-MM-DD"),
			pickup_time: dayjs(formValues.pickupTime).format("HH:mm:ss"),
			dropoff_date: dayjs(formValues.dropDate).format("YYYY-MM-DD"),
			dropoff_time: dayjs(formValues.dropTime).format("HH:mm:ss"),
			pickup_latitude: pickupCoords[0],
			pickup_longitude: pickupCoords[1],
			dropoff_latitude: formValues.dropSameAsPickup ? pickupCoords[0] : dropoffCoords[0],
			dropoff_longitude: formValues.dropSameAsPickup ? pickupCoords[1] : dropoffCoords[1],
			total_amount: costDetails.totalCost,
		};

			// Assuming you have a 'bookings' endpoint configured
			const response = await dataServices.retrievePOST(
				bookingData,
				API_ENDPOINTS.bookings.create
			);

			if (!response.success) {
				showSnackbar(response.message, "error");
			} else {
				showSnackbar(response.message, "success");
				resetForm();
				navigate("/");
			}
		} catch (error) {
			showSnackbar(
				error.message || "An error occurred while confirming the booking.",
				"error"
			);
		} finally {
			setIsConfirming(false);
		}
	};

	const formatDate = (date) => (date ? dayjs(date).format("MM/DD/YYYY") : "");
	const formatTime = (time) => (time ? dayjs(time).format("hh:mm A") : "");

	const costDetails = useMemo(() => {
		return calculateRentalCost(formValues, formValues.vehicleType);
	}, [formValues, formValues.vehicleType]);



	useEffect(() => {
		const checkIsHaveFine = async () => {
			try {
				const response = await dataServices().retrieve(
					API_ENDPOINTS.users.base,
					API_ENDPOINTS.users.isHaveFine
				);

				if (response.data.have_fine && response.data.data["Total Fine"] > 0) {
					setFineDetails(response.data.data);
				}
			} catch (err) {
				// Fail silently if user is not logged in or there's an error.
				// showSnackbar("Could not fetch fines status.", "error");
			}
		};
		checkIsHaveFine();
	}, []);

	return (
		<Box>
			<TopAppBar />
			<BookingLayout title='Review Your Booking'>
				<Box
					sx={{
						p: 3,
					}}>
				{/*  Row: Rental Details and Cost Summary (Full Width) */}
				<Box sx={{ width: "100%" }}>
					{/* Rental Details */}
					<Paper
						variant='outlined'
						sx={{ p: 3, mb: 3, bgcolor: "background.paper" }}>
						<Typography
							variant='h6'
							fontWeight='bold'
							gutterBottom>
							Rental Details
						</Typography>
						<Box sx={{ mb: 2 }}>
							<Typography
								variant='body1'
								fontWeight='medium'
								color='text.secondary'>
								Dates & Times
							</Typography>
							<Typography variant='body1'>
								{`${formatDate(formValues.pickupDate)} @ ${formatTime(
									formValues.pickupTime
								)} — ${formatDate(formValues.dropDate)} @ ${formatTime(
									formValues.dropTime
								)}`}
							</Typography>
						</Box>
						<Divider sx={{ my: 2 }} />
						<Box>
							<Typography
								variant='body1'
								fontWeight='medium'
								color='text.secondary'>
								Pick-up & Return Location
							</Typography>
							<Typography variant='body1'>
								<strong>From:</strong> {formValues.pickupLocation?.name}
								<br />
								<strong>To:</strong>{" "}
								{formValues.dropSameAsPickup
									? formValues.pickupLocation?.name
									: formValues.dropoffLocation?.name}
							</Typography>
						</Box>
					</Paper>
				</Box>

				{/* Vehicle Details */}
				<Paper
					variant='outlined'
					sx={{ p: 3, mb: 3, bgcolor: "background.paper" }}>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}>
						<Typography
							variant='h6'
							fontWeight='bold'
							gutterBottom>
							Vehicle Details
						</Typography>
					</Box>
					<Card
						variant='outlined'
						sx={{ border: `1px solid ${theme.palette.divider}` }}>
						<CardMedia
							component='img'
							image={dataServices.retrieveImage(
								formValues.vehicleType.car_type_image_url
							)}
							sx={{
								height: 240,
								objectFit: "contain",
								p: 1,
								borderRadius: 2,
							}}
							alt={formValues.vehicleType.type_name}
						/>
						<CardContent>
							<Typography
								variant='h6'
								fontWeight='bold'>
								{formValues.vehicleType.type_name}
							</Typography>
							<Typography
								variant='body1'
								color='text.secondary'>
								{formValues.vehicleType.description}
							</Typography>
						</CardContent>
					</Card>
				</Paper>

				<Box sx={{ width: "100%" }}>
					{/* Cost Summary */}
					<Paper
						variant='outlined'
						sx={{ p: 3, mb: 3, bgcolor: "background.paper" }}>
						<Typography
							variant='h6'
							fontWeight='bold'
							gutterBottom>
							Cost Summary
						</Typography>
						{costDetails && (
							<Box>
								<Typography
									variant='body1'
									color='text.secondary'>
									{costDetails.calculationText}
								</Typography>
								<Typography
									variant='h5'
									fontWeight='bold'
									sx={{ my: 1 }}>
									Total: {costDetails.totalCost.toFixed(2)} USD
								</Typography>
							</Box>
						)}
					</Paper>
				</Box>

				{fineDetails && (
					<Paper
						variant='outlined'
						sx={{ p: 3, mb: 3, borderColor: "error.main" }}>
						<Typography
							variant='h6'
							fontWeight='bold'
							color='error'
							gutterBottom>
							Outstanding Fines
						</Typography>
						<Typography color='error'>
							You have outstanding fines that must be paid before you can make a
							new booking.
						</Typography>
						<Box sx={{ mt: 2 }}>
							<Typography color='error'>
								No-show Fine: {fineDetails["No-show Fine"] || 0} USD
							</Typography>
							<Typography color='error'>
								Cancellation Fine: {fineDetails["Cancellation Fine"] || 0} USD
							</Typography>
							<Typography
								fontWeight='bold'
								mt={1}
								color='error'>
								Total Fine: {fineDetails["Total Fine"]} USD
							</Typography>
						</Box>
						{/* <Button
							variant='contained'
							color='error'
							onClick={() => navigate("/profile")}
							sx={{ mt: 2 }}>
							Pay Now
						</Button> */}
					</Paper>
				)}
				<Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
					<Button
						variant='contained'
						color='primary'
						size='large'
						disabled={isConfirming || fineDetails}
						onClick={handleConfirmBooking}
						sx={{ minWidth: 180 }}>
						{isConfirming ? (
							<CircularProgress
								size={24}
								color='inherit'
							/>
						) : (
							"Confirm Booking"
						)}
					</Button>
				</Box>
			</Box>
		</BookingLayout>
		</Box>
	);
};

export default Review;
