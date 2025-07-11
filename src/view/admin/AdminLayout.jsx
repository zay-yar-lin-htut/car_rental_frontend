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
import DashboardIcon from "@mui/icons-material/Dashboard";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { UserProvider } from "../../contexts/UserProvider";

const drawerWidth = 260;

const AdminLayout = () => {
	const navigate = useNavigate();
	const location = useLocation();

	return (
		<UserProvider>
			<Box sx={{ display: "flex" }}>
				<AppBar
					position='fixed'
					sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
					<Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
						<Typography
							variant='h6'
							noWrap
							component='div'>
							Admin Dashboard
						</Typography>
						<Button
							color='inherit'
							startIcon={<ExitToAppIcon />}
							onClick={() => navigate("/")}>
							Back to Site
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
						},
					}}>
					<Toolbar />
					<Box sx={{ overflow: "auto", mt: 4 }}>
						<List>
							{[
								{
									text: "Dashboard",
									to: "/dashboard",
									icon: <DashboardIcon />,
								},
								{
									text: "Admin Panel",
									to: "/admin-panel",
									icon: <AdminPanelSettingsIcon />,
								},
								{
									text: "Profile",
									to: "/user-profile",
									icon: <AccountCircleIcon />,
								},
							].map((item) => (
								<ListItem
									key={item.text}
									sx={{
										backgroundColor:
											location.pathname === item.to ? "#d9d9d9" : "transparent",

										"&:hover": {
											backgroundColor: "#f5f5f5",
										},
										my: 1,
									}}
									disablePadding>
									<ListItemButton
										component={Link}
										to={item.to}>
										<ListItemIcon>{item.icon}</ListItemIcon>
										<ListItemText primary={item.text} />
									</ListItemButton>
								</ListItem>
							))}
						</List>
					</Box>
				</Drawer>
				<Box
					component='main'
					sx={{ flexGrow: 1, p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
					<Toolbar />
					<Outlet />
				</Box>
			</Box>
		</UserProvider>
	);
};

export default AdminLayout;
