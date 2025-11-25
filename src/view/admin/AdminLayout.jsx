import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
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
import HomeIcon from "@mui/icons-material/Home";

import { API_ENDPOINTS, AUTH_CONFIG } from "../../services/Configuration";
import { useSnackbar } from "../../contexts/ErrorMessage";
import { createDataServices } from "../../services/DataServices";
import MenuIcon from "@mui/icons-material/Menu";
import { useUserRole } from "../../contexts/userRoleContext";

const drawerWidth = 260;

const AdminLayout = () => {
	const dataServices = createDataServices();
	const { showSnackbar } = useSnackbar();
	const navigate = useNavigate();
	const location = useLocation();
	const [logouting, setLogouting] = React.useState(false);
	const { role } = useUserRole();
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
		} catch (error) {
			showSnackbar("Logout failed. Please try again.", "error");
			setLogouting(false);
		}
	};

	const adminNavItems = [
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
			text: "Contact Management",
			to: "/admin/contact-management",
			icon: <ContactMailIcon />,
		},
	];

	const staffNavItems = [
		{
			text: "Task Management",
			to: "/admin/task-management",
			icon: <AssignmentIcon />,
		},
	];

	const navItems = role === "admin" ? adminNavItems : staffNavItems;

	// If the role hasn't been loaded yet, display a loading indicator
	// to prevent rendering the wrong sidebar.
	if (!role) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
				}}>
				<CircularProgress />
			</Box>
		);
	}

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
						color='inherit'
						aria-label='open drawer'
						edge='start'
						onClick={handleDrawerToggle}
						sx={{ mr: 2, display: { sm: "none" } }}>
						<MenuIcon />
					</IconButton>
					<Typography
						variant='h6'
						noWrap
						component='div'
						fontWeight={600}
						color='var(--text-color)'>
						{role === "admin" ? "Admin" : "Staff"} Dashboard
					</Typography>

					<Button
						sx={{
							color: "error.main",
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
