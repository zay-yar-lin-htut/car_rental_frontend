 import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
	Box,
	Typography,
	CircularProgress,
	Alert,
	Container,
	Card,
	Divider,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	CardMedia,
	Chip,
	Skeleton,
	TextField,
	Rating,
	Pagination,
} from "@mui/material";
import { AUTH_CONFIG } from "../services/Configuration";
import { getNavLinks } from "../view/home/Config/navigationConfig";
import ContactUs from "../contactUs/ContactUs";
import { createDataServices } from "../services/DataServices";
import { API_ENDPOINTS } from "../services/Configuration";
import { useSnackbar } from "../contexts/ErrorMessage";
import CommonAppBar from "../view/common/AppBar";
import type { Booking } from "../types";

interface HistoryBooking extends Booking {
	model?: string;
	license_plate?: string;
	car_image_url?: string;
	has_reviewed?: boolean | number;
	deliver_need?: number;
	delivery_office_id?: number;
	take_back_need?: number;
	takeback_office_id?: number;
	pickup_latitude?: number | string;
	pickup_longitude?: number | string;
	dropoff_latitude?: number | string;
	dropoff_longitude?: number | string;
	booking_status: string;
	ticket_number: string;
	pickup_datetime: string;
	dropoff_datetime: string;
	total_amount: number;
}

const History = () => {
	const [bookings, setBookings] = useState<HistoryBooking[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [openDialog, setOpenDialog] = useState(false);
	const [selectedBooking, setSelectedBooking] = useState<HistoryBooking | null>(null);
	const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});
	const [addresses, setAddresses] = useState<Record<string, string>>({});
	const { showSnackbar } = useSnackbar();
	const dataServices = React.useMemo(() => createDataServices(), []);
	const navigate = useNavigate();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isContactUsOpen, setContactUsOpen] = useState(false);
	const [logouting, setLogouting] = useState(false);
	const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
	const [reviewBooking, setReviewBooking] = useState<HistoryBooking | null>(null);
	const [rating, setRating] = useState<number | null>(0);
	const [comment, setComment] = useState('');
	const [page, setPage] = useState(0);
	const rowsPerPage = 10;
	const [totalBookings, setTotalBookings] = useState(0);
	const [offices, setOffices] = useState<Record<number, string>>({});
	const isLogin = AUTH_CONFIG.isAuthenticated();
	const navLinks = useMemo(() => getNavLinks(isLogin), [isLogin]);

	const handleLogout = () => {
		setLogouting(true);
		AUTH_CONFIG.clearToken();
		AUTH_CONFIG.clearUserData();
		navigate("/");
		setLogouting(false);
	};

	const fetchAddress = async (lat: string, lng: string) => {
		try {
			const key = import.meta.env.VITE_TOMTOM_KEY;
			if (!key) return 'API key missing';
			const response = await fetch(`https://api.tomtom.com/search/2/reverseGeocode/${lat},${lng}.json?key=${key}`);
			const data = await response.json();
			return data.addresses && data.addresses[0] ? data.addresses[0].address.freeformAddress : 'Unknown location';
		} catch (err) {
			console.error('Error fetching address:', err);
			return 'Unknown location';
		}
	};

	const fetchOffices = useCallback(async () => {
		try {
			const response = await dataServices.retrieve(API_ENDPOINTS.location.base, API_ENDPOINTS.location.getOffice);
			const officeMap: Record<number, string> = {};
			(response.data as Array<{ office_location_id: number; location_name?: string }>).forEach(office => {
				officeMap[office.office_location_id] = office.location_name || "";
			});
			setOffices(officeMap);
		} catch (_err) {
			console.error('Error fetching offices:', _err);
		}
	}, [dataServices]);

	const fetchBookings = useCallback(async () => {
		try {
			const response = await dataServices.retrieve(
				API_ENDPOINTS.users.base,
				`${API_ENDPOINTS.users.myBookings}?first=${page + 1}&max=${rowsPerPage}`
			);
			const data = response.data as { data?: HistoryBooking[]; total?: number };
			setBookings(data.data || []);
			setTotalBookings(data.total || 0);
			// Fetch addresses for unique locations
			const uniqueLocations = new Set<string>();
			(data.data || []).forEach(booking => {
				if (booking.pickup_latitude && booking.pickup_longitude) uniqueLocations.add(`${booking.pickup_latitude},${booking.pickup_longitude}`);
				if (booking.dropoff_latitude && booking.dropoff_longitude) uniqueLocations.add(`${booking.dropoff_latitude},${booking.dropoff_longitude}`);
			});
			if (uniqueLocations.size > 0) {
				// Fetch addresses sequentially with delay to avoid rate limits
				for (const loc of uniqueLocations) {
					const [lat, lng] = loc.split(',');
					const address = await fetchAddress(lat, lng);
					setAddresses(prev => ({ ...prev, [loc]: address }));
					await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay between requests
				}
			}
		} catch (_err) {
			setError(_err instanceof Error ? _err.message : "Failed to load bookings");
			showSnackbar("Error loading history", "error");
		} finally {
			setLoading(false);
		}
	}, [page, rowsPerPage, showSnackbar, dataServices]);

	useEffect(() => {
		fetchBookings();
		fetchOffices();
	}, [fetchBookings, fetchOffices]);

	const handleCancelClick = (booking: HistoryBooking) => {
		setSelectedBooking(booking);
		setOpenDialog(true);
	};

	const handleDialogClose = () => {
		setOpenDialog(false);
		setSelectedBooking(null);
	};

	const handleConfirmCancel = async () => {
		if (!selectedBooking) return;
		try {
			await dataServices.retrieve(
				API_ENDPOINTS.bookings.base,
				API_ENDPOINTS.bookings.cancel(selectedBooking.booking_id)
			);
			showSnackbar("Booking cancelled.", "success");
			setBookings((prev) =>
				prev.map((b) =>
					b.booking_id === selectedBooking.booking_id
						? { ...b, booking_status: "cancelled" }
						: b
				)
			);
		} catch {
			showSnackbar("Cancel failed", "error");
		} finally {
			handleDialogClose();
		}
	};

	const handleSubmitReview = async () => {
		if (!reviewBooking) return;
		try {
			await dataServices.retrievePOST(
				{ booking_id: reviewBooking.booking_id, rating, comment },
				API_ENDPOINTS.review.base + API_ENDPOINTS.review.create
			);
			showSnackbar("Review submitted successfully", "success");
			setReviewDialogOpen(false);
			fetchBookings(); // Re-fetch to update the list
		} catch {
			showSnackbar("Failed to submit review", "error");
		}
	};

	const handleReviewClick = (booking: HistoryBooking) => {
		setReviewBooking(booking);
		setReviewDialogOpen(true);
		setRating(0);
		setComment('');
	};

	const handleImageLoad = (id: number) => {
		setImageLoading((prev) => ({ ...prev, [id]: true }));
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "confirmed":
			case "completed":
				return "success";
			case "pending":
				return "warning";
			case "cancelled":
				return "error";
			default:
				return "default";
		}
	};

	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	};

	const getOfficeName = (id: number) => {
		return offices[id] || "Unknown Office";
	};



	const renderActionButtons = (booking: HistoryBooking) => {
		switch (booking.booking_status) {
			case "pending":
			case "confirmed":
				return (
					<Button
						size='small'
						variant='outlined'
						color='error'
						onClick={() => handleCancelClick(booking)}>
						Cancel
					</Button>
				);
			case "completed":
				return booking.has_reviewed ? null : (
					<Button
						size='small'
						variant='contained'
						color='primary'
						onClick={() => handleReviewClick(booking)}>
						Review
					</Button>
				);
			default:
				return null;
		}
	};

   if (loading) {
		return (
			<Box>
				<CommonAppBar
					navLinks={navLinks}
					isLogin={isLogin}
					handleLogout={handleLogout}
					isLogouting={logouting}
					isMenuOpen={isMenuOpen}
					setIsMenuOpen={setIsMenuOpen}
					setContactUsOpen={setContactUsOpen}
					hideNavbarOnMobile={false}
				/>
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						minHeight: "100vh",
						bgcolor: "var(--background-color)",
						pt: { xs: 28, md: 30 },
					}}>
					<CircularProgress size={44} />
				</Box>
			</Box>
		);
	}

	if (error) {
		return (
			<Box>
				<CommonAppBar
					navLinks={navLinks}
					isLogin={isLogin}
					handleLogout={handleLogout}
					isLogouting={logouting}
					isMenuOpen={isMenuOpen}
					setIsMenuOpen={setIsMenuOpen}
					setContactUsOpen={setContactUsOpen}
					hideNavbarOnMobile={false}
				/>
				<Box sx={{ minHeight: "100vh", bgcolor: "var(--background-color)", pt: { xs: 28, md: 30 } }}>
			<Container maxWidth='lg' sx={{ mt: 2 }}>
						<Alert
							severity='error'>
							{error}
						</Alert>
					</Container>
				</Box>
			</Box>
		);
	}

	return (
		<Box>
				<CommonAppBar
					navLinks={navLinks}
					isLogin={isLogin}
					handleLogout={handleLogout}
					isLogouting={logouting}
					isMenuOpen={isMenuOpen}
					setIsMenuOpen={setIsMenuOpen}
					setContactUsOpen={setContactUsOpen}
					hideNavbarOnMobile={false}
				/>
			<Box
				sx={{ minHeight: "100vh", bgcolor: "var(--background-color)", pt: { xs: 28, md: 30 }, py: { xs: 2.5, md: 3.5 } }}>
			<Container maxWidth='lg'>
				<Typography
					variant='h5'
					align='center'
					sx={{ color: "var(--text-color)", fontWeight: 600, mb: 3.5, mt: 8 }}>
					Booking History
				</Typography>

				{bookings.length === 0 ? (
					<Alert
						severity='info'
						sx={{
							py: 2,
						}}>
						No bookings yet.
					</Alert>
				) : (
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
						{bookings.map((booking) => (
							<Card
								key={booking.booking_id}
								sx={{
									bgcolor: "var(--background-paper)",
									color: "var(--text-color)",
									borderRadius: 2,
									transition: "0.2s",
								}}>
								<Box
									sx={{
										display: "flex",
										flexDirection: { xs: "column", sm: "row" },
										p: { xs: 1.8, sm: 2.2 },
										gap: 2,
										alignItems: "flex-start",
									}}>
									{/* Image — subtle amber border only for pending */}
									<Box
										sx={{
											width: { xs: "100%", sm: 130 },
											height: { xs: 110, sm: 90 },
											flexShrink: 0,
											borderRadius: 2,
											overflow: "hidden",
											bgcolor: "var(--divider-color)",
										}}>
										{booking.car_image_url ? (
											<>
												<Skeleton
													variant='rectangular'
													width='100%'
													height='100%'
													sx={{
														display: imageLoading[booking.booking_id]
															? "none"
															: "block",
													}}
												/>
												<CardMedia
													component='img'
													image={dataServices.retrieveImage(
														booking.car_image_url
													)}
													alt={booking.model}
													onLoad={() => handleImageLoad(booking.booking_id)}
													sx={{
														width: "100%",
														height: "100%",
														objectFit: "cover",
														opacity: imageLoading[booking.booking_id] ? 1 : 0,
														transition: "opacity 0.3s ease",
													}}
												/>
											</>
										) : (
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													height: "100%",
													color: "var(--text-secondary-color)",
													fontSize: "0.75rem",
												}}>
												No Image
											</Box>
										)}
									</Box>

									{/* Content — TICKET NUMBER under status */}
									<Box sx={{ flex: 1, minWidth: 0 }}>
										<Box
											sx={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "flex-start",
												mb: 1,
											}}>
											<Box>
												<Typography
													variant='h6'
													sx={{ fontWeight: 600, fontSize: "1.05rem" }}>
													{booking.model}
												</Typography>
												<Typography
													variant='body2'
													color='var(--text-secondary-color)'
													sx={{ fontSize: "0.82rem" }}>
													{booking.license_plate}
												</Typography>
											</Box>

											{/* Status + Ticket Number + Delivery Info */}
											<Box sx={{ textAlign: "right" }}>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
													<Chip
														label={booking.booking_status.toUpperCase()}
														color={getStatusColor(booking.booking_status)}
														size='small'
														sx={{
															fontSize: "0.7rem",
															height: 22,
															fontWeight: 700,
														}}
													/>
													{(() => {
														let message = '';
														if (booking.booking_status === 'pending' || booking.booking_status === 'confirmed') {
															if (booking.deliver_need === 1 && booking.delivery_office_id) {
																message = `${getOfficeName(booking.delivery_office_id)} will deliver car at ${formatDateTime(booking.pickup_datetime)}`;
															} else if (booking.deliver_need === 0) {
																message = `You must pickup car at the pickup location at ${formatDateTime(booking.pickup_datetime)}`;
															}
														} else if (booking.booking_status === 'on_rent') {
															if (booking.take_back_need === 1 && booking.takeback_office_id) {
																message = `${getOfficeName(booking.takeback_office_id)} will take back car at ${formatDateTime(booking.dropoff_datetime)}`;
															} else if (booking.take_back_need === 0) {
																message = `You must dropoff car at the dropoff location at ${formatDateTime(booking.dropoff_datetime)}`;
															}
														}
														if (message) {
															return (
																<Chip
																	label={message}
																	size='small'
																	sx={{
																		fontSize: "0.65rem",
																		height: 22,
																		fontWeight: 600,
																		backgroundColor: '#e3f2fd',
																		color: '#1976d2',
																		border: '1px solid #1976d2',
																		maxWidth: 400,
																		'& .MuiChip-label': {
																			whiteSpace: 'normal',
																			lineHeight: 1.2,
																		},
																	}}
																/>
															);
														}
														return null;
													})()}
												</Box>
												<Typography
													variant='body1'
													sx={{
														fontWeight: 800,
														fontSize: "1.1rem",
														color: "var(--primary-color)",
														letterSpacing: "0.5px",
													}}>
													#{booking.ticket_number}
												</Typography>
											</Box>
										</Box>

										{/* Dates */}
										<Box
											sx={{
												mt: 1.5,
												display: "grid",
												gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
												gap: 1.5,
											}}>
											<Box>
												<Typography
													variant='caption'
													color='var(--text-secondary-color)'
													sx={{ fontSize: "0.75rem" }}>
													Pickup
												</Typography>
												<Typography
													variant='body2'
													sx={{ fontWeight: 500, fontSize: "0.88rem" }}>
													{formatDateTime(booking.pickup_datetime)}
												</Typography>
												<Typography
													variant='body2'
													sx={{ fontSize: "0.75rem", color: "var(--text-secondary-color)" }}>
													{addresses[`${booking.pickup_latitude},${booking.pickup_longitude}`] || 'Loading location...'}
												</Typography>
											</Box>
											<Box>
												<Typography
													variant='caption'
													color='var(--text-secondary-color)'
													sx={{ fontSize: "0.75rem" }}>
													Dropoff
												</Typography>
												<Typography
													variant='body2'
													sx={{ fontWeight: 500, fontSize: "0.88rem" }}>
													{formatDateTime(booking.dropoff_datetime)}
												</Typography>
												<Typography
													variant='body2'
													sx={{ fontSize: "0.75rem", color: "var(--text-secondary-color)" }}>
													{addresses[`${booking.dropoff_latitude},${booking.dropoff_longitude}`] || 'Loading location...'}
												</Typography>
											</Box>
										</Box>

										<Divider sx={{ my: 1.5, bgcolor: "var(--divider-color)" }} />

										<Box
											sx={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
											}}>
											<Typography
												variant='h6'
												sx={{
													fontWeight: 700,
													color: "var(--primary-color)",
													fontSize: "1.25rem",
												}}>
												{booking.total_amount} MMK
											</Typography>
											<Box>{renderActionButtons(booking)}</Box>
										</Box>
									</Box>
								</Box>
							</Card>
						))}
					</Box>
				)}
				{totalBookings > rowsPerPage && (
					<Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
						<Pagination
							count={Math.ceil(totalBookings / rowsPerPage)}
							page={page + 1}
							onChange={(event, value) => setPage(value - 1)}
							color="primary"
							sx={{ '& .MuiPaginationItem-root': { color: 'var(--text-color)' } }}
						/>
					</Box>
				)}
			</Container>

			{/* Clean Dialog */}
			<Dialog
				open={openDialog}
				onClose={handleDialogClose}
				PaperProps={{
					sx: { bgcolor: "var(--background-paper)", color: "var(--text-color)", borderRadius: 2 },
				}}>
				<DialogTitle sx={{ fontSize: "1.1rem", fontWeight: 600 }}>
					Cancel Booking?
				</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ color: "var(--text-secondary-color)", fontSize: "0.9rem" }}>
						Cancel <strong>{selectedBooking?.model}</strong>?
						<br />
						<strong style={{ color: "var(--primary-color)" }}>
							#{selectedBooking?.ticket_number}
						</strong>
					</DialogContentText>
					{selectedBooking?.booking_status === "confirmed" && (
						<DialogContentText sx={{ color: "var(--text-secondary-color)", fontSize: "0.9rem", mt: 1 }}>
							No cancellation fee 3000 MMK will apply next booking.
						</DialogContentText>
					)}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleDialogClose}
						size='small'>
						Keep
					</Button>
					<Button
						onClick={handleConfirmCancel}
						color='error'
						variant='contained'
						size='small'>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>

			{/* Review Dialog */}
			<Dialog
				open={reviewDialogOpen}
				onClose={() => setReviewDialogOpen(false)}
				PaperProps={{
					sx: { bgcolor: "var(--background-paper)", color: "var(--text-color)", borderRadius: 2 },
				}}>
				<DialogTitle sx={{ fontSize: "1.1rem", fontWeight: 600 }}>
					Review Booking #{reviewBooking?.ticket_number}
				</DialogTitle>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
						<Box>
							<Typography variant="body1" sx={{ mb: 1 }}>Rating</Typography>
							<Rating
								value={rating}
								onChange={(event, newValue) => setRating(newValue)}
								size="large"
							/>
						</Box>
						<TextField
							label="Comment"
							multiline
							rows={4}
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							fullWidth
							variant="outlined"
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setReviewDialogOpen(false)} size="small">
						Cancel
					</Button>
					<Button
						onClick={handleSubmitReview}
						color="primary"
						variant="contained"
						size="small"
						disabled={rating === 0}
					>
						Submit Review
					</Button>
				</DialogActions>
			</Dialog>

			</Box>
			<ContactUs
				open={isContactUsOpen}
				onClose={() => setContactUsOpen(false)}
			/>
		</Box>
	);
};

export default History;
