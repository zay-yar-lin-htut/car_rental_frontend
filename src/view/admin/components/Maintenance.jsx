import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
	Box,
	TextField,
	Typography,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Chip,
	Tooltip,
	IconButton,
} from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import ReusableTable from "./ReusableTable";
import ConfirmDialog from "../../../common/ConfirmDialog";
import { createDataServices } from "../../../services/DataServices";
import { API_ENDPOINTS } from "../../../services/Configuration";
import { useSnackbar } from "../../../contexts/ErrorMessage";

const Maintenance = () => {
	const { showSnackbar } = useSnackbar();
	const dataService = useMemo(() => createDataServices(), []);
	const [maintenanceTasks, setMaintenanceTasks] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [openDialog, setOpenDialog] = useState(false);
	const [openCarDialog, setOpenCarDialog] = useState(false);
	const [cars, setCars] = useState([]);
	const [openConfirm, setOpenConfirm] = useState(false);
	const [selectedMaintenanceId, setSelectedMaintenanceId] = useState(null);
	const [carSearchTerm, setCarSearchTerm] = useState("");
	const [selectedCar, setSelectedCar] = useState(null);
	const [newMaintenance, setNewMaintenance] = useState({
		car_id: "",
		description: "",
		cost: "",
	});

	const carColumns = useMemo(
		() => [
			{
				id: "license_plate",
				label: "License Plate",
				sx: {
					color: "var(--text-color)",
				},
			},
			{
				id: "model",
				label: "Model",
				sx: {
					color: "var(--text-color)",
				},
			},
			{
				id: "car_type",
				label: "Car Type",
				sx: {
					color: "var(--text-color)",
				},
			},
			{
				id: "actions",
				label: "Actions",
				sx: {
					color: "var(--text-color)",
				},
				align: "center",
				render: (car) => (
					<Button
						variant="contained"
						onClick={() => handleSelectCar(car)}
						sx={{ bgcolor: "var(--primary-color)", color: "var(--primary-contrast-text)" }}
					>
						Select
					</Button>
				),
			},
		],
		[]
	);

	const fetchMaintenanceTasks = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await dataService.retrieve(
				API_ENDPOINTS.staff.baseStaff,
				API_ENDPOINTS.staff.maintenanceTasks
			);
			setMaintenanceTasks(response.data || []);
			setError(null);
		} catch (err) {
			setError("Failed to fetch maintenance tasks. Please try again later.");
			setMaintenanceTasks([]);
		} finally {
			setLoading(false);
		}
	}, [dataService]);

	const fetchCars = useCallback(async () => {
		try {
			const params = new URLSearchParams({
				first: 1,
				max: 100, 
				available: true,
			});
			if (carSearchTerm) params.append('search_by', carSearchTerm);
			const response = await dataService.retrieve(
				API_ENDPOINTS.cars.base,
				`${API_ENDPOINTS.cars.getAll}?${params.toString()}`
			);
			setCars(response.data.data || response.data.cars || response.data || []);
		} catch (err) {
			showSnackbar("Failed to fetch cars.", "error");
		}
	}, [dataService, carSearchTerm]);

	useEffect(() => {
		fetchMaintenanceTasks();
	}, [fetchMaintenanceTasks]);

	useEffect(() => {
		if (openCarDialog) {
			fetchCars();
		}
	}, [openCarDialog, fetchCars]);

	const handleComplete = (id) => {
		setSelectedMaintenanceId(id);
		setOpenConfirm(true);
	};

	const handleConfirmComplete = async () => {
		if (!selectedMaintenanceId) return;
		try {
			await dataService.retrieve(
				API_ENDPOINTS.staff.baseStaff,
				API_ENDPOINTS.staff.completeMaintenanceTask(selectedMaintenanceId)
			);
			showSnackbar("Maintenance task completed successfully.", "success");
			fetchMaintenanceTasks(); // Refresh the list
			setOpenConfirm(false);
			setSelectedMaintenanceId(null);
		} catch (error) {
			showSnackbar("Failed to complete maintenance task.", "error");
		}
	};

	const handleCloseConfirm = () => {
		setOpenConfirm(false);
		setSelectedMaintenanceId(null);
	};

	const handleOpenDialog = () => {
		setOpenDialog(true);
		setSelectedCar(null);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setNewMaintenance({
			car_id: "",
			description: "",
			cost: "",
		});
	};

	const handleOpenCarDialog = () => {
		setOpenCarDialog(true);
	};

	const handleCloseCarDialog = () => {
		setOpenCarDialog(false);
		setCarSearchTerm("");
	};

	const handleSelectCar = (car) => {
		setSelectedCar(car);
		setOpenCarDialog(false);
		setCarSearchTerm("");
	};

	const handleCreateMaintenance = async () => {
		if (!selectedCar || !newMaintenance.description || !newMaintenance.cost) {
			showSnackbar("Please fill in all fields.", "error");
			return;
		}
		try {
			await dataService.retrievePOST(
				{
					car_id: selectedCar.car_id,
					description: newMaintenance.description,
					cost: parseFloat(newMaintenance.cost),
				},
				API_ENDPOINTS.staff.baseStaff + API_ENDPOINTS.staff.createMaintenanceReport
			);
			showSnackbar("Maintenance report created successfully.", "success");
			handleCloseDialog();
			fetchMaintenanceTasks(); // Refresh the list
		} catch (error) {
			showSnackbar("Failed to create maintenance report.", "error");
		}
	};

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const columns = useMemo(
		() => [
			{
				id: "maintenance_id",
				label: "Maintenance ID",
				sx: {
					color: "var(--text-color)",
				},
			},
			{
				id: "description",
				label: "Description",
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
				label: "Car License",
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
				render: (task) => (
					<Chip
						label={task.status}
						color={task.status === "completed" ? "success" : "warning"}
						size="small"
					/>
				),
			},
			{
				id: "created_at",
				label: "Maintenance Start",
				sx: {
					color: "var(--text-color)",
				},
				render: (task) => new Date(task.created_at).toLocaleString(),
			},
			{
				id: "updated_at",
				label: "Finish",
				sx: {
					color: "var(--text-color)",
				},
				render: (task) =>
					task.created_at !== task.updated_at
						? new Date(task.updated_at).toLocaleString()
						: "",
			},
			{
				id: "cost",
				label: "Cost (MMK)",
				sx: {
					color: "var(--text-color)",
				},
				render: (task) => `${task.cost} MMK`,
			},
			{
				id: "actions",
				label: "Actions",
				sx: {
					color: "var(--text-color)",
				},
				align: "center",
				render: (row) => (
					<>
						{row.status === "pending" && (
							<Tooltip title='Complete Maintenance'>
								<IconButton
									onClick={(e) => {
										e.stopPropagation();
										handleComplete(row.maintenance_id);
									}}>
									<CheckCircleIcon color='success' />
								</IconButton>
							</Tooltip>
						)}
					</>
				),
			},
		],
		[handleComplete]
	);

	return (
		<Box>
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
				<Typography variant="h4" sx={{ color: "var(--text-color)" }}>
					Maintenance Tasks
				</Typography>
				<Button
					variant="contained"
					onClick={handleOpenDialog}
					sx={{ bgcolor: "var(--primary-color)", color: "var(--primary-contrast-text)" }}
				>
					Add New Maintenance
				</Button>
			</Box>
			<ReusableTable
				columns={columns}
				loading={loading}
				error={error}
				data={maintenanceTasks}
				page={page}
				rowsPerPage={rowsPerPage}
				total={maintenanceTasks.length}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				keyExtractor={(task) => task.maintenance_id}
			/>

			<Dialog
				open={openDialog}
				onClose={handleCloseDialog}
				maxWidth="sm"
				fullWidth
				PaperProps={{
					sx: {
						bgcolor: "var(--background-paper)",
						color: "var(--text-color)",
					},
				}}
			>
				<DialogTitle>Add New Maintenance</DialogTitle>
				<DialogContent>
					<Box sx={{ display: "flex", gap: 2, mt: 2 }}>
						<TextField
							label="Selected Car"
							variant="outlined"
							fullWidth
							value={selectedCar ? `${selectedCar.car_id} - ${selectedCar.license_plate}` : ""}
							disabled
						/>
						<Button
							variant="outlined"
							onClick={handleOpenCarDialog}
							sx={{ minWidth: 120 }}
						>
							Select Car
						</Button>
					</Box>
					<TextField
						label="Description"
						variant="outlined"
						fullWidth
						multiline
						rows={3}
						value={newMaintenance.description}
						onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
						sx={{ mt: 2 }}
					/>
					<TextField
						label="Cost"
						variant="outlined"
						fullWidth
						type="number"
						value={newMaintenance.cost}
						onChange={(e) => setNewMaintenance({ ...newMaintenance, cost: e.target.value })}
						sx={{ mt: 2 }}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog}>Cancel</Button>
					<Button onClick={handleCreateMaintenance} variant="contained">
						Create
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={openCarDialog}
				onClose={handleCloseCarDialog}
				maxWidth="md"
				fullWidth
				PaperProps={{
					sx: {
						bgcolor: "var(--background-paper)",
						color: "var(--text-color)",
					},
				}}
			>
				<DialogTitle>Select Car</DialogTitle>
				<DialogContent>
					<TextField
						label="Search Cars"
						variant="outlined"
						fullWidth
						value={carSearchTerm}
						onChange={(e) => setCarSearchTerm(e.target.value)}
						sx={{ mt: 2 }}
					/>
					<Box sx={{ mt: 2, maxHeight: 400, overflow: "auto" }}>
						<ReusableTable
							columns={carColumns}
							data={cars}
							loading={false}
							error={null}
							page={0}
							rowsPerPage={cars.length}
							total={cars.length}
							onPageChange={() => {}}
							onRowsPerPageChange={() => {}}
							keyExtractor={(car) => car.car_id}
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseCarDialog}>Cancel</Button>
				</DialogActions>
			</Dialog>

			<ConfirmDialog
				open={openConfirm}
				onClose={handleCloseConfirm}
				onConfirm={handleConfirmComplete}
				title="Confirm Complete"
				message="Are you sure you want to complete this maintenance task?"
				confirmText="Complete"
				cancelText="Cancel"
			/>
		</Box>
	);
};

export default Maintenance;