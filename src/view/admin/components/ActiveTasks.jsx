import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
	Box,
	Typography,
	Chip,
	IconButton,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
} from "@mui/material";
import {
	MyLocation as MyLocationIcon,
	CheckCircle as CheckCircleIcon,
	PersonOff as NoShowIcon,
} from "@mui/icons-material";
import ReusableTable from "./ReusableTable";
import TaskMap from "./TaskMap";
import SignatureCanvas from "react-signature-canvas";
import { createDataServices } from "../../../services/DataServices";
import { API_ENDPOINTS } from "../../../services/Configuration";
import { useSnackbar } from "../../../contexts/ErrorMessage";

const ActiveTasks = () => {
	const { showSnackbar } = useSnackbar();
	const dataService = useMemo(() => createDataServices(), []);
	const [tasks, setTasks] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// State for Map Dialog
	const [openMapDialog, setOpenMapDialog] = useState(false);
	const [selectedTaskForMap, setSelectedTaskForMap] = useState(null);
	const [currentLocation, setCurrentLocation] = useState(null);

	// State for Cost Dialog
	const [openCostDialog, setOpenCostDialog] = useState(false);
	const [selectedTaskForComplete, setSelectedTaskForComplete] = useState(null);
	const [costData, setCostData] = useState(null);
	const sigCanvasRef = useRef(null);
	const [isNoShow, setIsNoShow] = useState(false);

	const columns = [
		{
			id: "task_id",
			label: "Task ID",
			sx: {
				color: "var(--text-color)",
			},
		},
		{
			id: "task_type",
			label: "Task Type",
			sx: {
				color: "var(--text-color)",
			},
		},
		{
			id: "status",
			label: "Status",
			sx: {
				color: "var(--text-color)",
			},
			render: (task) => {
				let color = "default";
				switch (task.status) {
					case "pending":
						color = "warning";
						break;
					case "in_progress":
						color = "info";
						break;
					case "complete":
						color = "success";
						break;
					case "cancelled":
						color = "error";
						break;
					default:
						color = "default";
				}
				return (
					<Chip
						label={task.status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
						color={color}
						size="small"
						variant="outlined"
					/>
				);
			},
		},
		{
			id: "ticket_number",
			label: "Ticket Number",
			sx: {
				color: "var(--text-color)",
			},
		},
		{
			id: "phone",
			label: "Customer Phone",
			sx: {
				color: "var(--text-color)",
			},
		},
		{
			id: "model",
			label: "Car Model",
			sx: {
				color: "var(--text-color)",
			},
			render: (task) => `${task.model} (${task.license_plate})`,
		},
		{
			id: "datetime",
			label: "Date/Time",
			sx: {
				color: "var(--text-color)",
			},
			render: (task) => {
				const datetime = task.task_type === "take_back" ? task.dropoff_datetime : task.pickup_datetime;
				return new Date(datetime).toLocaleString();
			},
		},
		{
			id: "actions",
			label: "Actions",
			align: "center",
			sx: {
				color: "var(--text-color)",
			},
			render: (task) => (
				<Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
					{task.status === "in_progress" && (
						<Tooltip title="View Route">
							<IconButton onClick={() => handleOpenMap(task)}>
								<MyLocationIcon sx={{ color: "var(--text-color)" }} />
							</IconButton>
						</Tooltip>
					)}
					{(task.status === "pending" || task.status === "in_progress") && (
						<Tooltip title="Complete Task">
							<IconButton onClick={() => handleComplete(task)}>
								<CheckCircleIcon sx={{ color: "success.main" }} />
							</IconButton>
						</Tooltip>
					)}
					<Tooltip title="No Show">
						<IconButton onClick={() => handleNoShow(task)}>
							<NoShowIcon sx={{ color: "error.main" }} />
						</IconButton>
					</Tooltip>
				</Box>
			),
		},
	];

	const fetchTasks = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await dataService.retrieve(
				API_ENDPOINTS.staff.baseStaff,
				API_ENDPOINTS.staff.activeTasks
			);
			setTasks(response.data || []);
			setError(null);
		} catch {
			setError("Failed to fetch active tasks. Please try again later.");
			setTasks([]);
		} finally {
			setLoading(false);
		}
	}, [dataService]);

	useEffect(() => {
		fetchTasks();
	}, [fetchTasks]);

	const filteredTasks = tasks;

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleOpenMap = (task) => {
		setSelectedTaskForMap(task);
		// Get current location
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setCurrentLocation({
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					});
					setOpenMapDialog(true);
				},
				(error) => {
					console.error("Error getting location:", error);
					showSnackbar("Unable to get current location. Please enable location services.", "error");
				}
			);
		} else {
			showSnackbar("Geolocation is not supported by this browser.", "error");
		}
	};

	const handleCloseMap = () => {
		setOpenMapDialog(false);
		setSelectedTaskForMap(null);
		setCurrentLocation(null);
	};

	const handleComplete = async (task) => {
		if (task.task_type === "delivery") {
			// For delivery, get cost first
			try {
				const costResponse = await dataService.retrieve(
					API_ENDPOINTS.staff.baseStaff,
					API_ENDPOINTS.staff.costByTicket(task.ticket_number)
				);
				setCostData(costResponse.data);
				setSelectedTaskForComplete(task);
				setOpenCostDialog(true);
			} catch (error) {
				console.error("Failed to get cost:", error);
				showSnackbar("Failed to get cost information. Please try again.", "error");
			}
		} else {
			// For take_back, complete directly
			try {
				await dataService.retrieve(API_ENDPOINTS.staff.baseStaff, API_ENDPOINTS.staff.completeTakeBack(task.task_id));
				// Remove the task from the list after completing
				setTasks(tasks.filter(t => t.task_id !== task.task_id));
		} catch (error) {
			console.error("Failed to complete task:", error);
			showSnackbar("Failed to complete the task. Please try again.", "error");
		}
		}
	};

	const handleConfirmComplete = async () => {
		if (!selectedTaskForComplete || !costData || sigCanvasRef.current?.isEmpty()) {
			showSnackbar("Please provide your signature.", "warning");
			return;
		}

		try {
			const totalAmount = costData.booking_cost + (costData.no_show_fine || 0) + (costData.cancellation_fine || 0);
			await dataService.retrievePOST(
				{
					amount_paid: totalAmount,
					fine_amount: (costData.no_show_fine || 0) + (costData.cancellation_fine || 0),
				},
				API_ENDPOINTS.staff.baseStaff + API_ENDPOINTS.staff.completeDelivery(selectedTaskForComplete.task_id)
			);
			// Remove the task from the list after completing
			setTasks(tasks.filter(t => t.task_id !== selectedTaskForComplete.task_id));
			setOpenCostDialog(false);
			setSelectedTaskForComplete(null);
			setCostData(null);
			sigCanvasRef.current?.clear();
		} catch (error) {
			console.error("Failed to complete delivery:", error);
			showSnackbar("Failed to complete the delivery. Please try again.", "error");
		}
	};

	const handleNoShow = async (task) => {
		try {
			await dataService.retrievePOST(
				{ booking_id: task.booking_id },
				API_ENDPOINTS.staff.baseStaff + API_ENDPOINTS.staff.noshowPickup
			);
			showSnackbar("Task marked as No Show.", "info");
			setTasks(tasks.filter(t => t.task_id !== task.task_id));
		} catch (error) {
			console.error("Failed to mark as no-show:", error);
			showSnackbar("Failed to mark as no-show. Please try again.", "error");
		}
	};

	const handleCloseCostDialog = () => {
		setOpenCostDialog(false);
		setSelectedTaskForComplete(null);
		setCostData(null);
		setIsNoShow(false);
		sigCanvasRef.current?.clear();
	};

	return (
		<Box>
		<Typography variant="h4" gutterBottom sx={{ color: "var(--text-color)" }}>
			Active Tasks
		</Typography>
			<ReusableTable
				columns={columns}
				loading={loading}
				error={error}
				data={filteredTasks}
				page={page}
				rowsPerPage={rowsPerPage}
				total={filteredTasks.length}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				keyExtractor={(task) => task.task_id}
			/>

			{/* Map Dialog */}
			<Dialog
				open={openMapDialog}
				onClose={handleCloseMap}
				maxWidth="md"
				fullWidth>
				<DialogTitle>
					Route to {selectedTaskForMap?.task_type === "delivery" ? "Pickup" : "Dropoff"} Location
				</DialogTitle>
				<DialogContent sx={{ height: "500px" }}>
					{selectedTaskForMap && currentLocation && (
						<TaskMap
							start={currentLocation}
							end={{
								lat: selectedTaskForMap.task_type === "delivery" ? parseFloat(selectedTaskForMap.pickup_latitude) : parseFloat(selectedTaskForMap.dropoff_latitude),
								lng: selectedTaskForMap.task_type === "delivery" ? parseFloat(selectedTaskForMap.pickup_longitude) : parseFloat(selectedTaskForMap.dropoff_longitude),
							}}
							type={selectedTaskForMap.task_type === "delivery" ? "Pickup" : "Dropoff"}
						/>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseMap}>Close</Button>
				</DialogActions>
			</Dialog>

			{/* Cost Confirmation Dialog */}
			<Dialog
				open={openCostDialog}
				onClose={handleCloseCostDialog}
				maxWidth="sm"
				fullWidth>
				<DialogTitle>Confirm Payment Collection</DialogTitle>
				<DialogContent>
					{selectedTaskForComplete && costData && (
						<Box sx={{ mt: 2 }}>
							<Typography variant="h6">
								Ticket: {selectedTaskForComplete.ticket_number}
							</Typography>
							<Typography>
								<strong>Booking Cost:</strong> {costData.booking_cost} MMK
							</Typography>
							{costData.no_show_fine > 0 && (
								<Typography>
									<strong>No Show Fine:</strong> {costData.no_show_fine} MMK
								</Typography>
							)}
							{costData.cancellation_fine > 0 && (
								<Typography>
									<strong>Cancellation Fine:</strong> {costData.cancellation_fine} MMK
								</Typography>
							)}
							<Typography variant="h6" sx={{ mt: 2 }}>
								Total Amount: {costData.booking_cost + (costData.no_show_fine || 0) + (costData.cancellation_fine || 0)} MMK
							</Typography>
							<Typography sx={{ mt: 2 }}>
								Has the payment been collected?
							</Typography>
							<Typography variant="subtitle1" sx={{ mt: 2 }}>
								Staff Signature:
							</Typography>
							<Box sx={{ border: '1px solid #ccc', mt: 1, borderRadius: 1 }}>
								<SignatureCanvas
									ref={sigCanvasRef}
									canvasProps={{
										width: 400,
										height: 200,
										className: 'sigCanvas'
									}}
									backgroundColor="white"
								/>
							</Box>
							<Button
								onClick={() => sigCanvasRef.current?.clear()}
								sx={{ mt: 1 }}
								size="small"
							>
								Clear Signature
							</Button>
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseCostDialog}>Cancel</Button>
					<Button onClick={handleConfirmComplete} variant="contained" color="primary">
						Confirm Payment Collected
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default ActiveTasks;