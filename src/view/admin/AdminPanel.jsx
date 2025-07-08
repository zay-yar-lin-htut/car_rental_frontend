import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
	CircularProgress,
	Box,
	IconButton,
	Tooltip,
	Chip,
	Alert,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Button,
	TextField,
	Select,
	MenuItem,
	InputLabel,
	FormControl,
	TablePagination,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { createDataServices } from "../../services/DataServices";
import { API_ENDPOINTS, AUTH_CONFIG } from "../../services/Configuration";
import { useSnackbar } from "../../contexts/ErrorMessage";

const dataServices = createDataServices();

// Helper to map role ID to a display name and color
const getRoleProps = (roleId) => {
	switch (roleId) {
		case 3:
			return { label: "Admin", color: "error" };
		case 2:
			return { label: "Staff", color: "warning" };
		case 1:
			return { label: "User", color: "primary" };
		default:
			return { label: "Unknown", color: "default" };
	}
};

const AdminPanel = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [userToEdit, setUserToEdit] = useState(null);
	const [editFormData, setEditFormData] = useState({
		name: "",
		email: "",
		user_type_id: 1,
	});
	const [isSaving, setIsSaving] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const { showSnackbar } = useSnackbar();
	const currentUser = useMemo(() => AUTH_CONFIG.getUserData(), []);

	const fetchUsers = useCallback(async () => {
		try {
			setLoading(true);
			// NOTE: Ensure API_ENDPOINTS.users.getAll is defined in your Configuration.js
			// It should point to the API endpoint for fetching all users, e.g., '/users'
			// const response = await dataServices.retrieve(API_ENDPOINTS.users.getAll);
			// setUsers(response.data);
			// setError(null);
		} catch (err) {
			const errorMessage = err.message || "Failed to fetch users.";
			setError(errorMessage);
			showSnackbar(errorMessage, "error");
		} finally {
			setLoading(false);
		}
	}, [showSnackbar]); // useCallback dependencies are correct

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const handleOpenConfirm = (userId) => {
		setUserToDelete(userId);
		setIsConfirmOpen(true);
	};

	const handleCloseConfirm = () => {
		if (isDeleting) return;
		setIsConfirmOpen(false);
		setUserToDelete(null);
	};

	const handleDeleteUser = async () => {
		if (!userToDelete) return;
		setIsDeleting(true);
		try {
			// NOTE: Ensure API_ENDPOINTS.users.delete(id) is defined in your Configuration.js
			// It should point to the API endpoint for deleting a user, e.g., `/users/${id}`
			await dataServices.delete(API_ENDPOINTS.users.delete(userToDelete));
			setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userToDelete));
			showSnackbar("User deleted successfully.", "success");
		} catch (err) {
			showSnackbar(err.message || "Failed to delete user.", "error");
		} finally {
			setIsDeleting(false);
			handleCloseConfirm();
		}
	};

	const handleOpenEdit = (user) => {
		setUserToEdit(user);
		setEditFormData({
			id: user.id,
			name: user.name,
			email: user.email,
			user_type_id: user.user_type_id,
		});
		setIsEditOpen(true);
	};

	const handleCloseEdit = () => {
		if (isSaving) return;
		setIsEditOpen(false);
		setUserToEdit(null);
	};

	const handleEditInputChange = (e) => {
		const { name, value } = e.target;
		setEditFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleEditSubmit = async () => {
		if (!userToEdit) return;
		setIsSaving(true);
		try {
			// NOTE: Ensure API_ENDPOINTS.users.update(id) is defined in your Configuration.js
			// It should point to the API endpoint for updating a user, e.g., `/users/${id}`
			const response = await dataServices.retrievePUT(
				editFormData,
				API_ENDPOINTS.users.update(userToEdit.id)
			);
			// The API should return the updated user object
			setUsers((prevUsers) =>
				prevUsers.map((u) => (u.id === userToEdit.id ? response.data : u))
			);
			showSnackbar("User updated successfully.", "success");
			handleCloseEdit();
		} catch (err) {
			showSnackbar(err.message || "Failed to update user.", "error");
		} finally {
			setIsSaving(false);
		}
	};

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const filteredUsers = useMemo(() => {
		if (!searchTerm) {
			return users;
		}
		const lowercasedFilter = searchTerm.toLowerCase();
		return users.filter(
			(user) =>
				user.name.toLowerCase().includes(lowercasedFilter) ||
				user.email.toLowerCase().includes(lowercasedFilter)
		);
	}, [users, searchTerm]);

	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "60vh",
				}}>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Alert
				severity='error'
				sx={{ mt: 2 }}>
				{error}
			</Alert>
		);
	}

	return (
		<Paper
			elevation={3}
			sx={{
				p: { xs: 2, md: 4 },
				overflow: "hidden",
				color: "white",
				bgcolor: "",
			}}>
			<Typography
				variant='h4'
				gutterBottom>
				User Management
			</Typography>
			<TextField
				label='Search by name or email'
				variant='outlined'
				fullWidth
				margin='normal'
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				sx={{ mb: 2 }}
			/>
			<TableContainer>
				<Table
					stickyHeader
					aria-label='user management table'>
					<TableHead>
						<TableRow>
							<TableCell>ID</TableCell>
							<TableCell>Name</TableCell>
							<TableCell>Email</TableCell>
							<TableCell>Role</TableCell>
							<TableCell align='right'>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{filteredUsers.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									align='center'>
									No users match your search.
								</TableCell>
							</TableRow>
						) : (
							filteredUsers
								.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
								.map((user) => {
									const role = getRoleProps(user.user_type_id);
									const isCurrentUser =
										currentUser && currentUser.id === user.id;
									return (
										<TableRow
											hover
											key={user.id}>
											<TableCell>{user.id}</TableCell>
											<TableCell>{user.name}</TableCell>
											<TableCell>{user.email}</TableCell>
											<TableCell>
												<Chip
													label={role.label}
													color={role.color}
													size='small'
												/>
											</TableCell>
											<TableCell align='right'>
												<Tooltip title='Edit User'>
													<span>
														<IconButton
															onClick={() => handleOpenEdit(user)}
															disabled={isDeleting || isSaving}>
															<EditIcon />
														</IconButton>
													</span>
												</Tooltip>
												<Tooltip title='Delete User'>
													<span>
														<IconButton
															onClick={() => handleOpenConfirm(user.id)}
															color='error'
															disabled={
																isDeleting || isSaving || isCurrentUser
															}>
															<DeleteIcon />
														</IconButton>
													</span>
												</Tooltip>
											</TableCell>
										</TableRow>
									);
								})
						)}
					</TableBody>
				</Table>
			</TableContainer>
			<TablePagination
				rowsPerPageOptions={[5, 10, 25]}
				component='div'
				count={filteredUsers.length}
				rowsPerPage={rowsPerPage}
				page={page}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>

			{/* Edit User Dialog */}
			<Dialog
				open={isEditOpen}
				onClose={handleCloseEdit}
				maxWidth='sm'
				fullWidth>
				<DialogTitle>Edit User</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ mb: 2 }}>
						Make changes to the user's details below.
					</DialogContentText>
					<TextField
						autoFocus
						margin='dense'
						name='name'
						label='Name'
						type='text'
						fullWidth
						variant='outlined'
						value={editFormData.name}
						onChange={handleEditInputChange}
						disabled={isSaving}
					/>
					<TextField
						margin='dense'
						name='email'
						label='Email Address'
						type='email'
						fullWidth
						variant='outlined'
						value={editFormData.email}
						onChange={handleEditInputChange}
						disabled={isSaving}
					/>
					<FormControl
						fullWidth
						margin='dense'
						variant='outlined'
						disabled={isSaving}>
						<InputLabel>Role</InputLabel>
						<Select
							name='user_type_id'
							value={editFormData.user_type_id}
							label='Role'
							onChange={handleEditInputChange}>
							<MenuItem value={1}>User</MenuItem>
							<MenuItem value={2}>Staff</MenuItem>
							<MenuItem value={3}>Admin</MenuItem>
						</Select>
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleCloseEdit}
						disabled={isSaving}>
						Cancel
					</Button>
					<Button
						onClick={handleEditSubmit}
						variant='contained'
						disabled={isSaving}>
						{isSaving ? <CircularProgress size={24} /> : "Save"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Confirmation Dialog */}
			<Dialog
				open={isConfirmOpen}
				onClose={handleCloseConfirm}
				aria-labelledby='alert-dialog-title'
				aria-describedby='alert-dialog-description'>
				<DialogTitle id='alert-dialog-title'>Confirm Deletion</DialogTitle>
				<DialogContent>
					<DialogContentText id='alert-dialog-description'>
						Are you sure you want to delete this user? This action cannot be
						undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleCloseConfirm}
						disabled={isDeleting}>
						Cancel
					</Button>
					<Button
						onClick={handleDeleteUser}
						color='error'
						variant='contained'
						disabled={isDeleting}>
						{isDeleting ? <CircularProgress size={24} /> : "Delete"}
					</Button>
				</DialogActions>
			</Dialog>
		</Paper>
	);
};

export default AdminPanel;
