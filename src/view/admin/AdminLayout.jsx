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
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HomeIcon from "@mui/icons-material/Home";

import { API_ENDPOINTS, AUTH_CONFIG } from "../../services/Configuration";
import { useSnackbar } from "../../contexts/ErrorMessage";
import { createDataServices } from "../../services/DataServices";
import { useUserRole } from "../../contexts/userRoleContext";

const drawerWidth = 260;

const AdminLayout = () => {
	const dataServices = createDataServices();
	const { showSnackbar } = useSnackbar();
	const navigate = useNavigate();
	const location = useLocation();
	const [logouting, setLogouting] = React.useState(false);
	const { role } = useUserRole();

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

	return (
		<Box sx={{ display: "flex", bgcolor: "var(--background-color)" }}>
			<AppBar
				position='fixed'
				sx={{
					zIndex: 1201,
					bgcolor: "var(--background-paper)",
				}}>
				<Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
					<Typography
						variant='h6'
						noWrap
						component='div'
						color='var(--text-color)'>
						Admin Dashboard
					</Typography>
					<Typography
						variant='h6'
						component={Link}
						to='/'
						sx={{ textDecoration: "none", color: "var(--text-color)" }}>
						<HomeIcon />
					</Typography>
					<Button
						sx={{
							color: "var(--text-color)",
						}}
						onClick={handleLogout}>
						{logouting ? "Logging Out..." : "Sign Out"}
					</Button>
				</Toolbar>
			</AppBar>
			<Drawer
				variant='permanent'
				sx={{
					width: drawerWidth,
					flexShrink: 0,
					[`& .MuiDrawer-paper`]: {
						width: drawerWidth,
						boxSizing: "border-box",
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
			<Box
				component='main'
				sx={{
					flexGrow: 1,
					p: 3,
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
