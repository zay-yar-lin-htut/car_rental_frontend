import React, { useState, useEffect } from "react";
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
	CircularProgress,
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
import useDebouncedSearch from "../../common/useDebouncedSearch";

interface UserRow {
	user_id: number;
	name: string;
	email: string;
	phone: string;
	type_name: string;
	is_banned: number;
	profile_image_url?: string;
	no_show_count?: number;
	cancellation_count?: number;
	[key: string]: unknown;
}

const UserManagement = () => {
	const dataServices = React.useMemo(() => createDataServices(), []);
	const [roleFilter, setRoleFilter] = useState("All");
	const [openAddDialog, setOpenAddDialog] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { showSnackbar } = useSnackbar();
	const [users, setUsers] = useState<UserRow[]>([]);
	const [newStaff, setNewStaff] = useState({
		name: "",
		email: "",
		phone: "",
		role: "Staff",
		password: "",
		password_confirmation: "",
	});
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [totalUsers, setTotalUsers] = useState(0);
	const { searchTerm, setSearchTerm, debouncedSearchTerm } = useDebouncedSearch(
		"",
		1500
	);
	const [loadingAction, setLoadingAction] = useState<{
		ban: number | null;
		reset: number | null;
		add: boolean;
	}>({
		ban: null,
		reset: null,
		add: false,
	});

	useEffect(() => {
		setPage(0);
	}, [debouncedSearchTerm]);

	const fetchUsers = async (searchQuery: string) => {
		setLoading(true);
		try {
			const filterValue =
				roleFilter === "All" ? "active_user" : roleFilter === "Banned" ? "banned_user" : roleFilter.toLowerCase();

			const response = await dataServices.retrieve(
				API_ENDPOINTS.users.base,
				`${API_ENDPOINTS.users.getAll}?search_by=${searchQuery}&first=${
					page + 1
				}&max=${rowsPerPage}&filter_by=${filterValue}`
			);
			const raw = response.data as any;
			setUsers((raw?.users || []) as UserRow[]);
			setTotalUsers(raw?.total_users || 0);
			setError(null);
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : "Failed to fetch users.";
			setError(errorMessage);
			showSnackbar(errorMessage, "error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers(debouncedSearchTerm);
	}, [roleFilter, page, rowsPerPage, debouncedSearchTerm, dataServices]);

	const handleSearchChange = (event: any) => {
		setSearchTerm(event.target.value);
	};

	const handleRoleFilterChange = (event: any) => {
		setPage(0);
		setRoleFilter(event.target.value);
	};

	const handleOpenAddDialog = () => {
		setOpenAddDialog(true);
	};

	const handleCloseAddDialog = () => {
		setOpenAddDialog(false);
		setNewStaff({
			name: "",
			email: "",
			phone: "",
			role: "Staff",
			password: "",
			password_confirmation: "",
		});
	};

	const handleNewStaffChange = (event: any) => {
		setNewStaff({ ...newStaff, [event.target.name]: event.target.value });
	};

	const handleAddStaff = async () => {
		setLoadingAction((prev) => ({ ...prev, add: true }));
		const roleIdMap: Record<string, number> = { Admin: 3, Staff: 2, User: 1 };
		const payload = {
			user_type_id: roleIdMap[newStaff.role],
			name: newStaff.name,
			phone: newStaff.phone,
			email: newStaff.email,
			password: newStaff.password,
			password_confirmation: newStaff.password_confirmation,
		};

		try {
			const response = await dataServices.retrievePOST(
				payload,
				API_ENDPOINTS.users.addStaff
			);
			showSnackbar(response.message || "Staff added successfully!", "success");
			handleCloseAddDialog();
			fetchUsers(debouncedSearchTerm); // Refresh the user list
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : "Failed to add staff.";
			showSnackbar(msg, "error");
		} finally {
			setLoadingAction((prev) => ({ ...prev, add: false }));
		}
	};

	const handleToggleBan = async (userId: number) => {
		setLoadingAction((prev) => ({ ...prev, ban: userId }));
		try {
			const response = await dataServices.retrieve(
				API_ENDPOINTS.users.base,
				`${API_ENDPOINTS.users.banUser}${userId}`
			);
			showSnackbar(response.message || "User status updated.", "success");
			// Refresh data by updating a user to trigger re-render
			setUsers((prev) =>
				prev.map((user) =>
					user.user_id === userId
						? { ...user, is_banned: user.is_banned === 0 ? 1 : 0 }
						: user
				)
			);
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : "Failed to update user status.";
			showSnackbar(msg, "error");
		} finally {
			setLoadingAction((prev) => ({ ...prev, ban: null }));
		}
	};

	const handlePasswordReset = async (userId: number) => {
		setLoadingAction((prev) => ({ ...prev, reset: userId }));
		try {
			const response = await dataServices.retrieve(
				API_ENDPOINTS.users.base,
				`${API_ENDPOINTS.users.resetPass}${userId}`
			);
			showSnackbar(
				response.message || "Password reset successfully.",
				"success"
			);
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : "Failed to reset password.";
			showSnackbar(msg, "error");
		} finally {
			setLoadingAction((prev) => ({ ...prev, reset: null }));
		}
	};

	const handleChangePage = (event: any, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: any) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const columns = [
		{
			id: "avatar",
			label: "Avatar",
			sx: {
				color: "var(--text-color)",
			},
			render: (user: UserRow) => (
				<Avatar
					alt={user.name}
					src={user.profile_image_url}
				/>
			),
		},
		{
			id: "name",
			label: "Name",
			sx: {
				color: "var(--text-color)",
			},
		},
		{
			id: "email",
			label: "Email",
			sx: {
				color: "var(--text-color)",
			},
		},
		{
			id: "phone",
			label: "Phone No",
			sx: {
				color: "var(--text-color)",
			},
		},
		{
			id: "no_show_count",
			label: "No Show Count",
			sx: {
				color: "var(--text-color)",
			},
		},
		{
			id: "cancellation_count",
			label: "Cancellation Count",
			sx: {
				color: "var(--text-color)",
			},
		},
		{
			id: "role",
			label: "Role",
			sx: {
				color: "var(--text-color)",
			},
			render: (user: UserRow) => (
				<Chip
					label={user.type_name}
					sx={{
						color: "var(--text-color)",
					}}
					size='small'
				/>
			),
		},
		{
			id: "status",
			label: "Status",
			sx: {
				color: "var(--text-color)",
			},
			render: (user: UserRow) => (
				<Chip
					icon={user.is_banned === 0 ? <CheckCircleIcon /> : <BlockIcon />}
					label={user.is_banned === 0 ? "Active" : "Banned"}
					sx={{
						backgroundColor:
							user.is_banned === 0
								? "var(--success-color)"
								: "var(--error-color)",
						color: "var(--text-color)",
					}}
					size='small'
				/>
			),
		},
		{
			id: "actions",
			label: "Actions",
			align: "right",
			sx: {
				color: "var(--text-color)",
			},
			render: (user: UserRow) => (
				<>
					<Tooltip title={user.is_banned === 0 ? "Ban User" : "Unban User"}>
						<span>
							<IconButton
								onClick={() => handleToggleBan(user.user_id)}
								disabled={loadingAction.ban === user.user_id}>
								{loadingAction.ban === user.user_id ? (
									<CircularProgress size={24} />
								) : user.is_banned === 0 ? (
									<BlockIcon
										style={{
											color: "var(--error-color)",
										}}
									/>
								) : (
									<CheckCircleIcon
										style={{
											color: "var(--success-color)",
										}}
									/>
								)}
							</IconButton>
						</span>
					</Tooltip>
					<Tooltip title='Reset Password'>
						<span>
							<IconButton
								onClick={() => handlePasswordReset(user.user_id)}
								disabled={loadingAction.reset === user.user_id}>
								{loadingAction.reset === user.user_id ? (
									<CircularProgress size={24} />
								) : (
									<LockResetIcon
										style={{
											color: "var(--primary-color)",
										}}
									/>
								)}
							</IconButton>
						</span>
					</Tooltip>
				</>
			),
		},
	];

	if (error) {
		return <Alert severity='error'>{error}</Alert>;
	}

	return (
		<Paper
			sx={{
				p: 2,
				bgcolor: "var(--background-paper)",
				color: "var(--text-color)",
			}}>
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
					InputLabelProps={{
						style: { color: "var(--text-color)" },
					}}
					sx={{
						flexGrow: 1,
						minWidth: "200px",
						"& .MuiInputBase-input": {
							color: "var(--text-color)", // Input text color
						},
						"& .MuiOutlinedInput-root": {
							"& fieldset": {
								borderColor: "var(--text-secondary-color)", // Default border color
							},
							"&:hover fieldset": {
								borderColor: "var(--primary-color)", // Border color on hover
							},
							"&.Mui-focused fieldset": {
								borderColor: "var(--primary-color)", // Border color when focused
							},
						},
					}}
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
						<MenuItem value='Banned'>Banned</MenuItem>
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
				data={users}
				loading={loading}
				error={error}
				page={page}
				rowsPerPage={rowsPerPage}
				total={totalUsers}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				keyExtractor={(user: UserRow) => user.user_id}
			/>

			<Dialog
				open={openAddDialog}
				onClose={handleCloseAddDialog}
				PaperProps={{
					sx: {
						bgcolor: "var(--background-paper)",
						color: "var(--text-color)",
					},
				}}>
				<DialogTitle>Add New Staff</DialogTitle>
				<DialogContent>
					<DialogContentText color='var(--text-secondary-color)'>
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
						name='phone'
						label='Phone Number'
						type='tel'
						fullWidth
						variant='standard'
						value={newStaff.phone}
						onChange={handleNewStaffChange}
					/>
					<TextField
						margin='dense'
						name='password'
						label='Password'
						type='password'
						fullWidth
						variant='standard'
						value={newStaff.password}
						onChange={handleNewStaffChange}
					/>
					<TextField
						margin='dense'
						name='password_confirmation'
						label='Confirm Password'
						type='password'
						fullWidth
						variant='standard'
						value={newStaff.password_confirmation}
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
					<Button
						onClick={handleAddStaff}
						disabled={loadingAction.add}>
						{loadingAction.add ? <CircularProgress size={24} /> : "Add"}
					</Button>
				</DialogActions>
			</Dialog>
		</Paper>
	);
};

export default UserManagement;
