import React from "react";
import "./admin.css";
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


const drawerWidth = 260;

const AdminLayout = () => {
	const navigate = useNavigate();
	const location = useLocation();

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
							bgcolor: "var(--background-paper)",
						},
					}}>
					<Toolbar />
					<Box sx={{ overflow: "auto", mt: 4 }}>
						<List>
							{[
								{
									text: "User Management",
									to: "/user-management",
									icon: <AdminPanelSettingsIcon />,
								},
								{
									text: "Car Management",
									to: "/car-management",
									icon: <AccountCircleIcon />,
								},
								{
									text: "Contact Management",
									to: "/contact-management",
									icon: <AccountCircleIcon />,
								},
								{
									text: "Task Management",
									to: "/task-management",
									icon: <AccountCircleIcon />,
								},
								{
									text: "Office Location",
									to: "/our-locations",
									icon: <AccountCircleIcon />,
								},
							].map((item) => (
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
