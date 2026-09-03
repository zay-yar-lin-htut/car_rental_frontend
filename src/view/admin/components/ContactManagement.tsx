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
	List,
	ListItem,
	ListItemButton,
	ListItemText,
} from "@mui/material";
import {
	AssignmentInd as AssignmentIndIcon,
	CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useSnackbar } from "../../../contexts/ErrorMessage";
import { createDataServices } from "../../../services/DataServices";
import { API_ENDPOINTS } from "../../../services/Configuration";
import useDebouncedSearch from "../../common/useDebouncedSearch";

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

interface StaffMember {
	user_id: number;
	name: string;
	email: string;
	[key: string]: unknown;
}

const ContactManagement = () => {
	const { showSnackbar } = useSnackbar();
	const [messages, setMessages] = useState<ContactMessage[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [totalMessages, setTotalMessages] = useState(0);
	const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
	const [openAssignDialog, setOpenAssignDialog] = useState(false);
	const [selectedStaff, setSelectedStaff] = useState("");
	const [staffList, setStaffList] = useState<StaffMember[]>([]);
	const { searchTerm, setSearchTerm, debouncedSearchTerm } = useDebouncedSearch(
		"",
		500
	);
	const [assignmentFilter, setAssignmentFilter] = useState("All");
	const [resolutionFilter, setResolutionFilter] = useState("All");
	const [sortOrder, setSortOrder] = useState("Newest First");

	useEffect(() => {
		const fetchStaff = async () => {
			try {
				const queryParams = new URLSearchParams({
					filter_by: "staff",
				});
				if (debouncedSearchTerm) {
					queryParams.append("search_by", debouncedSearchTerm);
				}
				const response = await dataServices.retrieve(
					API_ENDPOINTS.users.base,
					`${API_ENDPOINTS.users.getAll}?${queryParams.toString()}`
				);
				setStaffList(((response.data as any)?.users || []) as StaffMember[]);
			} catch {
				showSnackbar("Failed to fetch staff list.", "error");
			}
		};
		fetchStaff();
	}, [debouncedSearchTerm]);

	const fetchMessages = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams({
				first: String(page + 1),
				max: String(rowsPerPage),
			});

			if (assignmentFilter !== "All") {
				params.append("assigned", String(assignmentFilter === "Assigned"));
			}
			if (resolutionFilter !== "All") {
				params.append("resolve", String(resolutionFilter === "Resolved"));
			}
			params.append("sort_by_time_asc", String(sortOrder === "Oldest First"));

			const response = await dataServices.retrieve(
				API_ENDPOINTS.contact.base,
				`${API_ENDPOINTS.contact.getContactUs}?${params.toString()}`
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
				assignedTo: msg.assigned_staff_name,
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
	}, [page, rowsPerPage, assignmentFilter, resolutionFilter, sortOrder]);

	const handleOpenAssignDialog = (message: ContactMessage) => {
		setSelectedMessage(message);
		setOpenAssignDialog(true);
	};

	const handleCloseAssignDialog = () => {
		setOpenAssignDialog(false);
		setSelectedMessage(null);
		setSelectedStaff("");
	};

	const handleAssignTask = async () => {
		if (!selectedStaff) {
			showSnackbar("Please select a staff member.", "error");
			return;
		}
		try {
			await dataServices.retrievePOST(
				{
					contact_us_id: selectedMessage!.id,
					staff_id: selectedStaff,
				},
				API_ENDPOINTS.contact.base +
					API_ENDPOINTS.contact.resolveWithStaffAssign
			);
			showSnackbar("Task assigned successfully!", "success");
			handleCloseAssignDialog();
			fetchMessages(); // Refresh the list
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : "Failed to assign task.";
			showSnackbar(msg, "error");
		}
	};

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
				API_ENDPOINTS.contact.base,
				API_ENDPOINTS.contact.resolveAdmin(messageId)
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
					let color: "default" | "primary" | "warning" | "success" = "default";
					let label = row.status;
					if (row.status === "New" && !row.assignedTo) {
						color = "primary";
					} else if (row.assignedTo) {
						color = "warning";
						label = "Assigned";
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
				id: "assignedTo",
				label: "Assigned To",
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
				render: (row: ContactMessage) => (
					<>
						{row.status !== "Resolved" && !row.assignedTo && (
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
						{row.status !== "Resolved" && (
							<Tooltip title='Assign to Staff'>
								<IconButton
									onClick={(e: any) => {
										e.stopPropagation();
										handleOpenAssignDialog(row);
									}}>
									<AssignmentIndIcon color='info' />
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
			<Typography variant="h4" sx={{ mb: 2 }}>Contact US Management</Typography>
			<Box sx={{ display: "flex", gap: 2, mb: 2 }}>
				<FormControl fullWidth>
					<InputLabel>Assignment Status</InputLabel>
					<Select
						value={assignmentFilter}
						label='Assignment Status'
						onChange={(e: any) => {
							setAssignmentFilter(e.target.value);
							setPage(0);
						}}>
						<MenuItem value='All'>All</MenuItem>
						<MenuItem value='Assigned'>Assigned</MenuItem>
						<MenuItem value='Unassigned'>Unassigned</MenuItem>
					</Select>
				</FormControl>
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
				open={!!selectedMessage && !openAssignDialog}
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

			<Dialog
				open={openAssignDialog}
				onClose={handleCloseAssignDialog}
				maxWidth='xs'
				fullWidth
				PaperProps={{
					sx: {
						bgcolor: "var(--background-paper)",
						color: "var(--text-color)",
					},
				}}>
				<DialogTitle>Assign Task to Staff</DialogTitle>
				<DialogContent>
					<TextField
						label='Search Staff'
						variant='outlined'
						fullWidth
						value={searchTerm}
						onChange={(e: any) => setSearchTerm(e.target.value)}
						sx={{ my: 1 }}
					/>
					<Paper
						variant='outlined'
						sx={{ maxHeight: 300, overflow: "auto" }}>
						<List dense>
							{staffList.length > 0 ? (
								staffList.map((staff) => (
									<ListItemButton
										key={staff.user_id}
										selected={selectedStaff === String(staff.user_id)}
										onClick={() => setSelectedStaff(String(staff.user_id))}>
										<ListItemText
											primary={staff.name}
											secondary={staff.email}
											secondaryTypographyProps={{
												color: "var(--text-secondary-color)",
											}}
										/>
									</ListItemButton>
								))
							) : (
								<ListItem>
									<ListItemText primary='No staff found.' />
								</ListItem>
							)}
						</List>
					</Paper>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseAssignDialog}>Cancel</Button>
					<Button
						onClick={handleAssignTask}
						variant='contained'
						disabled={!selectedStaff}>
						Assign
					</Button>
				</DialogActions>
			</Dialog>
		</Paper>
	);
};

export default ContactManagement;
