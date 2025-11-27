import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
	Box,
	Typography,
	Chip,
} from "@mui/material";
import ReusableTable from "./ReusableTable";
import { createDataServices } from "../../../services/DataServices";
import { API_ENDPOINTS } from "../../../services/Configuration";

const TaskHistory = () => {
	const dataService = useMemo(() => createDataServices(), []);
	const [tasks, setTasks] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

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
			id: "description",
			label: "Description",
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
						color = "secondary";
						break;
					case "in_progress":
						color = "primary";
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
			id: "created_at",
			label: "Claim Task At",
			sx: {
				color: "var(--text-color)",
			},
			render: (task) => new Date(task.created_at).toLocaleString(),
		},
		{
			id: "updated_at",
			label: "Complete Task At",
			sx: {
				color: "var(--text-color)",
			},
			render: (task) => task.created_at === task.updated_at ? "" : new Date(task.updated_at).toLocaleString(),
		},
	];

	const fetchTasks = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await dataService.retrieve(
				API_ENDPOINTS.staff.baseStaff,
				API_ENDPOINTS.staff.taskHistory
			);
			setTasks(response.data || []);
			setError(null);
		} catch {
			setError("Failed to fetch task history. Please try again later.");
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

	return (
		<Box>
		<Typography variant="h4" gutterBottom sx={{ color: "var(--text-color)" }}>
			Task History
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
		</Box>
	);
};

export default TaskHistory;