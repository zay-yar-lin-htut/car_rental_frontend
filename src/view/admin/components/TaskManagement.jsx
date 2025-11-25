import React, { useState, useMemo, useEffect } from "react";
import TaskMap from "./TaskMap";
import ReusableTable from "./ReusableTable";
import {
	Box,
	TextField,
	Button,
	Chip,
	Tooltip,
	IconButton,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Paper,
	Typography,
} from "@mui/material";
import {
	Edit as EditIcon,
	Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { createDataServices } from "../../../services/DataServices";
import { API_ENDPOINTS } from "../../../services/Configuration";

// Define a static starting point for the route
const companyLocation = {
	lat: 51.52,
	lng: -0.1,
};

const TaskManagement = () => {
	const dataService = createDataServices();
	const [tasks, setTasks] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("delivery");
	const [officeFilter, setOfficeFilter] = useState(1);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// State for View Details Dialog
	const [openViewDialog, setOpenViewDialog] = useState(false);
	const [selectedTask, setSelectedTask] = useState(null);

	// State for Update Status Dialog
	const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
	const [selectedTaskForUpdate, setSelectedTaskForUpdate] = useState(null);
	const [newStatus, setNewStatus] = useState("");

	const getTasks = async () => {
		setLoading(true);
		setError(null);
		try {
			let response;
			if (statusFilter === "take_back") {
				response = await dataService.retrieve(
					API_ENDPOINTS.bookings.base,
					`${API_ENDPOINTS.staff.tdyTakeBack}?office_id=${officeFilter}`
				);
			} else if (statusFilter === "delivery") {
				response = await dataService.retrieve(
					API_ENDPOINTS.bookings.base,
					`${API_ENDPOINTS.staff.tdyDeli}?office_id=${officeFilter}`
				);
			}
			setTasks(response.data || []);
			setError(null);
		} catch (err) {
			setError("Failed to fetch tasks. Please try again later.");
			setTasks([]); // Clear tasks on error
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getTasks();
	}, [statusFilter, officeFilter]);

	const handleOpenViewDialog = (task) => {
		setSelectedTask(task);
		setOpenViewDialog(true);
	};

	const handleCloseViewDialog = () => {
		setOpenViewDialog(false);
		setSelectedTask(null);
	};

	const handleOpenUpdateDialog = (task) => {
		setSelectedTaskForUpdate(task);
		setNewStatus(task.status);
		setOpenUpdateDialog(true);
	};

	const handleCloseUpdateDialog = () => {
		setOpenUpdateDialog(false);
		setSelectedTaskForUpdate(null);
		setNewStatus("");
	};

	const handleUpdateStatus = () => {
		setTasks(
			tasks.map((task) =>
				task.booking_id === selectedTaskForUpdate.booking_id
					? { ...task, status: newStatus }
					: task
			)
		);
		handleCloseUpdateDialog();
	};

	const handleStatusFilterChange = (event) => {
		setPage(0);
		setStatusFilter(event.target.value);
	};
	const handleOfficeFilterChange = (event) => {
		setPage(0);
		setOfficeFilter(event.target.value);
	};

	const handleSearchChange = (event) => {
		setSearchTerm(event.target.value);
	};

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const columns = [
		{
			id: "booking_id",
			label: "Booking ID",
			sx: {
				color: "var(--text-color)",
			},
		},
		{
			id: "customer_name",
			label: "Customer",
			sx: {
				color: "var(--text-color)",
			},
		},
		{
			id: "car_model",
			label: "Car",
			sx: {
				color: "var(--text-color)",
			},
		},
		{
			id: "license_plate",
			label: "License Plate",
			sx: {
				color: "var(--text-color)",
			},
		},
		{
			id: "pickup_datetime",
			label: "Pickup Time",
			sx: {
				color: "var(--text-color)",
			},
			render: (task) => new Date(task.pickup_datetime).toLocaleString(),
		},
		{
			id: "status",
			label: "Status",
			sx: {
				color: "var(--text-color)",
			},
			render: (task) => (
				<Chip
					label={task.status}
					color={
						task.status === "Completed"
							? "success" // Green background
							: task.status === "In Progress"
							? "info" // Blue background
							: task.status === "Pending"
							? "warning" // Orange background
							: task.status === "Cancelled"
							? "error" // Red background
							: "default" // Grey background
					}
					size='small'
					// Make text color white for better contrast on colored chips
				/>
			),
		},
		{
			id: "actions",
			label: "Actions",
			align: "center",
			sx: {
				color: "var(--text-color)",
			},
			render: (task) => (
				<>
					<Tooltip title='View Details'>
						<IconButton onClick={() => handleOpenViewDialog(task)}>
							<VisibilityIcon sx={{ color: "var(--text-color)" }} />
						</IconButton>
					</Tooltip>
					<Tooltip title='Update Status'>
						<IconButton onClick={() => handleOpenUpdateDialog(task)}>
							<EditIcon color='primary' />
						</IconButton>
					</Tooltip>
				</>
			),
		},
	];

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
				Task Management
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
					label='Search by customer, car, license...'
					variant='outlined'
					value={searchTerm}
					onChange={handleSearchChange}
					sx={{ flexGrow: 1, minWidth: "250px" }}
				/>
				<FormControl
					variant='outlined'
					sx={{ minWidth: 250 }}>
					<InputLabel>Office Location</InputLabel>
					<Select
						value={officeFilter}
						onChange={handleOfficeFilterChange}
						label='Status'>
						<MenuItem value={1}>Mandalay</MenuItem>
						<MenuItem value={2}>Yangon</MenuItem>
					</Select>
				</FormControl>
				<FormControl
					variant='outlined'
					sx={{ minWidth: 150 }}>
					<InputLabel>Status</InputLabel>
					<Select
						value={statusFilter}
						onChange={handleStatusFilterChange}
						label='Status'>
						<MenuItem value='take_back'>Take Back</MenuItem>
						<MenuItem value='delivery'>Delivery</MenuItem>
					</Select>
				</FormControl>
			</Box>

			<ReusableTable
				columns={columns}
				loading={loading}
				error={error}
				data={tasks}
				page={page}
				rowsPerPage={rowsPerPage}
				total={tasks.length}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				keyExtractor={(task) => task.booking_id}
			/>

			{/* View Details Dialog */}
			<Dialog
				open={openViewDialog}
				onClose={handleCloseViewDialog}
				maxWidth='md'
				fullWidth>
				<DialogTitle>Task Details</DialogTitle>
				<DialogContent>
					{selectedTask && (
						<Box sx={{ mt: 2 }}>
							<Typography variant='h6'>
								{selectedTask.type}: {selectedTask.car_model}
							</Typography>
							<Typography>
								<strong>Customer:</strong> {selectedTask.customer_name}
							</Typography>
							<Typography>
								<strong>License Plate:</strong> {selectedTask.license_plate}
							</Typography>
							<Typography>
								<strong>Time:</strong>{" "}
								{new Date(selectedTask.pickup_datetime).toLocaleString()}
							</Typography>
							<Typography>
								<strong>Status:</strong> {selectedTask.status}
							</Typography>

							<Box
								sx={{
									height: 300,
									mt: 2,
									borderRadius: 1,
									overflow: "hidden",
								}}>
								<TaskMap
									start={companyLocation}
									end={{ lat: selectedTask.lat, lng: selectedTask.lng }}
									type={selectedTask.type}
								/>
							</Box>
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseViewDialog}>Close</Button>
				</DialogActions>
			</Dialog>

			{/* Update Status Dialog */}
			<Dialog
				open={openUpdateDialog}
				onClose={handleCloseUpdateDialog}
				maxWidth='xs'
				fullWidth>
				<DialogTitle>Update Task Status</DialogTitle>
				<DialogContent>
					<FormControl
						fullWidth
						sx={{ mt: 2 }}>
						<InputLabel>Status</InputLabel>
						<Select
							value={newStatus}
							onChange={(e) => setNewStatus(e.target.value)}
							label='Status'>
							<MenuItem value='Pending'>Pending</MenuItem>
							<MenuItem value='In Progress'>In Progress</MenuItem>
							<MenuItem value='Completed'>Completed</MenuItem>
							<MenuItem value='Cancelled'>Cancelled</MenuItem>
						</Select>
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseUpdateDialog}>Cancel</Button>
					<Button
						onClick={handleUpdateStatus}
						variant='contained'>
						Update
					</Button>
				</DialogActions>
			</Dialog>
		</Paper>
	);
};

export default TaskManagement;
