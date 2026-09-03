import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
	Box,
	Drawer,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Toolbar,
	AppBar,
	Typography,
	Button,
	CircularProgress,
	IconButton,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from "@mui/icons-material/Category";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HistoryIcon from "@mui/icons-material/History";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PersonIcon from "@mui/icons-material/Person";

import { API_ENDPOINTS, AUTH_CONFIG } from "../../services/Configuration";
import { useSnackbar } from "../../contexts/ErrorMessage";
import MenuIcon from "@mui/icons-material/Menu";

const drawerWidth = 260;

const AdminLayout = () => {
	const { showSnackbar } = useSnackbar();
	const location = useLocation();
	const [logouting, setLogouting] = React.useState(false);
	const [mobileOpen, setMobileOpen] = React.useState(false);

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	const handleLogout = async () => {
		setLogouting(true);
		try {
			// Clear all authentication data
			await AUTH_CONFIG.clearToken();
			await AUTH_CONFIG.clearUserData();
			// Force a full page reload to ensure all application state is reset.
			window.location.assign("/");
		} catch {
			showSnackbar("Logout failed. Please try again.", "error");
			setLogouting(false);
		}
	};

	const adminNavItems = [
		{
			text: "Dashboard",
			to: "/admin/dashboard",
			icon: <DashboardIcon />,
		},
		{
			text: "User Management",
			to: "/admin/user-management",
			icon: <AdminPanelSettingsIcon />,
		},
		{
			text: "Car Management",
			to: "/admin/car-management",
			icon: <DirectionsCarIcon />,
		},
		{
			text: "Location Management",
			to: "/admin/location-management",
			icon: <LocationOnIcon />,
		},
		{
			text: "Car Type Management",
			to: "/admin/car-type-management",
			icon: <CategoryIcon />,
		},
		{
			text: "Contact Management",
			to: "/admin/contact-management",
			icon: <ContactMailIcon />,
		},
		{
			text: "Profile",
			to: "profile",
			icon: <PersonIcon />,
		},
	];

	const navItems = adminNavItems;

	return (
		<Box sx={{ display: "flex", bgcolor: "var(--background-color)" }}>
			<AppBar
				position='fixed'
				sx={{
					zIndex: 1201,
					bgcolor: "var(--background-paper)",
				}}>
				<Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
					<IconButton
						color='primary'
						aria-label='open drawer'
						edge='start'
						onClick={handleDrawerToggle}
						sx={{ mr: 2, display: { sm: "none" }, bgcolor: "var(--primary-color)", color: "white" }}>
						<MenuIcon />
					</IconButton>
					<Typography
						variant='h6'
						noWrap
						component='div'
						fontWeight={600}
						color='var(--text-color)'>
						Admin Dashboard
					</Typography>

					<Button
						sx={{
							color: "error.main",
							border: "1px solid",
							borderColor: "error.main",
							boxShadow: 2,
						}}
						onClick={handleLogout}>
						{logouting ? "Logging Out..." : "Sign Out"}
					</Button>
				</Toolbar>
			</AppBar>
			<Box
				component='nav'
				sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
				aria-label='mailbox folders'>
				{/* Drawer for mobile */}
				<Drawer
					variant='temporary'
					open={mobileOpen}
					onClose={handleDrawerToggle}
					ModalProps={{
						keepMounted: true, // Better open performance on mobile.
					}}
					sx={{
						display: { xs: "block", sm: "none" },
						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: drawerWidth,
							bgcolor: "var(--background-paper)",
						},
					}}>
					<Toolbar />
					<Box sx={{ overflow: "auto", mt: 4 }}>
						<List>
							{navItems.map((item) => (
								<ListItem
									key={item.text}
									sx={{
										backgroundColor:
											location.pathname === item.to
												? "var(--primary-color)"
												: "transparent",
										"&:hover": {
											backgroundColor: "rgba(255, 152, 0, 0.1)",
										},
										my: 1,
									}}
									disablePadding>
									<ListItemButton
										component={Link}
										to={item.to}>
										<ListItemIcon
											sx={{
												color:
													location.pathname === item.to
														? "var(--primary-contrast-text)"
														: "var(--text-color)",
											}}>
											{item.icon}
										</ListItemIcon>
										<ListItemText
											primary={item.text}
											sx={{
												color:
													location.pathname === item.to
														? "var(--primary-contrast-text)"
														: "var(--text-color)",
											}}
										/>
									</ListItemButton>
								</ListItem>
							))}
						</List>
					</Box>
				</Drawer>
				{/* Drawer for desktop */}
				<Drawer
					variant='permanent'
					sx={{
						display: { xs: "none", sm: "block" },
						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: drawerWidth,
							bgcolor: "var(--background-paper)",
						},
					}}
					open>
					<Toolbar />
					<Box sx={{ overflow: "auto", mt: 4 }}>
						<List>
							{navItems.map((item) => (
								<ListItem
									key={item.text}
									sx={{
										backgroundColor:
											location.pathname === item.to
												? "var(--primary-color)"
												: "transparent",
										"&:hover": {
											backgroundColor: "rgba(255, 152, 0, 0.1)",
										},
										my: 1,
									}}
									disablePadding>
									<ListItemButton
										component={Link}
										to={item.to}>
										<ListItemIcon
											sx={{
												color:
													location.pathname === item.to
														? "var(--primary-contrast-text)"
														: "var(--text-color)",
											}}>
											{item.icon}
										</ListItemIcon>
										<ListItemText
											primary={item.text}
											sx={{
												color:
													location.pathname === item.to
														? "var(--primary-contrast-text)"
														: "var(--text-color)",
											}}
										/>
									</ListItemButton>
								</ListItem>
							))}
						</List>
					</Box>
				</Drawer>
			</Box>
			<Box
				component='main'
				sx={{
					flexGrow: 1,
					p: 3,
					width: { xs: "100%", sm: `calc(100% - ${drawerWidth}px)` },
					minHeight: "100vh",
					color: "var(--text-color)",
				}}>
				<Toolbar />
				<Outlet />
			</Box>
		</Box>
	);
};

export default AdminLayout;
