import React, { useState, useMemo, useEffect } from "react";
import {
	Box,
	TextField,
	Button,
	Paper,
	Avatar,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Typography,
	IconButton,
	Tooltip,
	Alert,
} from "@mui/material";
import ReusableTable from "./ReusableTable";
import {
	Add as AddIcon,
	Block as BlockIcon,
	LockReset as LockResetIcon,
	CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { API_ENDPOINTS } from "../../../services/Configuration";
import { createDataServices } from "../../../services/DataServices";
import { useSnackbar } from "../../../contexts/ErrorMessage";

const UserManagement = () => {
	const dataServices = React.useMemo(() => createDataServices(), []);
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState("All");
	const [openAddDialog, setOpenAddDialog] = useState(false);
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { showSnackbar } = useSnackbar();
	const [newStaff, setNewStaff] = useState({
		name: "",
		email: "",
		phNo: "",
		role: "Staff",
	});
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	useEffect(() => {
		const fetchUsers = async () => {
			setLoading(true);
			try {
				const filterValue =
					roleFilter === "All" ? "active_user" : roleFilter.toLowerCase();

				const response = await dataServices.retrieve(
					API_ENDPOINTS.users.base,
					`${API_ENDPOINTS.users.getAll}?first=${page}&max=${rowsPerPage}&filter_by=${filterValue}`
				);
				// Assuming the API returns a `users` array and a `total` count for pagination
				setUsers(response.data.users || []);
				setError(null);
			} catch (err) {
				const errorMessage = err.message || "Failed to fetch users.";
				setError(errorMessage);
				showSnackbar(errorMessage, "error");
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, [roleFilter, page, rowsPerPage, dataServices]);

	const handleSearchChange = (event) => {
		setSearchTerm(event.target.value);
	};

	const handleRoleFilterChange = (event) => {
		setPage(1);
		setRoleFilter(event.target.value);
	};

	const handleOpenAddDialog = () => {
		setOpenAddDialog(true);
	};

	const handleCloseAddDialog = () => {
		setOpenAddDialog(false);
		setNewStaff({ name: "", email: "", phNo: "", role: "Staff" });
	};

	const handleNewStaffChange = (event) => {
		setNewStaff({ ...newStaff, [event.target.name]: event.target.value });
	};

	const handleAddStaff = () => {
		// Here you would typically make an API call to add the new staff member
		const newUser = {
			id: users.length + 1,
			...newStaff,
			avatar: `/path/to/avatar${users.length + 1}.jpg`,
			status: "Active",
		};
		setUsers([...users, newUser]);
		handleCloseAddDialog();
	};

	const handleToggleBan = (userId) => {
		setUsers(
			users.map((user) =>
				user.user_id === userId
					? {
							...user,
							status: user.status === "Active" ? "Banned" : "Active",
					  }
					: user
			)
		);
	};

	const handlePasswordReset = (userId) => {
		// Logic for password reset
		console.log(`Password reset for user ${userId}`);
		alert(`Password reset for user ${userId}`);
	};

	const filteredUsers = useMemo(() => {
		if (!searchTerm) {
			return users;
		}
		return users.filter(
			(user) =>
				user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				user.email.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [users, searchTerm]);

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(1);
	};

	const columns = [
		{
			id: "avatar",
			label: "Avatar",
			render: (user) => (
				<Avatar
					alt={user.name}
					src={user.profile_image_url}
				/>
			),
		},
		{ id: "name", label: "Name" },
		{ id: "email", label: "Email" },
		{ id: "phone", label: "Phone No" },
		{
			id: "role",
			label: "Role",
			render: (user) => (
				<Chip
					label={user.type_name}
					sx={{
						backgroundColor:
							user.type_name === "Admin"
								? "var(--error-color)"
								: user.type_name === "Staff"
								? "var(--primary-color)"
								: "var(--secondary-color)",
						color: "var(--primary-contrast-text)",
					}}
					size='small'
				/>
			),
		},
		{
			id: "status",
			label: "Status",
			render: (user) => (
				<Chip
					icon={
						user.is_banned === 0 ? <CheckCircleIcon /> : <BlockIcon />
					}
					label={user.is_banned === 0 ? "Active" : "Banned"}
					sx={{
						backgroundColor:
							user.is_banned === 0
								? "var(--success-color)"
								: "var(--error-color)",
						color: "var(--primary-contrast-text)",
					}}
					size='small'
				/>
			),
		},
		{
			id: "actions",
			label: "Actions",
			align: "right",
			render: (user) => (
				<>
					<Tooltip
						title={user.is_banned === 0 ? "Ban User" : "Unban User"}>
						<IconButton onClick={() => handleToggleBan(user.user_id)}>
							{user.is_banned === 0 ? (
								<BlockIcon />
							) : (
								<CheckCircleIcon />
							)}
						</IconButton>
					</Tooltip>
					<Tooltip title='Reset Password'>
						<IconButton
							onClick={() => handlePasswordReset(user.user_id)}>
							<LockResetIcon />
						</IconButton>
					</Tooltip>
				</>
			),
		},
	];

	if (error) {
		return <Alert severity='error'>{error}</Alert>;
	}

	return (
		<Paper sx={{ p: 2, bgcolor: "var(--background-paper)", color: "var(--text-color)" }}>
			<Typography
				variant='h4'
				marginBottom={2}
				gutterBottom>
				User Management
			</Typography>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
					flexWrap: "wrap",
					gap: 2,
				}}>
				<TextField
					label='Search by name'
					variant='outlined'
					value={searchTerm}
					onChange={handleSearchChange}
					sx={{ flexGrow: 1, minWidth: "200px" }}
				/>
				<FormControl
					variant='outlined'
					sx={{ minWidth: 120 }}>
					<InputLabel>Role</InputLabel>
					<Select
						value={roleFilter}
						onChange={handleRoleFilterChange}
						label='Role'>
						<MenuItem value='All'>All</MenuItem>
						<MenuItem value='Admin'>Admin</MenuItem>
						<MenuItem value='Staff'>Staff</MenuItem>
						<MenuItem value='User'>User</MenuItem>
					</Select>
				</FormControl>
				<Button
					variant='contained'
					startIcon={<AddIcon />}
					onClick={handleOpenAddDialog}>
					Add Staff
				</Button>
			</Box>

			<ReusableTable
				columns={columns}
				data={filteredUsers}
				loading={loading}
				error={error}
				page={page}
				rowsPerPage={rowsPerPage}
				total={filteredUsers.length}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				keyExtractor={(user) => user.user_id}
			/>

			<Dialog
				open={openAddDialog}
				onClose={handleCloseAddDialog}
				PaperProps={{
					sx: {
						bgcolor: "var(--background-paper)",
						color: "var(--text-color)"
					}
				}}>
				<DialogTitle>Add New Staff</DialogTitle>
				<DialogContent>
					<DialogContentText color="var(--text-secondary-color)">
						Please fill in the details for the new staff member.
					</DialogContentText>
					<TextField
						autoFocus
						margin='dense'
						name='name'
						label='Name'
						type='text'
						fullWidth
						variant='standard'
						value={newStaff.name}
						onChange={handleNewStaffChange}
					/>
					<TextField
						margin='dense'
						name='email'
						label='Email Address'
						type='email'
						fullWidth
						variant='standard'
						value={newStaff.email}
						onChange={handleNewStaffChange}
					/>
					<TextField
						margin='dense'
						name='phNo'
						label='Phone Number'
						type='tel'
						fullWidth
						variant='standard'
						value={newStaff.phNo}
						onChange={handleNewStaffChange}
					/>
					<FormControl
						fullWidth
						margin='dense'
						variant='standard'>
						<InputLabel>Role</InputLabel>
						<Select
							name='role'
							value={newStaff.role}
							onChange={handleNewStaffChange}
							label='Role'>
							<MenuItem value='Staff'>Staff</MenuItem>
							<MenuItem value='Admin'>Admin</MenuItem>
							<MenuItem value='User'>User</MenuItem>
						</Select>
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseAddDialog}>Cancel</Button>
					<Button onClick={handleAddStaff}>Add</Button>
				</DialogActions>
			</Dialog>
		</Paper>
	);
};

export default UserManagement;
