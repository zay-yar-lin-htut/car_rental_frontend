import React, { useMemo } from "react";
import {
	Typography,
	Box,
	Grid,
	CircularProgress,
	Alert,
	Card,
	CardContent,
} from "@mui/material";
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Tooltip,
	Legend,
} from "recharts";
import { useUsers } from "../../contexts/UserProvider"; // Corrected import path
import PeopleIcon from "@mui/icons-material/People";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import PersonIcon from "@mui/icons-material/Person";

const COLORS = {
	Admins: "#f44336",
	Staff: "#ff9800",
	Users: "#2196f3",
};

const StatCard = ({ title, value, icon, color }) => (
	<Card
		elevation={4}
		sx={{ display: "flex", alignItems: "center", p: 2, borderRadius: 2 }}>
		<Box sx={{ flexShrink: 0, mr: 2 }}>
			<Box
				sx={{
					width: 56,
					height: 56,
					borderRadius: "50%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: color,
					color: "common.white",
				}}>
				{icon}
			</Box>
		</Box>
		<Box>
			<Typography
				variant='h6'
				color='text.secondary'>
				{title}
			</Typography>
			<Typography
				variant='h4'
				fontWeight='bold'>
				{value}
			</Typography>
		</Box>
	</Card>
);

const Dashboard = () => {
	const { users, loading, error } = useUsers();

	const stats = useMemo(() => {
		if (!users) return { totalUsers: 0, chartData: [], roleCounts: {} };

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
		].filter((entry) => entry.value > 0);

		return { totalUsers: users.length, chartData, roleCounts };
	}, [users]);

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
		<Box sx={{ flexGrow: 1, px: 3, py: 1 }}>
			<Typography
				variant='h4'
				gutterBottom
				fontWeight='bold'
				color='text.primary'>
				Dashboard
			</Typography>
			<Grid
				container
				spacing={3}
				mb={4}>
				<Grid
					item
					xs={12}
					sm={6}
					md={4}>
					<StatCard
						title='Total Users'
						value={stats.totalUsers}
						icon={<PeopleIcon sx={{ fontSize: 32 }} />}
						color='#673ab7'
					/>
				</Grid>
				<Grid
					item
					xs={12}
					sm={6}
					md={4}>
					<StatCard
						title='Administrators'
						value={stats.roleCounts.admin}
						icon={<SupervisorAccountIcon sx={{ fontSize: 32 }} />}
						color={COLORS.Admins}
					/>
				</Grid>
				<Grid
					item
					xs={12}
					sm={6}
					md={4}>
					<StatCard
						title='Regular Users'
						value={stats.roleCounts.user}
						icon={<PersonIcon sx={{ fontSize: 32 }} />}
						color={COLORS.Users}
					/>
				</Grid>
			</Grid>
			<Card
				elevation={4}
				sx={{ borderRadius: 2 }}>
				<CardContent>
					<Typography
						variant='h6'
						gutterBottom>
						User Role Distribution
					</Typography>
					<Box sx={{ height: 350 }}>
						<ResponsiveContainer
							width='100%'
							height='100%'>
							<PieChart>
								<Tooltip
									contentStyle={{
										backgroundColor: "rgba(255, 255, 255, 0.9)",
										border: "1px solid #e0e0e0",
										borderRadius: 8,
									}}
								/>
								<Legend />
								<Pie
									data={stats.chartData}
									cx='50%'
									cy='50%'
									labelLine={false}
									outerRadius={120}
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
				</CardContent>
			</Card>
		</Box>
	);
};

export default Dashboard;
