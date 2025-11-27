import React, { useState, useEffect } from "react";
import {
	Box,
	TextField,
	Button,
	Tooltip,
	IconButton,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Paper,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
	CircularProgress,
} from "@mui/material";
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	Add as AddIcon,
	CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { createDataServices } from "../../../services/DataServices";
import { API_ENDPOINTS } from "../../../services/Configuration";
import { useSnackbar } from "../../../contexts/ErrorMessage";

const dataServices = createDataServices();

const CarTypeManagement = () => {
	const { showSnackbar } = useSnackbar();
	const [carTypes, setCarTypes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [totalCarTypes, setTotalCarTypes] = useState(0);
	const [openDialog, setOpenDialog] = useState(false);
	const [editingCarType, setEditingCarType] = useState(null);
	const [selectedFile, setSelectedFile] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [carTypeForm, setCarTypeForm] = useState({
		type_name: "",
		description: "",
	});

	const fetchCarTypes = async () => {
		try {
			setLoading(true);
			const response = await dataServices.retrieve(
				API_ENDPOINTS.carTypes.base,
				API_ENDPOINTS.carTypes.getAll
			);
			const data = response.data || [];
			setCarTypes(data);
			setTotalCarTypes(data.length);
		} catch (err) {
			setError(err.message || "Failed to load car types");
			showSnackbar("Failed to load car types", "error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCarTypes();
	}, []);

	const handleOpenDialog = (carType = null) => {
		setEditingCarType(carType);
		setCarTypeForm(
			carType
				? { type_name: carType.type_name, description: carType.description || "" }
				: { type_name: "", description: "" }
		);
		setImagePreview(carType ? carType.car_type_image_url : null);
		setSelectedFile(null);
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setEditingCarType(null);
		setImagePreview(null);
		setSelectedFile(null);
	};

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (file) {
			setSelectedFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSave = async () => {
		try {
			const formData = new FormData();
			formData.append("type_name", carTypeForm.type_name);
			formData.append("description", carTypeForm.description);
			if (selectedFile) {
				formData.append("car_type_image", selectedFile);
			}

			if (editingCarType) {
				await dataServices.retrievePOSTFormData(
					formData,
					API_ENDPOINTS.carTypes.base + API_ENDPOINTS.carTypes.update(editingCarType.car_type_id)
				);
				showSnackbar("Car type updated successfully", "success");
			} else {
				await dataServices.retrievePOSTFormData(
					formData,
					API_ENDPOINTS.carTypes.base + API_ENDPOINTS.carTypes.create
				);
				showSnackbar("Car type created successfully", "success");
			}
			fetchCarTypes();
			handleCloseDialog();
		} catch (err) {
			showSnackbar("Failed to save car type", "error");
		}
	};

	const handleDelete = async (carType) => {
		if (window.confirm(`Delete ${carType.type_name}?`)) {
			try {
				await dataServices.retrieveDELETE(
					API_ENDPOINTS.carTypes.base,
					API_ENDPOINTS.carTypes.delete(carType.car_type_id)
				);
				showSnackbar("Car type deleted successfully", "success");
				fetchCarTypes();
			} catch (err) {
				showSnackbar("Failed to delete car type", "error");
			}
		}
	};

	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "80vh",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 4 }}>
				<Typography color="error">{error}</Typography>
			</Box>
		);
	}

	return (
		<Box
			sx={{
				p: 2,
				bgcolor: "var(--background-paper)",
				color: "var(--text-color)",
			}}
		>
			<Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
				<Typography variant="h4">Car Type Management</Typography>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => handleOpenDialog()}
				>
					Add Car Type
				</Button>
			</Box>

			<Paper>
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Photo</TableCell>
								<TableCell>Type Name</TableCell>
								<TableCell>Description</TableCell>
								<TableCell>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{carTypes.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((carType) => (
								<TableRow key={carType.car_type_id}>
									<TableCell>
										<img
											src={carType.car_type_image_url}
											alt={carType.type_name}
											style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4 }}
										/>
									</TableCell>
									<TableCell>{carType.type_name}</TableCell>
									<TableCell>{carType.description}</TableCell>
									<TableCell>
										<Tooltip title="Edit">
											<IconButton onClick={() => handleOpenDialog(carType)}>
												<EditIcon style={{ color: "var(--success-color)" }} />
											</IconButton>
										</Tooltip>
										<Tooltip title="Delete">
											<IconButton onClick={() => handleDelete(carType)}>
												<DeleteIcon style={{ color: "var(--error-color)" }} />
											</IconButton>
										</Tooltip>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			<Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
				<DialogTitle>{editingCarType ? "Edit Car Type" : "Add Car Type"}</DialogTitle>
				<DialogContent>
					<Box
						sx={{
							display: "flex",
							flexDirection: { xs: "column", md: "row" },
							gap: 3,
							mt: 1,
							minHeight: 300,
						}}>
						{/* Left Column: Image Upload */}
						<Box
							component='label'
							sx={{ width: { xs: "100%", md: "40%" }, cursor: "pointer" }}>
							<Paper
								variant='outlined'
								sx={{
									height: "100%",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexDirection: "column",
									p: 2,
									boxSizing: "border-box",
									textAlign: "center",
									backgroundColor: "action.hover",
									minHeight: { xs: 200, md: "auto" },
									backgroundImage: imagePreview
										? `url(${imagePreview})`
										: "none",
									backgroundSize: "cover",
									backgroundPosition: "center",
								}}>
								{!imagePreview && (
									<>
										<CloudUploadIcon
											sx={{
												fontSize: 60,
												color: "var(--text-secondary-color)",
												mb: 2,
											}}
										/>
										<Typography
											variant='h6'
											sx={{
												color: "var(--text-secondary-color)",
											}}
											gutterBottom>
											Click to upload
										</Typography>
										<Typography
											variant='body2'
											color='var(--text-secondary-color)'>
											PNG, JPG, GIF up to 10MB
										</Typography>
									</>
								)}
								<input
									type='file'
									hidden
									accept='image/*'
									onChange={handleFileChange}
								/>
							</Paper>
						</Box>

						{/* Right Column: Form Fields */}
						<Box
							sx={{
								width: { xs: "100%", md: "60%" },
								display: "flex",
								flexDirection: "column",
								gap: 2,
							}}>
							<TextField
								fullWidth
								label="Type Name"
								value={carTypeForm.type_name}
								onChange={(e) =>
									setCarTypeForm({ ...carTypeForm, type_name: e.target.value })
								}
							/>
							<TextField
								fullWidth
								label="Description"
								multiline
								rows={4}
								value={carTypeForm.description}
								onChange={(e) =>
									setCarTypeForm({ ...carTypeForm, description: e.target.value })
								}
							/>
						</Box>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog}>Cancel</Button>
					<Button onClick={handleSave} variant="contained">
						Save
					</Button>
				</DialogActions>
			</Dialog>

			<TablePagination
				component="div"
				count={totalCarTypes}
				page={page}
				onPageChange={handleChangePage}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>
		</Box>
	);
};

export default CarTypeManagement;