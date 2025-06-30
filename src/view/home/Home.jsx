import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	Box,
	Typography,
	Button,
	Stack,
	AppBar,
	Toolbar,
	IconButton,
	Drawer,
	List,
	ListItem,
	ListItemText,
	CircularProgress,
} from "@mui/material";

// Icons
import SpeedIcon from "@mui/icons-material/Speed";
import BoltIcon from "@mui/icons-material/Bolt";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import MenuIcon from "@mui/icons-material/Menu";

// Assuming these are correctly set up in your project
import { API_ENDPOINTS, AUTH_CONFIG } from "../../services/Configuration";
import { createDataServices } from "../../services/DataServices";
import { useSnackbar } from "../../contexts/ErrorMessage";

const dataServices = createDataServices();

// --- Static data for the page design ---
const carSpecs = [
	{ icon: <BoltIcon />, value: "650 HP", label: "Power" },
	{ icon: <SpeedIcon />, value: "3.5 SEC", label: "0-60 MPH" },
	{ icon: <DirectionsCarIcon />, value: "11.4 SEC", label: "1/4 MILE" },
	{ icon: <AttachMoneyIcon />, value: "$68,000", label: "Starting Price" },
];

const CamaroShowcaseHome = () => {
	// --- State and Logic ---
	const [logouting, setLogouting] = useState(false);
	const isLogin = AUTH_CONFIG.isAuthenticated();
	const navigate = useNavigate();
	const { showSnackbar } = useSnackbar();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const navLinks = [
		{ to: "/", label: "Home" },
		{ to: "/cars", label: "Models" },
		{ to: "/innovation", label: "Innovation" },
		{ to: "/user-profile", label: "Profile" },
	];

	const handleLogout = () => {
		setLogouting(true);
		dataServices
			.Logout(API_ENDPOINTS.auth.logout)
			.then((response) => {
				setLogouting(false);
				AUTH_CONFIG.clearToken();
				AUTH_CONFIG.clearUserData();
				showSnackbar(response.message, "success");
				navigate(0);
			})
			.catch((error) => {
				setLogouting(false);
				showSnackbar(error.message, "error");
			});
	};

	// --- Animation Keyframes ---
	const slideInLeft = {
		"@keyframes slideInLeft": {
			"0%": { transform: "translateX(-50px)", opacity: 0 },
			"100%": { transform: "translateX(0)", opacity: 1 },
		},
		animation: "slideInLeft 0.8s ease-out forwards",
	};
	const slideInRight = {
		"@keyframes slideInRight": {
			"0%": { transform: "translateX(50px) scale(0.95)", opacity: 0 },
			"100%": { transform: "translateX(0) scale(1)", opacity: 1 },
		},
		animation: "slideInRight 1s ease-out forwards",
	};
	const fadeIn = {
		"@keyframes fadeIn": { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
		animation: "fadeIn 1s ease-out forwards",
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				width: "100%",
				position: "relative",
				overflow: "hidden",
				display: "flex",
				flexDirection: "column",
				// **RESPONSIVE BACKGROUND**
				background: {
					xs: "linear-gradient(180deg, #000000 0%, #111111 50%, #ffffff 70%)", // Vertical gradient for mobile
					md: "linear-gradient(135deg, #ffffff 50%, #000000 50.1%)", // Diagonal split for desktop
				},
			}}>
			<TopAppBar
				navLinks={navLinks}
				isLogin={isLogin}
				handleLogout={handleLogout}
				isLogouting={logouting}
				onMenuOpen={() => setIsMenuOpen(true)}
			/>
			<MobileDrawer
				navLinks={navLinks}
				isMenuOpen={isMenuOpen}
				onMenuClose={() => setIsMenuOpen(false)}
			/>

			<Box
				component='main'
				sx={{
					flexGrow: 1,
					display: "flex",
					width: "100%",
					flexDirection: { xs: "column", md: "row" },
					bgcolor: "transparent",
					pt: { xs: 10, md: 0 },
				}}>
				{/* Left Content Pane */}
				<Box
					sx={{
						width: { xs: "100%", md: "45%" },
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						// **RESPONSIVE PADDING**
						p: { xs: 3, sm: 4, md: 6, lg: 8 },
						pt: { xs: 12, md: 6, lg: 8 },
						textAlign: { xs: "center", md: "left" },
						zIndex: 2,
					}}>
					<Typography
						variant='h1'
						sx={{
							...slideInLeft,
							fontWeight: 900,
							// Responsive text color based on background
							color: { xs: "white", md: "black" },
							// **RESPONSIVE TYPOGRAPHY**
							fontSize: {
								xs: "2.5rem",
								sm: "3.5rem",
								md: "4rem",
								lg: "5.5rem",
							},
							textTransform: "uppercase",
							lineHeight: 1,
						}}>
						Chevrolet Camaro
					</Typography>
					<Typography
						sx={{
							...fadeIn,
							animationDelay: "0.2s",
							maxWidth: "500px",
							mt: 3,
							mx: { xs: "auto", md: 0 },
							// Responsive text color
							color: { xs: "grey.400", md: "grey.700" },
						}}>
						Engineered for performance. Designed to turn heads. The legend
						continues with unparalleled power and iconic style.
					</Typography>
					<Button
						variant='outlined'
						sx={{
							...fadeIn,
							animationDelay: "0.4s",
							mt: 4,
							// **RESPONSIVE BUTTON STYLES**
							color: { xs: "white", md: "black" },
							borderColor: { xs: "white", md: "black" },
							borderRadius: "0px",
							px: 4,
							py: 1,
							alignSelf: { xs: "center", md: "flex-start" },
							"&:hover": {
								color: { xs: "black", md: "black" },
								backgroundColor: { xs: "white", md: "rgba(0,0,0,0.1)" },
								borderColor: { xs: "white", md: "black" },
							},
						}}>
						Read More
					</Button>
					<Stack
						direction='row'
						spacing={{ xs: 2, sm: 4 }}
						flexWrap='wrap'
						justifyContent={{ xs: "center", md: "flex-start" }}
						sx={{ ...fadeIn, animationDelay: "0.6s", mt: { xs: 6, md: 8 } }}>
						{carSpecs.map((spec) => (
							<SpecItem
								key={spec.label}
								icon={spec.icon}
								value={spec.value}
								label={spec.label}
							/>
						))}
					</Stack>
				</Box>

				{/* Right Image Pane */}
				<Box
					sx={{
						width: { xs: "100%", md: "55%" },
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexGrow: 1, // Allow it to take up space on mobile
					}}>
					<Box
						component='img'
						src='/home-img.png'
						alt='Chevrolet Camaro'
						sx={{
							...slideInRight,
							objectFit: "contain",
							zIndex: 1,
							// **RESPONSIVE IMAGE SIZING & MARGIN**
							mt: { xs: 4, md: 0 }, // Add margin top on mobile only
							width: { xs: "80%", sm: "100%", md: "90%", lg: "78%" },
							maxWidth: { xs: "450px", sm: "550px", md: "1200px" },
						}}
					/>
				</Box>
			</Box>

			<PageDots />
		</Box>
	);
};

// --- Sub-components ---
const TopAppBar = ({
	navLinks,
	isLogin,
	handleLogout,
	isLogouting,
	onMenuOpen,
}) => (
	<AppBar
		position='absolute'
		color='transparent'
		elevation={0}
		sx={{ py: 2, zIndex: 10, px: { xs: 2, md: 4 } }}>
		<Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
			<Typography
				variant='h6'
				component='div'
				sx={{ fontWeight: "bold", color: { xs: "white", md: "black" } }}>
				JOURNEYWHEEL
			</Typography>
			<Box
				sx={{
					flexGrow: 1,
					display: { xs: "none", md: "flex" },
					justifyContent: "center",
					gap: 4,
				}}>
				{navLinks.map((link) => (
					<Link
						key={link.label}
						to={link.to}
						style={{ textDecoration: "none" }}>
						<Typography
							sx={{
								color: { xs: "white", md: "black" },
								"&:hover": { color: "grey.600" },
							}}>
							{link.label}
						</Typography>
					</Link>
				))}
			</Box>
			<Box sx={{ display: { xs: "none", md: "block" } }}>
				{isLogin ? (
					<Button
						variant='outlined'
						sx={{
							color: { xs: "black", md: "white" },
							borderColor: { xs: "black", md: "white" },
						}}
						onClick={handleLogout}
						disabled={isLogouting}>
						{isLogouting ? (
							<CircularProgress
								size={24}
								color='inherit'
							/>
						) : (
							"Sign Out"
						)}
					</Button>
				) : (
					<Button
						variant='outlined'
						sx={{
							color: { xs: "black", md: "white" },
							borderColor: { xs: "black", md: "white" },
						}}
						component={Link}
						to='/login'>
						Sign In
					</Button>
				)}
			</Box>
			<IconButton
				color='inherit'
				aria-label='open drawer'
				edge='end'
				onClick={onMenuOpen}
				sx={{ display: { md: "none" }, color: { xs: "white", md: "black" } }}>
				<MenuIcon />
			</IconButton>
		</Toolbar>
	</AppBar>
);

const MobileDrawer = ({ navLinks, isMenuOpen, onMenuClose }) => (
	<Drawer
		anchor='right'
		open={isMenuOpen}
		onClose={onMenuClose}
		PaperProps={{ sx: { backgroundColor: "black", color: "white" } }}>
		<Box
			sx={{ width: 250 }}
			role='presentation'
			onClick={onMenuClose}
			onKeyDown={onMenuClose}>
			<List>
				{navLinks.map((link) => (
					<ListItem
						button
						key={link.label}
						component={Link}
						to={link.to}>
						<ListItemText primary={link.label} />
					</ListItem>
				))}
			</List>
		</Box>
	</Drawer>
);

const SpecItem = ({ icon, value, label }) => (
	<Stack
		alignItems='center'
		spacing={0.5}>
		{React.cloneElement(icon, {
			sx: { color: { xs: "white", md: "grey.700" } },
		})}
		<Typography
			variant='h6'
			sx={{ fontWeight: "bold", color: { xs: "white", md: "black" } }}>
			{value}
		</Typography>
		<Typography
			variant='caption'
			sx={{ color: { xs: "grey.400", md: "grey.600" } }}>
			{label}
		</Typography>
	</Stack>
);

const PageDots = () => {
	const [activeDot, setActiveDot] = useState(0);
	return (
		<Stack
			direction='row'
			spacing={1.5}
			sx={{
				position: "absolute",
				bottom: { xs: 16, md: 32 },
				left: { xs: "50%", md: 64 },
				transform: { xs: "translateX(-50%)", md: "none" },
				zIndex: 5,
			}}>
			{[...Array(3)].map((_, i) => (
				<Box
					key={i}
					onClick={() => setActiveDot(i)}
					sx={{
						width: 8,
						height: 8,
						borderRadius: "50%",
						border: { xs: "1px solid white", md: "1px solid black" },
						cursor: "pointer",
						backgroundColor:
							i === activeDot ? { xs: "white", md: "black" } : "transparent",
						transition: "background-color 0.3s ease",
					}}
				/>
			))}
		</Stack>
	);
};

export default CamaroShowcaseHome;
