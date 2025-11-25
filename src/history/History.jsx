 import React, { useState, useEffect, useMemo } from "react";
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
	AppBar,
	Toolbar,
	useTheme,
	useMediaQuery,
	IconButton,
	Drawer,
	List,
	ListItem,
	ListItemText,
	TextField,
	Rating,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { AUTH_CONFIG } from "../services/Configuration";
import { getNavLinks } from "../view/home/Config/navigationConfig";
import ContactUs from "../contactUs/ContactUs";
import { createDataServices } from "../services/DataServices";
import { API_ENDPOINTS } from "../services/Configuration";
import { useSnackbar } from "../contexts/ErrorMessage";

const History = () => {
	const [bookings, setBookings] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [openDialog, setOpenDialog] = useState(false);
	const [selectedBooking, setSelectedBooking] = useState(null);
	const [imageLoading, setImageLoading] = useState({});
	const [addresses, setAddresses] = useState({});
	const { showSnackbar } = useSnackbar();
	const dataServices = createDataServices();
	const navigate = useNavigate();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isContactUsOpen, setContactUsOpen] = useState(false);
	const [logouting, setLogouting] = useState(false);
	const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
	const [reviewBooking, setReviewBooking] = useState(null);
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState('');
	const isLogin = AUTH_CONFIG.isAuthenticated();
	const navLinks = useMemo(() => getNavLinks(isLogin), [isLogin]);

	const handleLogout = () => {
		setLogouting(true);
		AUTH_CONFIG.clearToken();
		AUTH_CONFIG.clearUserData();
		navigate("/");
		setLogouting(false);
	};

	const fetchAddress = async (lat, lng) => {
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

	const fetchBookings = async () => {
		try {
			const response = await dataServices.retrieve(
				API_ENDPOINTS.users.base,
				API_ENDPOINTS.users.myBookings
			);
			setBookings(response.data || []);
			// Fetch addresses for unique locations
			const uniqueLocations = new Set();
			response.data.forEach(booking => {
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
		} catch (err) {
			setError(err.message || "Failed to load bookings");
			showSnackbar("Error loading history", "error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchBookings();
	}, []);

	const handleCancelClick = (booking) => {
		setSelectedBooking(booking);
		setOpenDialog(true);
	};

	const handleDialogClose = () => {
		setOpenDialog(false);
		setSelectedBooking(null);
	};

	const handleConfirmCancel = async () => {
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
		} catch (err) {
			showSnackbar("Cancel failed", "error");
		} finally {
			handleDialogClose();
		}
	};

	const handleSubmitReview = async () => {
		try {
			await dataServices.retrievePOST(
				{ booking_id: reviewBooking.booking_id, rating, comment },
				API_ENDPOINTS.review.base + API_ENDPOINTS.review.create
			);
			showSnackbar("Review submitted successfully", "success");
			setReviewDialogOpen(false);
			fetchBookings(); // Re-fetch to update the list
		} catch (err) {
			showSnackbar("Failed to submit review", "error");
		}
	};

	const handleReviewClick = (booking) => {
		setReviewBooking(booking);
		setReviewDialogOpen(true);
		setRating(0);
		setComment('');
	};

	const handleImageLoad = (id) => {
		setImageLoading((prev) => ({ ...prev, [id]: true }));
	};

	const getStatusColor = (status) => {
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

	const formatDateTime = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	};

	const TopAppBar = ({
		navLinks,
		isLogin,
		handleLogout,
		isLogouting,
		setIsMenuOpen,
		setContactUsOpen,
		hideNavbarOnMobile,
	}) => {
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

		return (
			<AppBar
				position='fixed'
				elevation={scrolled ? 4 : 0}
				sx={{
					py: 1,
					zIndex: 100,
					backgroundColor: "rgba(111, 111, 111, 0.9)" ,
					color: "var(--text-color)",
					px: { xs: 2, md: 4 },
					backdropFilter: scrolled ? "blur(10px)" : "none",
					transition:
						"background-color 0.3s ease, box-shadow 0.3s ease, py 0.3s ease, transform 0.3s ease",
					transform: isMobile && hideNavbarOnMobile ? "translateY(-100%)" : "translateY(0)",
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
					<Box
						sx={{
							flexGrow: 1,
							display: { xs: "none", md: "flex" },
							justifyContent: "center",
							gap: 10,
						}}>
						{navLinks.map((link) =>
							link.label === "Contact Us" ? (
								<Typography
									key={link.label}
									onClick={() => setContactUsOpen(true)}
									sx={{ cursor: "pointer", "&:hover": { color: "var(--text-color)" } }}>
									{link.label}
								</Typography>
							) : (
								<Link
									key={link.label}
									to={link.to}
									style={{ textDecoration: "none" }}>
									<Typography sx={{ "&:hover": { color: "var(--text-color)" } }}>
										{link.label}
									</Typography>
								</Link>
							)
						)}
					</Box>
					<Box sx={{ display: { xs: "none", md: "block" } }}>
						{isLogin ? (
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
								{isLogouting ? "Logging Out..." : "Sign Out"}
							</Button>
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
					<Box sx={{ display: { md: "none" } }}>
						{isLogin ? (
							<IconButton
								color='inherit'
								aria-label='open drawer'
								edge='start'
								onClick={() => setIsMenuOpen(true)}
								sx={{ mr: 2 }}>
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

	const MobileDrawer = ({
		navLinks,
		isMenuOpen,
		onMenuClose,
		isLogin,
		handleLogout,
		isLogouting,
		setContactUsOpen,
	}) => (
		<Drawer
			anchor='top'
			open={isMenuOpen}
			onClose={onMenuClose}
			PaperProps={{
				sx: {
					backgroundColor: "white",
					width: "100%",
					height: "auto",
					top: "60px",
				},
			}}>
			<Box
				sx={{
					width: "100%",
				}}
				role='presentation'
				onClick={onMenuClose}
				onKeyDown={onMenuClose}>
				<List>
					{navLinks.map((link) => (
						<React.Fragment key={link.label}>
							<ListItem
								button
								component={link.label === "Contact Us" ? "button" : Link}
								to={link.to}
								onClick={
									link.label === "Contact Us"
										? () => setContactUsOpen(true)
										: null
								}>
								<ListItemText
									primary={link.label}
									sx={{ color: "var(--text-color)" }}
								/>
							</ListItem>
							<Divider sx={{ my: 0.3 }} />
						</React.Fragment>
					))}
					{isLogin && (
						<ListItem>
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
									width: "100%",
								}}
								onClick={handleLogout}>
								{isLogouting ? "Logging Out..." : "Sign Out"}
							</Button>
						</ListItem>
					)}
				</List>
			</Box>
		</Drawer>
	);

	const renderActionButtons = (booking) => {
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
				return booking.review_id ? null : (
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
				<TopAppBar
					navLinks={navLinks}
					isLogin={isLogin}
					handleLogout={handleLogout}
					isLogouting={logouting}
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
				<TopAppBar
					navLinks={navLinks}
					isLogin={isLogin}
					handleLogout={handleLogout}
					isLogouting={logouting}
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
			<TopAppBar
				navLinks={navLinks}
				isLogin={isLogin}
				handleLogout={handleLogout}
				isLogouting={logouting}
				setIsMenuOpen={setIsMenuOpen}
				setContactUsOpen={setContactUsOpen}
				hideNavbarOnMobile={false}
			/>
			<MobileDrawer
				navLinks={navLinks}
				isMenuOpen={isMenuOpen}
				onMenuClose={() => setIsMenuOpen(false)}
				isLogin={isLogin}
				handleLogout={handleLogout}
				isLogouting={logouting}
				setContactUsOpen={setContactUsOpen}
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
											border:
												booking.booking_status === "pending"
													? "2px solid var(--primary-color)"
													: "1px solid var(--divider-color)",
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

											{/* Status + Ticket Number (under it) */}
											<Box sx={{ textAlign: "right" }}>
												<Chip
													label={booking.booking_status.toUpperCase()}
													color={getStatusColor(booking.booking_status)}
													size='small'
													sx={{
														fontSize: "0.7rem",
														height: 22,
														fontWeight: 700,
														mb: 0.5,
													}}
												/>
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
													color: "var(--success-color)",
													fontSize: "1.25rem",
												}}>
												${booking.total_amount}
											</Typography>
											<Box>{renderActionButtons(booking)}</Box>
										</Box>
									</Box>
								</Box>
							</Card>
						))}
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
