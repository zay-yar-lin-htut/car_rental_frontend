import React, { useState, useEffect, useMemo } from "react";
import {
	Typography,
	Box,
	Paper,
	Grid,
	CircularProgress,
	Alert,
} from "@mui/material";
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Tooltip,
	Legend,
} from "recharts";
import { createDataServices } from "../../services/DataServices";
import { API_ENDPOINTS } from "../../services/Configuration";
import { useSnackbar } from "../../contexts/ErrorMessage";

const dataServices = createDataServices();

// Colors for the chart segments, matching the roles in AdminPanel
const COLORS = {
	Admins: "#d32f2f", // error color
	Staff: "#f57c00", // warning color
	Users: "#1976d2", // primary color
};

const Dashboard = () => {
	const [stats, setStats] = useState({ totalUsers: 0, chartData: [] });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { showSnackbar } = useSnackbar();

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				setLoading(true);
				// NOTE: This assumes API_ENDPOINTS.users.getAll is configured
				const response = await dataServices.retrieve(
					API_ENDPOINTS.users.getAll
				);
				const users = response.data || [];

				const roleCounts = users.reduce(
					(acc, user) => {
						switch (user.user_type_id) {
							case 3:
								acc.admin += 1;
								break;
							case 2:
								acc.staff += 1;
								break;
							case 1:
								acc.user += 1;
								break;
							default:
								break;
						}
						return acc;
					},
					{ admin: 0, staff: 0, user: 0 }
				);

				const chartData = [
					{ name: "Admins", value: roleCounts.admin },
					{ name: "Staff", value: roleCounts.staff },
					{ name: "Users", value: roleCounts.user },
				].filter((entry) => entry.value > 0); // Only show roles that exist

				setStats({ totalUsers: users.length, chartData });
				setError(null);
			} catch (err) {
				const errorMessage = err.message || "Failed to fetch dashboard data.";
				setError(errorMessage);
				showSnackbar(errorMessage, "error");
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, [showSnackbar]);

	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return <Alert severity='error'>{error}</Alert>;
	}

	return (
		<Grid
			container
			spacing={3}>
			<Grid
				item
				xs={12}>
				<Typography
					variant='h4'
					gutterBottom
					sx={{ color: "common.white" }}>
					Dashboard Overview
				</Typography>
			</Grid>
			<Grid
				item
				xs={12}
				md={4}>
				<Paper
					elevation={3}
					sx={{ p: 3, bgcolor: "grey.800", color: "common.white" }}>
					<Typography
						variant='h6'
						color='text.secondary'>
						Total Users
					</Typography>
					<Typography
						variant='h3'
						fontWeight='bold'>
						{stats.totalUsers}
					</Typography>
				</Paper>
			</Grid>
			<Grid
				item
				xs={12}
				md={8}>
				<Paper
					elevation={3}
					sx={{ p: 3, bgcolor: "grey.800", color: "common.white" }}>
					<Typography
						variant='h6'
						gutterBottom>
						User Role Distribution
					</Typography>
					<Box sx={{ height: 300 }}>
						<ResponsiveContainer
							width='100%'
							height='100%'>
							<PieChart>
								<Tooltip
									contentStyle={{
										backgroundColor: "rgba(30, 30, 30, 0.85)",
										borderColor: "rgba(255, 255, 255, 0.2)",
									}}
								/>
								<Legend />
								<Pie
									data={stats.chartData}
									cx='50%'
									cy='50%'
									labelLine={false}
									outerRadius={100}
									fill='#8884d8'
									dataKey='value'
									nameKey='name'>
									{stats.chartData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={COLORS[entry.name]}
										/>
									))}
								</Pie>
							</PieChart>
						</ResponsiveContainer>
					</Box>
				</Paper>
			</Grid>
		</Grid>
	);
};

export default Dashboard;
