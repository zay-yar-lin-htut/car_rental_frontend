import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
	Box,
	Typography,
	Button,
	AppBar,
	Toolbar,
	IconButton,
	Drawer,
	List,
	ListItem,
	ListItemText,
	Divider,
	useTheme,
	useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const CommonAppBar = ({
	navLinks = [],
	isLogin,
	handleLogout,
	isLogouting,
	isMenuOpen,
	setIsMenuOpen,
	setContactUsOpen,
	hideNavbarOnMobile = false,
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

	const hasNavLinks = navLinks.length > 0;

	return (
		<>
			<AppBar
				position='fixed'
				elevation={scrolled ? 4 : 0}
				sx={{
					py: 1,
					zIndex: 100,
					backgroundColor: scrolled ? "rgba(111, 111, 111, 0.9)" : "rgba(111, 111, 111, 0.9)",
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
					{hasNavLinks && (
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
										onClick={() => setContactUsOpen && setContactUsOpen(true)}
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
					)}
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
								onClick={handleLogout}
								disabled={isLogouting}>
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
							hasNavLinks ? (
								<IconButton
									color='inherit'
									aria-label='open drawer'
									edge='start'
									onClick={() => setIsMenuOpen && setIsMenuOpen((prev) => !prev)}
									sx={{ mr: 2 }}>
									<MenuIcon />
								</IconButton>
							) : (
								<IconButton
									color='inherit'
									aria-label='logout'
									onClick={handleLogout}>
									<MenuIcon />
								</IconButton>
							)
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
			{hasNavLinks && (
				<MobileDrawer
					navLinks={navLinks}
					isMenuOpen={isMenuOpen}
					onMenuClose={() => setIsMenuOpen(false)}
					isLogin={isLogin}
					handleLogout={handleLogout}
					isLogouting={isLogouting}
					setContactUsOpen={setContactUsOpen}
				/>
			)}
		</>
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
									? () => setContactUsOpen && setContactUsOpen(true)
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
							onClick={handleLogout}
							disabled={isLogouting}>
							{isLogouting ? "Logging Out..." : "Sign Out"}
						</Button>
					</ListItem>
				)}
			</List>
		</Box>
	</Drawer>
);

export default CommonAppBar;