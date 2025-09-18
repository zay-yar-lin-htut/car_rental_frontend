import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	ThemeProvider,
	Box,
	Typography,
	Button,
	AppBar,
	Toolbar,
	IconButton,
	Drawer,
	Divider,
	List,
	ListItem,
	ListItemText,
	Fab,
} from "@mui/material";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

// --- Libs for animations ---
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS styles
import "leaflet/dist/leaflet.css"; // Import Leaflet CSS globally for the page

// Assuming these are correctly set up in your project
import { API_ENDPOINTS, AUTH_CONFIG } from "../../services/Configuration";
import { createDataServices } from "../../services/DataServices";
import { useSnackbar } from "../../contexts/ErrorMessage";
import { useUserRole } from "../../contexts/userRoleContext";
import HeroSection from "./Components/HeroSection";
import IntroSection from "./components/IntroSection";
import HighlightsSection from "./components/HighlightsSection";
import FooterSection from "./components/FooterSection";
import { getNavLinks } from "./Config/navigationConfig";
import { theme } from "./Config/theme";
const dataServices = createDataServices();

// Simple in-memory cache to hold data across component mounts (e.g., navigation)
let highlightsCache = null;

const CamaroShowcaseHome = () => {
	const [logouting, setLogouting] = useState(false);
	const navigate = useNavigate();
	const { showSnackbar } = useSnackbar();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [showScroll, setShowScroll] = useState(false);
	const [highlightsData, setHighlightsData] = useState(highlightsCache || []);
	const { role } = useUserRole();
	const isLogin = AUTH_CONFIG.isAuthenticated();

	useEffect(() => {
		AOS.init({ duration: 1000, once: true, offset: 100 });

		const checkScrollTop = () => {
			setShowScroll(window.pageYOffset > 400);
		};

		window.addEventListener("scroll", checkScrollTop);
		return () => window.removeEventListener("scroll", checkScrollTop);
	}, []); // Empty dependency array ensures this runs only once

	useEffect(() => {
		const fetchHighlightsData = async () => {
			try {
				const response = await dataServices.retrieve(
					API_ENDPOINTS.carTypes.base,
					API_ENDPOINTS.carTypes.getAll
				);
				highlightsCache = response.data; // Store in cache
				setHighlightsData(response.data);
			} catch (error) {
				showSnackbar(error.message, "error");
			}
		};

		// Only fetch data if our cache is empty.
		if (!highlightsCache) {
			fetchHighlightsData();
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const navLinks = useMemo(() => getNavLinks(isLogin, role), [isLogin, role]);

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
		<ThemeProvider theme={theme}>
			<Box
				sx={{
					bgcolor: "background.default",
					color: "text.primary",
					overflowX: "hidden",
				}}>
				<TopAppBar
					navLinks={navLinks}
					isLogin={isLogin}
					handleLogout={handleLogout}
					isLogouting={logouting}
					setIsMenuOpen={setIsMenuOpen}
				/>
				<MobileDrawer
					navLinks={navLinks}
					isMenuOpen={isMenuOpen}
					onMenuClose={() => setIsMenuOpen(false)}
					isLogin={isLogin}
					handleLogout={handleLogout}
					isLogouting={logouting}
				/>

				{/* <HeroSection /> */}
				<IntroSection />
				<HighlightsSection highlightsData={highlightsData} />
				<FooterSection />

				<Fab
					color='secondary'
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
		</ThemeProvider>
	);
};

// --- Sub-components ---
const TopAppBar = ({
	navLinks,
	isLogin,
	handleLogout,
	isLogouting,
	setIsMenuOpen,
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
				zIndex: 10000,
				backgroundColor: scrolled ? "rgba(13, 27, 42, 0.9)" : "transparent",
				color: "text.primary",
				px: { xs: 2, md: 4 },
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
					{navLinks.map((link) => (
						<Link
							key={link.label}
							to={link.to}
							style={{ textDecoration: "none" }}>
							<Typography sx={{ "&:hover": { color: "primary.main" } }}>
								{link.label}
							</Typography>
						</Link>
					))}
				</Box>
				<Box sx={{ display: { xs: "none", md: "block" } }}>
					{isLogin ? (
						<Button
							variant='outlined'
							onClick={handleLogout}>
							{isLogouting ? "Logging Out..." : "Sign Out"}
						</Button>
					) : (
						<Button
							variant='outlined'
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
							edge='end'
							onClick={() => setIsMenuOpen((prev) => !prev)}>
							<MenuIcon />
						</IconButton>
					) : (
						<Button
							variant='outlined'
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
}) => (
	<Drawer
		anchor='top'
		open={isMenuOpen}
		onClose={onMenuClose}
		PaperProps={{
			sx: {
				backgroundColor: "#00000033",
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
							component={Link}
							to={link.to}>
							<ListItemText primary={link.label} />
						</ListItem>
						<Divider sx={{ my: 0.3 }} />
					</React.Fragment>
				))}
				{isLogin && (
					<ListItem
						button
						onClick={handleLogout}
						disabled={isLogouting}>
						<ListItemText
							primary={isLogouting ? "Logging Out..." : "Sign Out"}
						/>
					</ListItem>
				)}
			</List>
		</Box>
	</Drawer>
);

export default CamaroShowcaseHome;
