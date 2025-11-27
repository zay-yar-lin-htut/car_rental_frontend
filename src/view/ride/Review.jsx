import React, { useMemo, useEffect, useState } from "react";
import { useIntroForm } from "../../contexts/IntroFormProvider";
import { useSnackbar } from "../../contexts/ErrorMessage";
import { useNavigate } from "react-router-dom";
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
	CircularProgress,
	Stack,
	Alert,
	useTheme,
} from "@mui/material";
import { createDataServices } from "../../services/DataServices";
import { API_ENDPOINTS, AUTH_CONFIG } from "../../services/Configuration";
import BookingLayout from "./BookingLayout";
import { calculateRentalCost } from "./costCalculator";
import CommonAppBar from "../common/AppBar";
import {
	LocationOn,
	Schedule,
	DriveEta,
	AttachMoney,
	Event,
	ArrowBack,
} from "@mui/icons-material";

const Review = ({ onBackToSelect }) => {
	const { formValues, resetForm } = useIntroForm();
	const theme = useTheme();
	const { showSnackbar } = useSnackbar();
	const [isConfirming, setIsConfirming] = useState(false);

	const navigate = useNavigate();
	const dataServices = useMemo(() => createDataServices(), []);

	// AppBar state
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isContactUsOpen, setContactUsOpen] = useState(false);
	const [logouting, setLogouting] = useState(false);
	const isLogin = AUTH_CONFIG.isAuthenticated();

	const handleLogout = () => {
		setLogouting(true);
		AUTH_CONFIG.clearToken();
		AUTH_CONFIG.clearUserData();
		setTimeout(() => navigate("/"), 800);
	};

	// Redirect if form is incomplete
	useEffect(() => {
		if (
			!formValues.pickupDate ||
			!formValues.dropDate ||
			!formValues.vehicleType ||
			!formValues.pickupLocation
		) {
			showSnackbar("Booking session expired. Please start again.", "warning");
			navigate("/");
		}
	}, [formValues, navigate, showSnackbar]);



	// Calculate cost
	const costDetails = useMemo(() => {
		return calculateRentalCost(formValues, formValues.vehicleType);
	}, [formValues]);

	const formatDate = (date) => (date ? dayjs(date).format("MMM DD, YYYY") : "—");
	const formatTime = (time) => (time ? dayjs(time).format("hh:mm A") : "—");

	const handleConfirmBooking = async () => {
		const getCoords = (location) => {
			if (!location) return [null, null];
			const coords = location.location || location.position || location.latlng;
			return Array.isArray(coords) ? coords : [null, null];
		};

		const pickupCoords = getCoords(formValues.pickupLocation);
		const dropoffCoords = formValues.dropSameAsPickup
			? pickupCoords
			: getCoords(formValues.dropoffLocation);

		if (!pickupCoords[0] || !pickupCoords[1]) {
			showSnackbar("Invalid pickup location. Please select again.", "error");
			return;
		}

		if (!formValues.dropSameAsPickup && (!dropoffCoords[0] || !dropoffCoords[1])) {
			showSnackbar("Invalid dropoff location. Please select again.", "error");
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
				dropoff_latitude: dropoffCoords[0],
				dropoff_longitude: dropoffCoords[1],
				total_amount: costDetails?.totalCost || 0,
			};

			const response = await dataServices.retrievePOST(
				bookingData,
				API_ENDPOINTS.bookings.create
			);

			if (response.success) {
				showSnackbar("Booking confirmed successfully!", "success");
				resetForm();
				navigate("/");
			} else {
				showSnackbar(response.message || "Failed to create booking.", "error");
			}
		} catch (error) {
			showSnackbar(
				error.message || "Something went wrong. Please try again.",
				"error"
			);
		} finally {
			setIsConfirming(false);
		}
	};

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

			<BookingLayout title="Review Your Booking">
				<Stack spacing={4} sx={{ maxWidth: 800, mx: "auto" }}>


					{/* 1. Pickup & Dropoff */}
					<Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
							<Event color="primary" sx={{ mr: 1 }} />
							<Typography variant="h6" fontWeight="bold" color="primary">
								Pickup & Dropoff Details
							</Typography>
						</Box>
						<Divider sx={{ mb: 3 }} />

						<Stack spacing={3}>
							<Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
								<Schedule color="action" sx={{ mr: 2, mt: 0.5 }} />
								<Box>
									<Typography color="text.secondary" fontWeight="medium">
										Pickup
									</Typography>
									<Typography>
										<strong>{formatDate(formValues.pickupDate)}</strong> at{" "}
										<strong>{formatTime(formValues.pickupTime)}</strong>
									</Typography>
									<Typography variant="body2" color="text.secondary" mt={0.5}>
										{formValues.pickupLocation?.name || "Not selected"}
									</Typography>
								</Box>
							</Box>

							<Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
								<Schedule color="action" sx={{ mr: 2, mt: 0.5 }} />
								<Box>
									<Typography color="text.secondary" fontWeight="medium">
										Dropoff
									</Typography>
									<Typography>
										<strong>{formatDate(formValues.dropDate)}</strong> at{" "}
										<strong>{formatTime(formValues.dropTime)}</strong>
									</Typography>
									<Typography variant="body2" color="text.secondary" mt={0.5}>
										{formValues.dropSameAsPickup
											? "Same as pickup"
											: formValues.dropoffLocation?.name || "Not selected"}
									</Typography>
								</Box>
							</Box>
						</Stack>
					</Paper>

					{/* 2. Vehicle */}
					<Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
							<DriveEta color="primary" sx={{ mr: 1 }} />
							<Typography variant="h6" fontWeight="bold" color="primary">
								Selected Vehicle
							</Typography>
						</Box>
						<Divider sx={{ mb: 3 }} />

						<Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
							<CardMedia
								component="img"
								image={formValues.vehicleType.car_image_url}
								alt={formValues.vehicleType.model || formValues.vehicleType.type_name}
								sx={{
									height: { xs: 200, md: 280 },
									objectFit: "contain",
									bgcolor: "grey.100",
								}}
							/>
							<CardContent>
								<Typography variant="h5" fontWeight="bold" gutterBottom>
									{formValues.vehicleType.model || formValues.vehicleType.type_name}
								</Typography>
								<Typography variant="subtitle1" color="primary" sx={{ mb: 1 }}>
									{formValues.vehicleType.car_type}
								</Typography>
								<Typography color="text.secondary" paragraph>
									{formValues.vehicleType.description}
								</Typography>

								<Stack spacing={1.5} mt={2}>
									<Typography>
										<strong>License Plate:</strong> {formValues.vehicleType.license_plate}
									</Typography>
									<Typography>
										<strong>Hourly Rate:</strong> {formValues.vehicleType.price_per_hour} MMK
									</Typography>
									<Typography>
										<strong>Daily Rate:</strong> {formValues.vehicleType.price_per_day} MMK
									</Typography>
									<Typography>
										<strong>Seats:</strong> {formValues.vehicleType.number_of_seats} ·{" "}
										<strong>Luggage:</strong> {formValues.vehicleType.luggage_capacity} bags
									</Typography>
									<Typography>
										<strong>Transmission:</strong> {formValues.vehicleType.transmission} ·{" "}
										<strong>Fuel:</strong> {formValues.vehicleType.fuel_type}
									</Typography>
								</Stack>
							</CardContent>
						</Card>
					</Paper>

					{/* 3. Cost Summary */}
					<Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
							<AttachMoney color="primary" sx={{ mr: 1 }} />
							<Typography variant="h6" fontWeight="bold" color="primary">
								Cost Summary
							</Typography>
						</Box>
						<Divider sx={{ mb: 3 }} />

						<Stack spacing={2}>
							<Box>
								<Typography fontWeight="medium" mb={1}>Rental Calculation</Typography>
								<Typography variant="body2" color="text.secondary">
									{costDetails?.calculationText || "Calculating..."}
								</Typography>
								<Box display="flex" justifyContent="space-between" mt={1}>
									<Typography>Rental Cost</Typography>
									<Typography fontWeight="medium">
										{(costDetails?.rentalCost || 0).toFixed(2)} MMK
									</Typography>
								</Box>
							</Box>

							{(costDetails?.deliveryFee || 0) > 0 && (
								<Box display="flex" justifyContent="space-between">
									<Typography>Delivery Fee</Typography>
									<Typography>
										+{costDetails.deliveryFee.toFixed(2)} MMK
									</Typography>
								</Box>
							)}

							{(costDetails?.takebackFee || 0) > 0 && (
								<Box display="flex" justifyContent="space-between">
									<Typography>Takeback Fee</Typography>
									<Typography>
										+{costDetails.takebackFee.toFixed(2)} MMK
									</Typography>
								</Box>
							)}



							<Divider />

							<Box display="flex" justifyContent="space-between">
								<Typography variant="h5" fontWeight="bold">
									Total Amount
								</Typography>
								<Typography variant="h5" fontWeight="bold" color="primary">
									{(costDetails?.totalCost || 0).toFixed(2)} MMK
								</Typography>
							</Box>
						</Stack>
					</Paper>

					{/* Action Buttons */}
					<Box display="flex" gap={2} justifyContent="flex-end" flexWrap="wrap">
						<Button
							variant="contained"
							size="large"
							color="primary"
							onClick={handleConfirmBooking}
							disabled={isConfirming}
							sx={{
								minWidth: 200,
								py: 1.5,
								fontSize: "1.1rem",
								fontWeight: "bold",
							}}
						>
							{isConfirming ? (
								<CircularProgress size={28} color="inherit" />
							) : (
								"Confirm"
							)}
						</Button>
					</Box>
				</Stack>
			</BookingLayout>
		</Box>
	);
};

export default Review;