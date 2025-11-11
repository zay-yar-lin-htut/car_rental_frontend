import React, { useState, useMemo } from "react";
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

const initialDemoTasks = [
	{
		booking_id: 1,
		customer_name: "John Doe",
		car_model: "Toyota Camry",
		license_plate: "ABC-123",
		pickup_datetime: "2025-12-01T10:00:00Z",
		status: "Pending",
		type: "Delivery",
		lat: 51.505,
		lng: -0.09,
	},
	{
		booking_id: 2,
		customer_name: "Jane Smith",
		car_model: "Honda Civic",
		license_plate: "XYZ-789",
		pickup_datetime: "2025-12-01T11:00:00Z",
		status: "In Progress",
		type: "Pickup",
		lat: 51.51,
		lng: -0.1,
	},
	{
		booking_id: 3,
		customer_name: "Peter Jones",
		car_model: "Ford Focus",
		license_plate: "FGH-456",
		pickup_datetime: "2025-12-02T09:00:00Z",
		status: "Completed",
		type: "Delivery",
		lat: 51.5,
		lng: -0.12,
	},
	{
		booking_id: 4,
		customer_name: "Mary Johnson",
		car_model: "Chevrolet Malibu",
		license_plate: "JKL-101",
		pickup_datetime: "2025-12-03T14:00:00Z",
		status: "Cancelled",
		type: "Pickup",
		lat: 51.49,
		lng: -0.08,
	},
	// Add more demo tasks as needed
];

// Define a static starting point for the route
const companyLocation = {
	lat: 51.52,
	lng: -0.1,
};

const TaskManagement = () => {
	const [tasks, setTasks] = useState(initialDemoTasks);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("All");

	// State for View Details Dialog
	const [openViewDialog, setOpenViewDialog] = useState(false);
	const [selectedTask, setSelectedTask] = useState(null);

	// State for Update Status Dialog
	const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
	const [selectedTaskForUpdate, setSelectedTaskForUpdate] = useState(null);
	const [newStatus, setNewStatus] = useState("");

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

	const filteredTasks = useMemo(() => {
		return tasks.filter((task) => {
			if (statusFilter !== "All" && task.status !== statusFilter) {
				return false;
			}
			const lowerCaseSearchTerm = searchTerm.toLowerCase();
			return (
				task.customer_name.toLowerCase().includes(lowerCaseSearchTerm) ||
				task.car_model.toLowerCase().includes(lowerCaseSearchTerm) ||
				task.license_plate.toLowerCase().includes(lowerCaseSearchTerm)
			);
		});
	}, [tasks, searchTerm, statusFilter]);

	const columns = [
		{ id: "booking_id", label: "Booking ID" },
		{ id: "customer_name", label: "Customer" },
		{ id: "car_model", label: "Car" },
		{ id: "license_plate", label: "License Plate" },
		{
			id: "pickup_datetime",
			label: "Pickup Time",
			render: (task) => new Date(task.pickup_datetime).toLocaleString(),
		},
		{
			id: "status",
			label: "Status",
			render: (task) => (
				<Chip
					label={task.status}
					color={
						task.status === "Completed"
							? "success"
							: task.status === "Pending"
							? "warning"
							: "default"
					}
					size='small'
				/>
			),
		},
		{
			id: "actions",
			label: "Actions",
			align: "center",
			render: (task) => (
				<>
					<Tooltip title='View Details'>
						<IconButton onClick={() => handleOpenViewDialog(task)}>
							<VisibilityIcon />
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
					sx={{ minWidth: 150 }}>
					<InputLabel>Status</InputLabel>
					<Select
						value={statusFilter}
						onChange={handleStatusFilterChange}
						label='Status'>
						<MenuItem value='All'>All</MenuItem>
						<MenuItem value='Pending'>Pending</MenuItem>
						<MenuItem value='In Progress'>In Progress</MenuItem>
						<MenuItem value='Completed'>Completed</MenuItem>
						<MenuItem value='Cancelled'>Cancelled</MenuItem>
					</Select>
				</FormControl>
			</Box>

			<ReusableTable
				columns={columns}
				loading={false}
				error={null}
				data={filteredTasks}
				page={page}
				rowsPerPage={rowsPerPage}
				total={filteredTasks.length}
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
