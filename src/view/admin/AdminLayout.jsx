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
	ThemeProvider,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { UserProvider } from "../../contexts/UserProvider";
import { theme } from "../home/Config/theme";

const drawerWidth = 260;

const AdminLayout = () => {
	const navigate = useNavigate();
	const location = useLocation();

	return (
		<UserProvider>
			<ThemeProvider theme={theme}>
				<Box sx={{ display: "flex", bgcolor: "background.default" }}>
					<AppBar
						position='fixed'
						sx={{
							zIndex: (theme) => theme.zIndex.drawer + 1,
							bgcolor: "background.paper",
						}}>
						<Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
							<Typography
								variant='h6'
								noWrap
								component='div'
								color='text.primary'>
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
								bgcolor: "background.paper",
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
												location.pathname === item.to
													? "primary.main"
													: "transparent",
											"&:hover": {
												backgroundColor: "rgba(0, 245, 212, 0.1)",
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
															? "primary.contrastText"
															: "text.primary",
												}}>
												{item.icon}
											</ListItemIcon>
											<ListItemText
												primary={item.text}
												sx={{
													color:
														location.pathname === item.to
															? "primary.contrastText"
															: "text.primary",
												}}/>
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
							color: "text.primary",
						}}>
						<Toolbar />
						<Outlet />
					</Box>
				</Box>
			</ThemeProvider>
		</UserProvider>
	);
};

export default AdminLayout;
