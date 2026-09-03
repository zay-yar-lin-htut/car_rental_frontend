import React, { useState, useEffect, useMemo } from "react";
import ReusableTable from "./ReusableTable";
import {
	Box,
	Typography,
	Tooltip,
	IconButton,
	Paper,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Button,
	Grid,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	TextField,
} from "@mui/material";
import {
	CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useSnackbar } from "../../../contexts/ErrorMessage";
import { createDataServices } from "../../../services/DataServices";
import { API_ENDPOINTS } from "../../../services/Configuration";

const dataServices = createDataServices();

interface ContactMessage {
	id: number;
	phone: string;
	email: string;
	subject: string;
	message: string;
	receivedAt: string;
	status: string;
	assignedTo?: string;
	[key: string]: unknown;
}

const ContactManagementStaff = () => {
	const { showSnackbar } = useSnackbar();
	const [messages, setMessages] = useState<ContactMessage[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [totalMessages, setTotalMessages] = useState(0);
	const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
	const [resolutionFilter, setResolutionFilter] = useState("All");
	const [sortOrder, setSortOrder] = useState("Newest First");

	const fetchMessages = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams({
				first: String(page + 1),
				max: String(rowsPerPage),
			});

			if (resolutionFilter !== "All") {
				params.append("resolve", String(resolutionFilter === "Resolved"));
			}
			params.append("sort_by_time_asc", String(sortOrder === "Oldest First"));

			const response = await dataServices.retrieve(
				API_ENDPOINTS.staff.baseStaff,
				`${API_ENDPOINTS.staff.getContactUs}?${params.toString()}`
			);
			const raw = response.data as any;
			const mappedData = (raw?.data || []).map((msg: any) => ({
				id: msg.contact_us_id,
				phone: msg.phone,
				email: msg.email,
				subject: msg.title,
				message: msg.description,
				receivedAt: msg.created_at,
				status: msg.is_resolved ? "Resolved" : "New",
			}));
						setMessages(mappedData);
						setTotalMessages(raw?.total || 0);			setError(null);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Failed to fetch messages.";
			setError(msg);
			showSnackbar(msg, "error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchMessages();
	}, [page, rowsPerPage, resolutionFilter, sortOrder]);



	const handleRowClick = (message: ContactMessage) => {
		setSelectedMessage(message);
	};

	const handleCloseDialog = () => {
		setSelectedMessage(null);
	};

	const handleChangePage = (event: any, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: any) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleResolve = async (messageId: number) => {
		try {
			await dataServices.retrieve(
				API_ENDPOINTS.staff.baseStaff,
				API_ENDPOINTS.staff.resolveContactUs(messageId)
			);
			showSnackbar("Message marked as resolved!", "success");
			fetchMessages(); // Refresh the list
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : "Failed to resolve message.";
			showSnackbar(msg, "error");
		}
	};

	const columns = useMemo(
		() => [
			{
				id: "id",
				label: "Contact ID",
				sx: {
					color: "var(--text-color)",
				},
			},
			{
				id: "phone",
				label: "Phone",
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
				id: "details",
				label: "Details",
				sx: {
					minWidth: 300,
					color: "var(--text-color)",
				},
				render: (row: ContactMessage) => (
					<Box>
						<Typography
							variant='subtitle2'
							component='div'
							sx={{ fontWeight: "bold" }}>
							{row.subject}
						</Typography>
						<Typography
							variant='body2'
							sx={{
								whiteSpace: "nowrap",
								overflow: "hidden",
								textOverflow: "ellipsis",
							}}>
							{row.message}
						</Typography>
					</Box>
				),
			},
			{
				id: "receivedAt",
				label: "Received",
				render: (row: ContactMessage) => new Date(row.receivedAt).toLocaleString(),
				sx: {
					color: "var(--text-color)",
				},
			},
			{
				id: "status",
				label: "Status",
				align: "center",
				sx: {
					color: "var(--text-color)",
				},
				render: (row: ContactMessage) => {
					let color: "default" | "primary" | "success" = "default";
					let label = row.status;
					if (row.status === "New") {
						color = "primary";
					} else if (row.status === "Resolved") {
						color = "success";
					}
					return (
						<Chip
							label={label}
							color={color}
							size='small'
						/>
					);
				},
			},
			{
				id: "actions",
				label: "Actions",
				sx: {
					color: "var(--text-color)",
				},
				align: "center",
				render: (row: ContactMessage) => (
					<>
						{row.status !== "Resolved" && (
							<Tooltip title='Mark as Resolved'>
								<IconButton
									onClick={(e: any) => {
										e.stopPropagation();
										handleResolve(row.id);
									}}>
									<CheckCircleIcon color='success' />
								</IconButton>
							</Tooltip>
						)}
					</>
				),
			},
		],
		[handleResolve]
	);

	return (
		<Paper
			sx={{
				p: 2,
				bgcolor: "var(--background-paper)",
				color: "var(--text-color)",
			}}>
			<Typography variant="h4" sx={{ mb: 2 }}>Contact Us Management</Typography>
			<Box sx={{ display: "flex", gap: 2, mb: 2 }}>
				<FormControl fullWidth>
					<InputLabel>Resolution Status</InputLabel>
					<Select
						value={resolutionFilter}
						label='Resolution Status'
						onChange={(e: any) => {
							setResolutionFilter(e.target.value);
							setPage(0);
						}}>
						<MenuItem value='All'>All</MenuItem>
						<MenuItem value='Resolved'>Resolved</MenuItem>
						<MenuItem value='Pending'>Pending</MenuItem>
					</Select>
				</FormControl>
				<FormControl fullWidth>
					<InputLabel>Sort by Date</InputLabel>
					<Select
						value={sortOrder}
						label='Sort by Date'
						onChange={(e: any) => {
							setSortOrder(e.target.value);
							setPage(0);
						}}>
						<MenuItem value='Newest First'>Newest First</MenuItem>
						<MenuItem value='Oldest First'>Oldest First</MenuItem>
					</Select>
				</FormControl>
			</Box>
			<ReusableTable
				columns={columns}
				data={messages}
				loading={loading}
				error={error}
				page={page}
				rowsPerPage={rowsPerPage}
				total={totalMessages}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				onRowClick={handleRowClick}
				keyExtractor={(row: ContactMessage) => row.id}
			/>

			<Dialog
				open={!!selectedMessage}
				onClose={handleCloseDialog}
				maxWidth='md'
				fullWidth
				PaperProps={{
					sx: {
						bgcolor: "var(--background-paper)",
						color: "var(--text-color)",
					},
				}}>
				<DialogTitle>Message Details</DialogTitle>
				<DialogContent dividers>
					{selectedMessage && (
						<Grid
							container
							spacing={2}>
							<Grid
								size={{ xs: 12, sm: 4 }}>
								<Typography variant='caption'>Contact ID</Typography>
								<Typography>{selectedMessage.id}</Typography>
							</Grid>
							<Grid
								size={{ xs: 12, sm: 4 }}>
								<Typography variant='caption'>Phone</Typography>
								<Typography>{selectedMessage.phone}</Typography>
							</Grid>
							<Grid
								size={{ xs: 12, sm: 4 }}>
								<Typography variant='caption'>Email</Typography>
								<Typography>{selectedMessage.email}</Typography>
							</Grid>
							<Grid
								size={{ xs: 12 }}>
								<Typography variant='caption'>Subject</Typography>
								<Typography>{selectedMessage.subject}</Typography>
							</Grid>
							<Grid
								size={{ xs: 12 }}>
								<Typography variant='caption'>Message</Typography>
								<DialogContentText sx={{ color: "var(--text-color)", mt: 0.5 }}>
									{selectedMessage.message}
								</DialogContentText>
							</Grid>
						</Grid>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog}>Close</Button>
				</DialogActions>
			</Dialog>


		</Paper>
	);
};

export default ContactManagementStaff;
