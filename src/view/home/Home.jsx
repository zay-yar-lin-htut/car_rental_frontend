import React, { useState, useMemo, useEffect, useRef } from "react";
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
	Container,
	Grid,
	Card,
	CardContent,
	Fab,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Paper,
} from "@mui/material";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import SpeedIcon from "@mui/icons-material/Speed";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import LayersIcon from "@mui/icons-material/Layers";
import ScaleIcon from "@mui/icons-material/Scale";

// --- Libs for animations ---
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS styles

// Assuming these are correctly set up in your project
import { API_ENDPOINTS, AUTH_CONFIG } from "../../services/Configuration";
import { createDataServices } from "../../services/DataServices";
import { useSnackbar } from "../../contexts/ErrorMessage";
import { useUserRole } from "../../contexts/userRoleContext";

const dataServices = createDataServices();

// --- Static data for the page design ---
const porscheStats = [
	{ value: "331 kW/450 PS", label: "Power (kW)/Power (PS)" },
	{ value: "3.7 s", label: "Acceleration 0 - 100 km/h" },
	{ value: "308 km/h", label: "Top speed" },
];

const keySpecs = [
	{ icon: <WhatshotIcon fontSize='large' />, value: "450 PS", label: "Power" },
	{ icon: <SpeedIcon fontSize='large' />, value: "3.7 s", label: "0-100 km/h" },
	{
		icon: <TrendingUpIcon fontSize='large' />,
		value: "308 km/h",
		label: "Top Speed",
	},
	{
		icon: <RotateRightIcon fontSize='large' />,
		value: "530 Nm",
		label: "Max. Torque",
	},
	{
		icon: <LayersIcon fontSize='large' />,
		value: "2,981 cm³",
		label: "Displacement",
	},
	{
		icon: <ScaleIcon fontSize='large' />,
		value: "1,515 kg",
		label: "Unladen Weight",
	},
];

const highlightsData = [
	{
		title: "Weight Reduction",
		description:
			"Intelligent composite design for maximum rigidity and minimum weight.",
		image: "/porsche-highlight-1.jpg",
	},
	{
		title: "Sports Seats Plus",
		description:
			"Optimal support during dynamic cornering with electric 4-way adjustment.",
		image: "/porsche-highlight-2.jpg",
	},
	{
		title: "PASM Sports Suspension",
		description:
			"Electronically controlled damping system for active, continuous adjustment.",
		image: "/porsche-highlight-3.jpg",
	},
	{
		title: "20/21-inch Carrera S Wheels",
		description:
			"Staggered wheel sizes for enhanced stability and driving dynamics.",
		image: "/porsche-highlight-4.jpg",
	},
	{
		title: "GT Sports Steering Wheel",
		description: "Provides a direct and unfiltered connection to the road.",
		image: "/porsche-highlight-5.jpg",
	},
];

const CamaroShowcaseHome = () => {
	// --- State and Logic ---
	const [logouting, setLogouting] = useState(false);
	const navigate = useNavigate();
	const { showSnackbar } = useSnackbar();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [showScroll, setShowScroll] = useState(false);
	const { role } = useUserRole();
	const isLogin = AUTH_CONFIG.isAuthenticated();

	// --- Initialize AOS and Scroll Listener ---
	useEffect(() => {
		AOS.init({ duration: 1000, once: true, offset: 100 });

		const checkScrollTop = () => {
			setShowScroll(window.pageYOffset > 400);
		};

		window.addEventListener("scroll", checkScrollTop);
		return () => window.removeEventListener("scroll", checkScrollTop);
	}, []);

	const navLinks = useMemo(() => {
		const baseLinks = [{ to: "/", label: "Home" }];

		if (isLogin) {
			if (role === "admin") {
				return [
					...baseLinks,
					{ to: "/dashboard", label: "Dashboard" },
					{ to: "/admin-panel", label: "Admin Panel" },
					{ to: "/user-profile", label: "Profile" },
				];
			}
			// For 'user' and 'staff' roles
			return [
				...baseLinks,
				{ to: "/cars", label: "Models" },
				{ to: "/innovation", label: "Innovation" },
				{ to: "/user-profile", label: "Profile" },
			];
		}

		// For non-logged-in users
		return [
			...baseLinks,
			{ to: "/cars", label: "Models" },
			{ to: "/innovation", label: "Innovation" },
		];
	}, [isLogin, role]);

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

	const scrollTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<Box
			sx={{
				bgcolor: "#0a0a0a",
				color: "white",
				fontFamily: "'Exo 2', sans-serif",
				overflowX: "hidden",
			}}>
			{/* ===== Top Navigation (Unchanged as requested) ===== */}
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

			<HeroSection />
			<IntroSection />
			<TechSpecsSection />
			<HighlightsSection />
			<FooterSection />

			{/* ===== Scroll to Top Button ===== */}
			<Fab
				color='primary'
				size='large'
				aria-label='scroll back to top'
				onClick={scrollTop}
				sx={{
					position: "fixed",
					bottom: 32,
					right: 32,
					opacity: showScroll ? 1 : 0,
					transform: showScroll ? "scale(1)" : "scale(0)",
					transition: "opacity 0.3s, transform 0.3s",
					zIndex: 100,
				}}>
				<KeyboardArrowUpIcon />
			</Fab>
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
}) => {
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
				zIndex: 10,
				px: { xs: 2, md: 4 },
				backgroundColor: scrolled ? "rgba(10, 10, 10, 0.85)" : "transparent",
				backdropFilter: scrolled ? "blur(10px)" : "none",
				transition:
					"background-color 0.3s ease, box-shadow 0.3s ease, py 0.3s ease",
			}}>
			<Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
				<Typography
					variant='h6'
					component='div'
					sx={{
						fontWeight: "bold",
						color: "white",
						fontFamily: "'Orbitron', sans-serif",
					}}>
					JOURNEYWHEEL
				</Typography>
				<Box
					sx={{
						flexGrow: 1,
						display: { xs: "none", md: "flex" },
						justifyContent: "center",
						gap: 10,
					}}>
					{navLinks.map((link) => (
						<Link
							key={link.label}
							to={link.to}
							style={{ textDecoration: "none" }}>
							<Typography
								sx={{ color: "white", "&:hover": { color: "error.light" } }}>
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
								color: "white",
								borderColor: "white",
								"&:hover": {
									borderColor: "error.light",
									bgcolor: "rgba(255,255,255,0.1)",
								},
							}}
							onClick={handleLogout}>
							{isLogouting ? "Logging Out..." : "Sign Out"}
						</Button>
					) : (
						<Button
							variant='outlined'
							sx={{
								color: "white",
								borderColor: "white",
								"&:hover": {
									borderColor: "error.light",
									bgcolor: "rgba(255,255,255,0.1)",
								},
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
					sx={{ display: { md: "none" }, color: "white" }}>
					<MenuIcon />
				</IconButton>
			</Toolbar>
		</AppBar>
	);
};

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

const HeroSection = () => (
	<Box
		sx={{
			height: "100vh",
			position: "relative",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			overflow: "hidden", // Hide video overflow
		}}>
		<video
			autoPlay
			loop
			muted
			style={{
				position: "absolute",
				width: "100%",
				height: "100%",
				left: "50%",
				top: "50%",
				objectFit: "cover",
				transform: "translate(-50%, -50%)",
				zIndex: 1,
			}}>
			<source
				src='/background/hero-vd.mp4'
				type='video/mp4'
			/>
			Your browser does not support the video tag.
		</video>
		<Box
			sx={{
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				// Dark overlay for text readability
				background:
					"linear-gradient(to top, rgba(10,10,10,1) 10%, rgba(10,10,10,0.4) 50%, rgba(10,10,10,0.8) 100%)",
				zIndex: 2,
			}}
		/>
		<Container
			maxWidth='lg'
			sx={{ position: "relative", zIndex: 3, textAlign: "center" }}>
			<Typography
				variant='h1'
				fontWeight={900}
				letterSpacing={2}
				data-aos='fade-down'
				sx={{
					textTransform: "uppercase",
					fontFamily: "'Orbitron', sans-serif",
					fontSize: { xs: "3rem", sm: "4.5rem", md: "6rem" },
				}}>
				911 Carrera S
			</Typography>
			<Stack
				direction='row'
				spacing={{ xs: 2, md: 6 }}
				justifyContent='center'
				sx={{ mt: 4, color: "#fff" }}>
				{porscheStats.map((stat, index) => (
					<Box
						key={stat.label}
						data-aos='fade-up'
						data-aos-delay={index * 200}>
						<Typography
							variant='h4'
							fontWeight='bold'
							sx={{ color: "#fff" }}>
							{stat.value}
						</Typography>
						<Typography
							variant='body2'
							color='grey.400'
							textTransform='uppercase'>
							{stat.label}
						</Typography>
					</Box>
				))}
			</Stack>
		</Container>
	</Box>
);

const IntroSection = () => (
	<Box sx={{ py: { xs: 8, md: 15 } }}>
		<Container maxWidth='lg'>
			<Grid
				container
				spacing={6}
				alignItems='center'>
				<Grid
					item
					xs={12}
					md={6}
					data-aos='fade-right'>
					<Typography
						variant='h3'
						component='h2'
						fontWeight={800}
						gutterBottom
						sx={{ fontFamily: "'Orbitron', sans-serif" }}>
						What's New for the 2020 Porsche 911 Carrera S?
					</Typography>
					<Typography
						variant='body1'
						color='grey.400'
						lineHeight={1.8}>
						The 2020 911 Carrera S is more powerful and faster than ever before.
						With a new generation of turbocharged six-cylinder boxer engines, it
						delivers a stunning performance on both road and track. The
						completely new 8-speed Porsche Doppelkupplung (PDK) allows for
						extremely fast gear changes without interrupting the flow of power.
						Inside, the new Porsche Communication Management (PCM) with online
						navigation provides a state-of-the-art cockpit experience.
					</Typography>
				</Grid>
				<Grid
					item
					xs={12}
					md={6}
					data-aos='fade-left'>
					<Box
						alt='Porsche 911 Rear View'
						sx={{ width: "100%", borderRadius: 2, boxShadow: 15 }}>
						<img
							src='/car-1.jpg'
							alt='Porsche 911 Rear View'
							style={{ width: "100%", borderRadius: 2 }}
						/>
					</Box>
				</Grid>
			</Grid>
		</Container>
	</Box>
);

const TechSpecsSection = () => (
	<Box sx={{ py: { xs: 8, md: 15 }, bgcolor: "#1c1c1c" }}>
		<Container maxWidth='lg'>
			<Grid
				container
				spacing={6}
				alignItems='center'>
				<Grid
					item
					xs={12}
					md={7}
					data-aos='fade-right'>
					<Typography
						variant='h3'
						component='h2'
						fontWeight={800}
						gutterBottom
						sx={{ fontFamily: "'Orbitron', sans-serif", mb: 4 }}>
						Engineered for Performance
					</Typography>
					<Grid
						container
						spacing={3}>
						{keySpecs.map((spec, index) => (
							<Grid
								item
								xs={6}
								sm={4}
								key={index}>
								<Paper
									variant='outlined'
									sx={{
										p: 3,
										textAlign: "center",
										height: "100%",
										borderColor: "rgba(255, 255, 255, 0.1)",
										background: "rgba(255, 255, 255, 0.05)",
										color: "white",
										transition: "all 0.3s ease",
										"&:hover": {
											transform: "translateY(-5px)",
											borderColor: "error.main",
											background: "rgba(211, 47, 47, 0.1)",
										},
									}}>
									<Box sx={{ color: "error.main", mb: 1 }}>{spec.icon}</Box>
									<Typography
										variant='h5'
										fontWeight='bold'>
										{spec.value}
									</Typography>
									<Typography
										variant='body2'
										color='grey.400'>
										{spec.label}
									</Typography>
								</Paper>
							</Grid>
						))}
					</Grid>
				</Grid>
				<Grid
					item
					xs={12}
					md={5}
					data-aos='fade-left'>
					<Box
						sx={{
							width: "100%",
							height: "100%",
							position: "relative",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}>
						<img
							src='/car-2.png'
							alt='Porsche 911 Top View Schematic'
							style={{ width: "100%", maxWidth: "400px", zIndex: 2 }}
						/>
						{/* Background Glow */}
						<Box
							sx={{
								position: "absolute",
								width: "100%",
								height: "100%",
								background:
									"radial-gradient(circle, rgba(211, 47, 47, 0.2) 0%, rgba(28, 28, 28, 0) 70%)",
								zIndex: 1,
							}}
						/>
					</Box>
				</Grid>
			</Grid>
		</Container>
	</Box>
);

const HighlightsSection = () => {
	const [activeStep, setActiveStep] = useState(0);
	const maxSteps = highlightsData.length;

	const handleNext = () => {
		setActiveStep((prevActiveStep) => (prevActiveStep + 1) % maxSteps);
	};

	const handleBack = () => {
		setActiveStep(
			(prevActiveStep) => (prevActiveStep - 1 + maxSteps) % maxSteps
		);
	};

	return (
		<Box sx={{ py: { xs: 8, md: 15 } }}>
			<Container maxWidth='lg'>
				<Typography
					variant='h3'
					component='h2'
					fontWeight={800}
					textAlign='center'
					gutterBottom
					data-aos='fade-up'
					sx={{ fontFamily: "'Orbitron', sans-serif" }}>
					911 Carrera S Highlights
				</Typography>
				<Box
					sx={{ position: "relative", mt: 6 }}
					data-aos='zoom-in'>
					<Card
						sx={{
							bgcolor: "#1c1c1c",
							color: "white",
							borderRadius: 2,
							boxShadow: 15,
						}}>
						<Box
							component='img'
							src={highlightsData[activeStep].image}
							alt={highlightsData[activeStep].title}
							sx={{
								width: "100%",
								height: { xs: 250, md: 500 },
								objectFit: "cover",
							}}
						/>
						<CardContent sx={{ p: 4 }}>
							<Typography
								variant='h5'
								fontWeight='bold'
								gutterBottom>
								{highlightsData[activeStep].title}
							</Typography>
							<Typography color='grey.400'>
								{highlightsData[activeStep].description}
							</Typography>
						</CardContent>
					</Card>
					<IconButton
						onClick={handleBack}
						sx={{
							position: "absolute",
							top: "50%",
							left: 16,
							transform: "translateY(-50%)",
							bgcolor: "rgba(0,0,0,0.5)",
							"&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
						}}>
						<ArrowBackIosNewIcon sx={{ color: "white" }} />
					</IconButton>
					<IconButton
						onClick={handleNext}
						sx={{
							position: "absolute",
							top: "50%",
							right: 16,
							transform: "translateY(-50%)",
							bgcolor: "rgba(0,0,0,0.5)",
							"&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
						}}>
						<ArrowForwardIosIcon sx={{ color: "white" }} />
					</IconButton>
				</Box>
			</Container>
		</Box>
	);
};

const FooterSection = () => (
	<Box
		sx={{
			height: "60vh",
			position: "relative",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			backgroundImage: "url(/porsche-footer.jpg)",
			backgroundSize: "cover",
			backgroundPosition: "center",
			backgroundAttachment: "fixed",
		}}>
		<Box
			sx={{
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				bgcolor: "rgba(0,0,0,0.6)",
			}}
		/>
		<Typography
			variant='h4'
			fontWeight={700}
			textAlign='center'
			sx={{
				position: "relative",
				zIndex: 1,
				px: 2,
				fontFamily: "'Orbitron', sans-serif",
			}}>
			Timeless design, contemporary interpretation.
		</Typography>
	</Box>
);

export default CamaroShowcaseHome;
