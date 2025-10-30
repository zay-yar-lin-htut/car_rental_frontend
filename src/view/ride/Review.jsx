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
	Skeleton,
	CircularProgress,
	useTheme,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { createDataServices } from "../../services/DataServices";
import { API_ENDPOINTS } from "../../services/Configuration";
import BookingLayout from "./BookingLayout";
import { calculateRentalCost } from "./costCalculator";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default Leaflet icon path issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: markerIcon2x,
	iconUrl: markerIcon,
	shadowUrl: markerShadow,
});

const RecenterAutomatically = ({ bounds }) => {
	const map = useMap();
	useEffect(() => {
		if (bounds.length > 0) map.fitBounds(bounds);
	}, [bounds, map]);
	return null;
};

const Review = ({ onBackToSelect }) => {
	const { formValues, resetForm } = useIntroForm();
	const theme = useTheme();
	const { showSnackbar } = useSnackbar();
	const [isConfirming, setIsConfirming] = useState(false);
	const navigate = useNavigate();
	const dataServices = useMemo(() => createDataServices(), []);

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

	const handleConfirmBooking = async () => {
		setIsConfirming(true);
		try {
			const bookingData = {
				car_id: formValues.vehicleType.car_id,
				pickup_date: dayjs(formValues.pickupDate).format("YYYY-MM-DD"),
				pickup_time: dayjs(formValues.pickupTime).format("HH:mm:ss"),
				dropoff_date: dayjs(formValues.dropDate).format("YYYY-MM-DD"),
				dropoff_time: dayjs(formValues.dropTime).format("HH:mm:ss"),
				pickup_latitude: formValues.pickupLocation.location[0],
				pickup_longitude: formValues.pickupLocation.location[1],
				dropoff_latitude: formValues.dropoffLocation.location[0],
				dropoff_longitude: formValues.dropoffLocation.location[1],
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

	const mapBounds = useMemo(() => {
		const bounds = [];
		if (formValues.pickupLocation) {
			bounds.push([
				formValues.pickupLocation.location[0],
				formValues.pickupLocation.location[1],
			]);
		}
		if (formValues.dropoffLocation) {
			bounds.push([
				formValues.dropoffLocation.location[0],
				formValues.dropoffLocation.location[1],
			]);
		}
		return bounds;
	}, [formValues.pickupLocation, formValues.dropoffLocation]);

	return (
		<BookingLayout title='Review Your Booking'>
			<>
				{/* Left column - rental details */}
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
							variant='subtitle2'
							color='text.secondary'>
							Dates & Times
						</Typography>
						<Typography
							variant='body2'
							color='text.secondary'>
							{`${formatDate(formValues.pickupDate)} @ ${formatTime(
								formValues.pickupTime
							)} — ${formatDate(formValues.dropDate)} @ ${formatTime(
								formValues.dropTime
							)}`}
						</Typography>
						<Button
							size='small'
							onClick={onBackToSelect}>
							Edit
						</Button>
					</Box>

					<Divider sx={{ my: 1 }} />

					<Box sx={{ mb: 2 }}>
						<Typography
							variant='subtitle2'
							color='text.secondary'>
							Pick-up & Return Location
						</Typography>
						<Typography
							variant='body2'
							color='text.secondary'>
							<strong>From:</strong> {formValues.pickupLocation?.location_name}
							<br />
							<strong>To:</strong>{" "}
							{formValues.dropSameAsPickup
								? formValues.pickupLocation?.location_name
								: formValues.dropoffLocation?.location_name}
						</Typography>
					</Box>
				</Paper>

				{mapBounds.length === 0 ? (
					<Paper
						variant='outlined'
						sx={{ p: 3, mb: 3, bgcolor: "background.paper" }}>
						<Typography
							variant='h6'
							fontWeight='bold'
							gutterBottom>
							Route Overview
						</Typography>
						<Skeleton
							variant='rectangular'
							height={300}
						/>
					</Paper>
				) : (
					<Paper
						variant='outlined'
						sx={{ p: 3, mb: 3, bgcolor: "background.paper" }}>
						<Typography
							variant='h6'
							fontWeight='bold'
							gutterBottom>
							Route Overview
						</Typography>
						<Box
							sx={{
								height: 300,
								width: "100%",
								borderRadius: 2,
								overflow: "hidden",
							}}>
							<MapContainer
								bounds={mapBounds}
								style={{ height: "100%", width: "100%" }}
								scrollWheelZoom={false}>
								<TileLayer
									url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
									attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
								/>
								<Marker position={mapBounds[0]}>
									<Popup>
										Pickup: {formValues.pickupLocation.location_name}
									</Popup>
								</Marker>
								{mapBounds.length > 1 &&
									JSON.stringify(mapBounds[0]) !==
										JSON.stringify(mapBounds[1]) && (
										<Marker position={mapBounds[1]}>
											<Popup>
												Drop-off: {formValues.dropoffLocation.location_name}
											</Popup>
										</Marker>
									)}
								<RecenterAutomatically bounds={mapBounds} />
							</MapContainer>
						</Box>
					</Paper>
				)}

				{/* Vehicle Details */}
				<Paper
					variant='outlined'
					sx={{ p: 3, mb: 3, bgcolor: "background.paper" }}>
					<Typography
						variant='h6'
						fontWeight='bold'
						gutterBottom>
						Vehicle Details
						<Button
							size='small'
							onClick={onBackToSelect}>
							Change
						</Button>
					</Typography>
					<Card
						variant='outlined'
						sx={{
							border: `1px solid ${theme.palette.divider}`,
						}}>
						<CardMedia
							component='img'
							image={dataServices.retrieveImage(
								formValues.vehicleType.car_type_image_url
							)}
							sx={{
								height: 180,
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
								variant='body2'
								color='text.secondary'>
								{formValues.vehicleType.description}
							</Typography>
						</CardContent>
					</Card>
				</Paper>

				{/* Right column - contact details */}
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
								variant='body2'
								color='text.secondary'>
								{costDetails.calculationText}
							</Typography>
							<Typography
								variant='h5'
								fontWeight='bold'
								sx={{ my: 1 }}>
								Total: {costDetails.totalCost.toFixed(2)} MMK
							</Typography>
						</Box>
					)}
				</Paper>
				<Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
					<Button
						variant='contained'
						color='primary'
						size='large'
						disabled={isConfirming}
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
			</>
		</BookingLayout>
	);
};

export default Review;
