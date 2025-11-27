import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
	Box,
	Typography,
	Button,
	Fab,
	useTheme,
	useMediaQuery,
} from "@mui/material";
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
import { useIntroForm } from "../../contexts/IntroFormProvider";
import FooterSection from "./Components/FooterSection";
import { getNavLinks } from "./Config/navigationConfig";

import IntroSection from "./Components/IntroSection";
import HighlightsSection from "./Components/HighlightsSection";
import OurOffersSection from "./Components/OurOffersSection";
import ContactUs from "../../contactUs/ContactUs";
import CommonAppBar from "../common/AppBar";
const dataServices = createDataServices();

// Simple in-memory cache to hold data across component mounts (e.g., navigation)
let highlightsCache = null;

const CamaroShowcaseHome = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const footerRef = useRef(null);
	const [hideNavbarOnMobile, setHideNavbarOnMobile] = useState(false);
	const [logouting, setLogouting] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const { showSnackbar } = useSnackbar();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [showScroll, setShowScroll] = useState(false);
	const [highlightsData, setHighlightsData] = useState(highlightsCache || []);
	const [isLoadingHighlights, setIsLoadingHighlights] = useState(
		!highlightsCache
	);
	const { role } = useUserRole();
	const { resetForm } = useIntroForm();

	const isLogin = AUTH_CONFIG.isAuthenticated();
	const [isContactUsOpen, setContactUsOpen] = useState(false);

	useEffect(() => {
		if (location.pathname === '/') {
			resetForm();
		}
		if (location.search === '?contact=true') {
			setContactUsOpen(true);
			// Remove the query param
			window.history.replaceState(null, '', '/');
		}
	}, [location.pathname, location.search, resetForm]);

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

	useEffect(() => {
		if (!isMobile) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				setHideNavbarOnMobile(entry.isIntersecting);
			},
			{ threshold: 0.1 }
		);

		if (footerRef.current) {
			observer.observe(footerRef.current);
		}

		return () => observer.disconnect();
	}, [isMobile]);

	const navLinks = useMemo(() => getNavLinks(isLogin), [isLogin]);

	const handleLogout = () => {
		setLogouting(true);
		AUTH_CONFIG.clearToken();
		AUTH_CONFIG.clearUserData();
		navigate("/");
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
			<CommonAppBar
				navLinks={navLinks}
				isLogin={isLogin}
				handleLogout={handleLogout}
				isLogouting={logouting}
				isMenuOpen={isMenuOpen}
				setIsMenuOpen={setIsMenuOpen}
				setContactUsOpen={setContactUsOpen}
				hideNavbarOnMobile={hideNavbarOnMobile}
			/>

			{/* <HeroSection /> */}
			<IntroSection />
			<HighlightsSection
				highlightsData={highlightsData}
				isLoading={isLoadingHighlights}
			/>
			<OurOffersSection />
			<FooterSection ref={footerRef} />

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



export default CamaroShowcaseHome;
