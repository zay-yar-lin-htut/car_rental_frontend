import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import ReusableTable from "./ReusableTable";
import ConfirmDialog from "../../../common/ConfirmDialog";
import SignatureCanvas from "react-signature-canvas";
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
	CheckCircle as CompleteIcon,
	PersonOff as NoShowIcon,
} from "@mui/icons-material";
import { createDataServices } from "../../../services/DataServices";
import { API_ENDPOINTS } from "../../../services/Configuration";
import { useUserRole } from "../../../contexts/userRoleContext";
import { useSnackbar } from "../../../contexts/ErrorMessage";

interface PickupDropoffTask {
	booking_id: number;
	id?: number;
	ticket_number: string;
	model: string;
	license_plate: string;
	return_datetime: string;
	pickup_datetime: string;
	minutes_until: number;
	is_overdue: boolean;
	type: string;
	booking_cost?: number;
	no_show_fine?: number;
	cancellation_fine?: number;
	[key: string]: unknown;
}

interface CostData {
	booking_cost: number;
	no_show_fine?: number;
	cancellation_fine?: number;
	[key: string]: unknown;
}

const PickupDropoffManagement = () => {
	const { role } = useUserRole();
	const { showSnackbar } = useSnackbar();
	const dataService = useMemo(() => createDataServices(),[]);
	const [tasks, setTasks] = useState<PickupDropoffTask[]>([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [searchTerm, setSearchTerm] = useState("");
	const [filter, setFilter] = useState("pickup");

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [openConfirm, setOpenConfirm] = useState(false);
	const [isNoShow, setIsNoShow] = useState(false);

	// State for Cost Dialog
	const [openCostDialog, setOpenCostDialog] = useState(false);
	const [selectedTaskForComplete, setSelectedTaskForComplete] = useState<PickupDropoffTask | null>(null);
	const [costData, setCostData] = useState<CostData | null>(null);
	const sigCanvasRef = useRef<SignatureCanvas | null>(null);

	const isFetching = useRef(false);

	useEffect(() => {
		const fetchTasks = async () => {
			if (isFetching.current) return;
			isFetching.current = true;
			setLoading(true);
			setError(null);
			try {
				let response;
				if (filter === "pickup") {
					response = await dataService.retrieve(
						API_ENDPOINTS.staff.baseStaff,
						API_ENDPOINTS.staff.todayPickups
					);
				} else if (filter === "dropoff") {
					response = await dataService.retrieve(
						API_ENDPOINTS.staff.baseStaff,
						API_ENDPOINTS.staff.todayDropoffs
					);
				}
				setTasks(((response?.data || []) as any[]).map((task: any) => ({ ...task, booking_id: task.booking_id || task.id, type: filter === "pickup" ? "Pickup" : "Dropoff" })));
				setError(null);
			} catch {
				setError("Failed to fetch tasks. Please try again later.");
				setTasks([]); // Clear tasks on error
			} finally {
				setLoading(false);
				isFetching.current = false;
			}
		};
		fetchTasks();
	}, [filter, dataService]);

	const handleComplete = async (task: PickupDropoffTask) => {
		if (task.type === "Pickup") {
			// For pickup, get cost first
			try {
				const costResponse = await dataService.retrieve(
					API_ENDPOINTS.staff.baseStaff,
					API_ENDPOINTS.staff.costByTicket(task.ticket_number)
				);
				setCostData(costResponse.data as CostData);
				setSelectedTaskForComplete(task);
				setOpenCostDialog(true);
			} catch (error) {
				console.error("Failed to get cost:", error);
				showSnackbar("Failed to get cost information. Please try again.", "error");
			}
		} else {
			// For dropoff, show confirm dialog
			setSelectedTaskForComplete(task);
			setOpenConfirm(true);
		}
	};

	const handleNoShow = (task: PickupDropoffTask) => {
		setIsNoShow(true);
		setSelectedTaskForComplete(task);
		setOpenConfirm(true);
	};

	const handleConfirmComplete = async () => {
		if (!selectedTaskForComplete) return;

		try {
			if (isNoShow) {
				// For no-show, call API
				await dataService.retrievePOST(
					{ booking_id: selectedTaskForComplete.booking_id },
					API_ENDPOINTS.staff.baseStaff + API_ENDPOINTS.staff.noshowPickup
				);
				showSnackbar("Task marked as No Show.", "info");
			} else {
				// Dropoff completion only (pickup is handled by cost dialog)
				await dataService.retrievePOST(
					{ booking_id: selectedTaskForComplete.booking_id },
					API_ENDPOINTS.staff.baseStaff + API_ENDPOINTS.staff.completeSelfDropoff
				);
				showSnackbar("Dropoff task completed successfully!", "success");
			}
			// Remove the task from the list after action
			setTasks(tasks.filter(t => t.booking_id !== selectedTaskForComplete.booking_id));
			setOpenConfirm(false);
			setSelectedTaskForComplete(null);
			setIsNoShow(false);
		} catch (error) {
			console.error("Failed to complete task:", error);
			showSnackbar("Failed to complete the task. Please try again.", "error");
		}
	};

	const handleCloseConfirm = () => {
		setOpenConfirm(false);
		setSelectedTaskForComplete(null);
		setIsNoShow(false);
	};

	const handleCloseCostDialog = () => {
		setOpenCostDialog(false);
		setSelectedTaskForComplete(null);
		setCostData(null);
		sigCanvasRef.current?.clear();
	};

	const handleConfirmCostDialog = async () => {
		if (!selectedTaskForComplete || !costData || sigCanvasRef.current?.isEmpty()) {
			showSnackbar("Please provide your signature.", "warning");
			return;
		}

		try {
			const totalAmount = costData.booking_cost + (costData.no_show_fine || 0) + (costData.cancellation_fine || 0);
			await dataService.retrievePOST(
				{
					booking_id: selectedTaskForComplete.booking_id,
					amount_paid: totalAmount,
					fine_amount: (costData.no_show_fine || 0) + (costData.cancellation_fine || 0),
				},
				API_ENDPOINTS.staff.baseStaff + API_ENDPOINTS.staff.completeSelfPickup
			);
			
			// Remove the task from the list after action
			setTasks(tasks.filter(t => t.booking_id !== selectedTaskForComplete.booking_id));
			setOpenCostDialog(false);
			setSelectedTaskForComplete(null);
			setCostData(null);
			sigCanvasRef.current?.clear();
			showSnackbar("Pickup completed successfully!", "success");
		} catch (error) {
			console.error("Failed to complete pickup:", error);
			showSnackbar("Failed to complete the pickup. Please try again.", "error");
		}
	};

	const handleFilterChange = (event: any) => {
		setPage(0);
		setFilter(event.target.value);
	};

	const handleSearchChange = (event: any) => {
		setSearchTerm(event.target.value);
		setPage(0); // Reset to first page on search
	};

	const filteredTasks = useMemo(() => {
		if (!searchTerm) return tasks;
		return tasks.filter((task) =>
			(task.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(task.model?.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(task.license_plate?.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(task.booking_id?.toString().includes(searchTerm))
		);
	}, [tasks, searchTerm]);

	const handleChangePage = (event: any, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: any) => {
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
			id: "ticket_number",
			label: "Ticket Number",
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
		},
		{
			id: "license_plate",
			label: "License Plate",
			sx: {
				color: "var(--text-color)",
			},
		},
		{
			id: "datetime",
			label: "Date/Time",
			sx: {
				color: "var(--text-color)",
			},
			render: (task: PickupDropoffTask) => new Date(task.return_datetime || task.pickup_datetime).toLocaleString(),
		},
		{
			id: "minutes_until",
			label: "Minutes Until",
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
			render: (task: PickupDropoffTask) => (
				<Chip
					label={task.is_overdue ? "Overdue" : "On Time"}
					color={task.is_overdue ? "error" : "success"}
					size='small'
					variant="outlined"
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
			render: (task: PickupDropoffTask) => (
				<Box>
					<Tooltip title='Complete Task'>
						<IconButton onClick={() => handleComplete(task)}>
							<CompleteIcon color='success' />
						</IconButton>
					</Tooltip>
					{task.type === "Pickup" && (
						<Tooltip title='No Show'>
							<IconButton onClick={() => handleNoShow(task)}>
								<NoShowIcon color='error' />
							</IconButton>
						</Tooltip>
					)}
				</Box>
			),
		},
	];

	if (role !== "staff") {
		return (
			<Paper
				sx={{
					p: 2,
					bgcolor: "var(--background-paper)",
					color: "var(--text-color)",
				}}>
				<Typography variant='h4' gutterBottom>
					Access Denied
				</Typography>
				<Typography>
					You do not have permission to access this page.
				</Typography>
			</Paper>
		);
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
				Pickup & Dropoff Management
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
					<InputLabel>Filter</InputLabel>
					<Select
						value={filter}
						onChange={handleFilterChange}
						label='Filter'>
						<MenuItem value='pickup'>Pickup</MenuItem>
						<MenuItem value='dropoff'>Dropoff</MenuItem>
					</Select>
				</FormControl>
			</Box>

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
				keyExtractor={(task: PickupDropoffTask) => task.booking_id}
			/>

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
							{(costData.no_show_fine || 0) > 0 && (
								<Typography>
									<strong>No Show Fine:</strong> {costData.no_show_fine} MMK
								</Typography>
							)}
							{(costData.cancellation_fine || 0) > 0 && (
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
					<Button onClick={handleConfirmCostDialog} variant="contained" color="primary">
						Confirm Payment Collected
					</Button>
				</DialogActions>
			</Dialog>

			<ConfirmDialog
				open={openConfirm}
				onClose={handleCloseConfirm}
				onConfirm={handleConfirmComplete}
				title={isNoShow ? "Confirm No Show" : "Confirm Complete"}
				message={`Are you sure you want to ${isNoShow ? 'mark as no show' : 'complete'} this ${selectedTaskForComplete?.type?.toLowerCase()} task (Booking ID: ${selectedTaskForComplete?.booking_id})?`}
				confirmText={isNoShow ? "Mark No Show" : "Complete"}
				cancelText="Cancel"
			/>
		</Paper>
	);
};

export default PickupDropoffManagement;
