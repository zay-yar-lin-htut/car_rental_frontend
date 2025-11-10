import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
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
import FooterSection from "./Components/FooterSection";
import { getNavLinks } from "./Config/navigationConfig";

import IntroSection from "./Components/IntroSection";
import HighlightsSection from "./Components/HighlightsSection";
import OurOffersSection from "./Components/OurOffersSection";
import ContactUs from "../../contactUs/ContactUs";
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
	const [isLoadingHighlights, setIsLoadingHighlights] = useState(
		!highlightsCache
	);
	const { role } = useUserRole();

	const isLogin = AUTH_CONFIG.isAuthenticated();
	const [isContactUsOpen, setContactUsOpen] = useState(false);

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
			setIsLoadingHighlights(true);
			try {
				const response = await dataServices.retrieve(
					API_ENDPOINTS.carTypes.base,
					API_ENDPOINTS.carTypes.getAll
				);
				highlightsCache = response.data; // Store in cache
				setHighlightsData(response.data);
			} catch (error) {
				showSnackbar(error.message, "error");
			} finally {
				setIsLoadingHighlights(false);
			}
		};

		// Only fetch data if our cache is empty.
		if (!highlightsCache) {
			fetchHighlightsData();
		}
	}, []);

	const navLinks = useMemo(() => getNavLinks(isLogin, role), [isLogin, role]);

	const handleLogout = () => {
		setLogouting(true);
		AUTH_CONFIG.clearToken();
		AUTH_CONFIG.clearUserData();
		navigate("/login");

		dataServices
			.Logout(API_ENDPOINTS.auth.logout)
			.then((response) => {
				setLogouting(false);
				// showSnackbar(response.message, "success");
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
				bgcolor: "var(--background-color)",
				color: "var(--text-color)",
				overflowX: "hidden",
			}}>
			<TopAppBar
				navLinks={navLinks}
				isLogin={isLogin}
				handleLogout={handleLogout}
				isLogouting={logouting}
				setIsMenuOpen={setIsMenuOpen}
				setContactUsOpen={setContactUsOpen}
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

			{/* <HeroSection /> */}
			<IntroSection />
			<HighlightsSection
				highlightsData={highlightsData}
				isLoading={isLoadingHighlights}
			/>
			<OurOffersSection />
			<FooterSection />

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
			<ContactUs
				open={isContactUsOpen}
				onClose={() => setContactUsOpen(false)}
			/>
		</Box>
	);
};

// --- Sub-components ---
const TopAppBar = ({
	navLinks,
	isLogin,
	handleLogout,
	isLogouting,
	setIsMenuOpen,
	setContactUsOpen,
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
				backgroundColor: scrolled ? "rgba(30, 30, 30, 0.9)" : "transparent",
				color: "var(--text-color)",
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
					{navLinks.map((link) =>
						link.label === "Contact Us" ? (
							<Link
								key={link.label}
								onClick={() => setContactUsOpen(true)}
								style={{ textDecoration: "none" }}>
								<Typography sx={{ "&:hover": { color: "var(--text-color)" } }}>
									{link.label}
								</Typography>
							</Link>
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
							sx={{
								color: "var(--text-color)",
							}}
							onClick={handleLogout}>
							{isLogouting ? "Logging Out..." : "Sign Out"}
						</Button>
					) : (
						<Button
							sx={{
								color: "var(--text-color)",
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
	setContactUsOpen,
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
							component={link.label === "Contact Us" ? "button" : Link}
							to={link.to}
							onClick={
								link.label === "Contact Us"
									? () => setContactUsOpen(true)
									: null
							}>
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
