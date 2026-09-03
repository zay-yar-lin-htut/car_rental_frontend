import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
	Box,
	Typography,
	Chip,
} from "@mui/material";
import ReusableTable from "./ReusableTable";
import { createDataServices } from "../../../services/DataServices";
import { API_ENDPOINTS } from "../../../services/Configuration";

interface TaskHistoryRow {
	task_id: number;
	task_type: string;
	status: string;
	description: string;
	ticket_number: string;
	model: string;
	license_plate: string;
	created_at: string;
	updated_at: string;
	[key: string]: unknown;
}

const TaskHistory = () => {
	const dataService = useMemo(() => createDataServices(), []);
	const [tasks, setTasks] = useState<TaskHistoryRow[]>([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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
			render: (task: TaskHistoryRow) => {
				let color: "default" | "secondary" | "primary" | "success" | "error" = "default";
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
						label={(task.status as string).replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
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
			render: (task: TaskHistoryRow) => new Date(task.created_at).toLocaleString(),
		},
		{
			id: "updated_at",
			label: "Complete Task At",
			sx: {
				color: "var(--text-color)",
			},
			render: (task: TaskHistoryRow) => task.created_at === task.updated_at ? "" : new Date(task.updated_at).toLocaleString(),
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
			setTasks((response.data as TaskHistoryRow[]) || []);
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

	const handleChangePage = (event: any, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: any) => {
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
				keyExtractor={(task: TaskHistoryRow) => task.task_id}
			/>
		</Box>
	);
};

export default TaskHistory;
