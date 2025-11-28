import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
	Box,
	Typography,
	Stack,
	Card,
	CardMedia,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Alert,
	Chip,
	Divider,
	Avatar,
	useTheme,
	useMediaQuery,
	IconButton,
} from "@mui/material";
import {
	Edit,
	Mail,
	Phone,
	LocationOn,
	WarningAmber,
	ArrowBack as ArrowBackIcon,
	Lock,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserProfile } from "./useUserProfile";
import { AUTH_CONFIG, API_ENDPOINTS } from "../../services/Configuration";
import { getNavLinks } from "../home/Config/navigationConfig";
import ContactUs from "../../contactUs/ContactUs";
import { useSnackbar } from "../../contexts/ErrorMessage";
import { useUserRole } from "../../contexts/userRoleContext";
import CommonAppBar from "../common/AppBar";
import { createDataServices } from "../../services/DataServices";

// Form fields for edit dialog
const formFields = [
	{ name: "name", label: "Full Name", type: "text", required: true },
	{ name: "email", label: "Email Address", type: "email", required: true },
	{ name: "phone", label: "Phone Number", type: "tel" },
	{ name: "image", label: "Change Avatar", type: "file", accept: "image/*" },
];

// Change Password Dialog
const ChangePasswordDialog = ({ open, onClose, onSave, isSaving }) => {
	const [formData, setFormData] = useState({
		current_password: "",
		new_password: "",
		new_password_confirmation: "",
	});
	const [error, setError] = useState("");

	const handleClose = useCallback(() => {
		if (isSaving) return;
		setFormData({
			current_password: "",
			new_password: "",
			new_password_confirmation: "",
		});
		setError("");
		onClose();
	}, [isSaving, onClose]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

 	const handleSave = async () => {
		setError("");
		try {
			await onSave(formData);
			handleClose();
		} catch (err) {
			setError(err.message || "Failed to change password.");
		}
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle sx={{ textAlign: "center", fontWeight: 800, pt: 3 }}>
				Change Password
			</DialogTitle>
			<DialogContent sx={{ pb: 3 }}>
				{error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
				<Stack spacing={2.5} sx={{ mt: 2 }}>
					<TextField
						fullWidth
						label="Current Password"
						name="current_password"
						type="password"
						value={formData.current_password}
						onChange={handleInputChange}
						required
						disabled={isSaving}
					/>
					<TextField
						fullWidth
						label="New Password"
						name="new_password"
						type="password"
						value={formData.new_password}
						onChange={handleInputChange}
						required
						disabled={isSaving}
					/>
					<TextField
						fullWidth
						label="Confirm New Password"
						name="new_password_confirmation"
						type="password"
						value={formData.new_password_confirmation}
						onChange={handleInputChange}
						required
						disabled={isSaving}
					/>
				</Stack>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 4, justifyContent: "space-between" }}>
				<Button onClick={handleClose} disabled={isSaving} size="large">
					Cancel
				</Button>
				<Button
					onClick={handleSave}
					variant="contained"
					disabled={isSaving}
					size="large"
					startIcon={isSaving && <CircularProgress size={20} />}
				>
					{isSaving ? "Changing..." : "Change Password"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

// Edit Profile Dialog
const EditProfileDialog = ({ open, onClose, onSave, initialData, isSaving }) => {
	const [formData, setFormData] = useState({});
	const [selectedFile, setSelectedFile] = useState(null);
	const [previewImage, setPreviewImage] = useState(null);
	const [error, setError] = useState("");
	const [errors, setErrors] = useState({});

	const validateForm = () => {
		const newErrors = {};
		if (!formData.name?.trim()) newErrors.name = "Name is required";
		if (!formData.email?.trim()) newErrors.email = "Email is required";
		else if (!/\S+@\S+\.\S+/.test(formData.email))
			newErrors.email = "Invalid email address";
		if (formData.phone?.trim() && !/^\+?\d{10,15}$/.test(formData.phone.replace(/\s/g, "")))
			newErrors.phone = "Invalid phone number";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	useEffect(() => {
		if (open && initialData) {
			setFormData(initialData);
			setPreviewImage(initialData.profile_image_url || null);
			setSelectedFile(null);
			setError("");
			setErrors({});
		}
	}, [open, initialData]);

	const handleClose = useCallback(() => {
		if (isSaving) return;
		if (previewImage?.startsWith("blob:")) URL.revokeObjectURL(previewImage);
		onClose();
	}, [isSaving, onClose, previewImage]);

	const handleInputChange = (e) => {
		const { name, value, type, files } = e.target;
		if (type === "file") {
			const file = files[0];
			setSelectedFile(file);
			if (previewImage?.startsWith("blob:")) URL.revokeObjectURL(previewImage);
			setPreviewImage(file ? URL.createObjectURL(file) : initialData?.profile_image_url);
		} else {
			setFormData(prev => ({ ...prev, [name]: value }));
		}
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: null }));
		}
	};

	const handleSave = async () => {
		if (!validateForm()) return;
		setError("");
		const result = await onSave({ formData, selectedFile });
		if (result.success) {
			handleClose();
		} else {
			setError(result.message);
		}
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle sx={{ textAlign: "center", fontWeight: 800, pt: 3 }}>
				Edit Your Profile
			</DialogTitle>
			<DialogContent sx={{ pb: 3 }}>
				{error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

				{previewImage && (
					<Box sx={{ textAlign: "center", my: 3 }}>
						<Avatar
							src={previewImage}
							alt="Preview"
							sx={{
								width: 160,
								height: 160,
								mx: "auto",
								border: "8px solid",
								borderColor: "primary.main",
								boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
							}}
						/>
					</Box>
				)}

				<Stack spacing={2.5}>
					{formFields.map(field => (
						<TextField
							key={field.name}
							fullWidth
							label={field.label}
							name={field.name}
							type={field.type === "file" ? "file" : field.type}
							value={field.type !== "file" ? formData[field.name] || "" : undefined}
							onChange={handleInputChange}
							required={field.required}
							disabled={isSaving}
							error={!!errors[field.name]}
							helperText={errors[field.name]}
							InputLabelProps={field.type === "file" ? { shrink: true } : {}}
							InputProps={field.type === "file" ? { inputProps: { accept: field.accept } } : {}}
							sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
						/>
					))}
				</Stack>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 4, justifyContent: "space-between" }}>
				<Button onClick={handleClose} disabled={isSaving} size="large">
					Cancel
				</Button>
				<Button
					onClick={handleSave}
					variant="contained"
					disabled={isSaving}
					size="large"
					startIcon={isSaving && <CircularProgress size={20} />}
				>
					{isSaving ? "Saving..." : "Save Changes"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

// Helper: User type name
const getUserTypeName = (id) => {
	const types = { 1: "User", 2: "Staff", 3: "Admin" };
	return types[id] || "User";
};

// Main Component
const ModernUserProfile = () => {
	const {
		user,
		profileLoading,
		openDialog,
		isSaving,
		handleOpenDialog,
		handleCloseDialog,
		handleProfileUpdate,
		fineDetails,
	} = useUserProfile();

	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));
	const navigate = useNavigate();
	const location = useLocation();
	const isLogin = AUTH_CONFIG.isAuthenticated();
	const navLinks = useMemo(() => getNavLinks(isLogin), [isLogin]);
	const [isContactUsOpen, setContactUsOpen] = useState(false);
	const [logouting, setLogouting] = useState(false);
	const isInDashboard = location.pathname.includes('/admin') || location.pathname.includes('/staff');
	const [openChangePasswordDialog, setOpenChangePasswordDialog] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const { showSnackbar } = useSnackbar();
	const dataService = useMemo(() => createDataServices(), []);

	const handleLogout = () => {
		setLogouting(true);
		AUTH_CONFIG.clearToken();
		AUTH_CONFIG.clearUserData();
		setTimeout(() => navigate("/"), 800);
	};

 	const handleChangePassword = async (formData) => {
		setIsChangingPassword(true);
		try {
			const response = await dataService.retrievePOST(
				formData,
				API_ENDPOINTS.users.base + API_ENDPOINTS.users.changePassword
			);
			if (!response.success) {
				throw new Error(response.message || "Failed to change password.");
			}
			showSnackbar("Password changed successfully!", "success");
		} catch (error) {
			throw new Error(error.message || "Failed to change password.");
		} finally {
			setIsChangingPassword(false);
		}
	};

 	if (profileLoading) {
 		return (
 			<Box>
 				<CommonAppBar
 					navLinks={navLinks}
 					isLogin={isLogin}
 					handleLogout={handleLogout}
 					isLogouting={logouting}
 					setContactUsOpen={setContactUsOpen}
 					hideNavbarOnMobile={false}
 				/>
 				<Box
 					sx={{
 						display: "flex",
 						justifyContent: "center",
 						alignItems: "center",
 						minHeight: "100vh",
 						bgcolor: "var(--background-color)",
 						pt: { xs: 28, md: 30 },
 					}}>
 					<CircularProgress size={44} />
 				</Box>
 			</Box>
 		);
 	}

	if (!user) {
		return (
			<Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", p: 3 }}>
				<Typography variant="h5" gutterBottom>Profile Not Found</Typography>
				<Button variant="contained" size="large" onClick={() => navigate("/login")}>
					Go to Login
				</Button>
			</Box>
		);
	}

 	return (
 		<>
 			{!isInDashboard && (
 				<CommonAppBar
 					navLinks={navLinks}
 					isLogin={isLogin}
 					handleLogout={handleLogout}
 					isLogouting={logouting}
 					setContactUsOpen={setContactUsOpen}
 					hideNavbarOnMobile={false}
 				/>
 			)}

			{/* Main Layout */}
			<Box
				sx={{
					minHeight: "100vh",
					bgcolor: "var(--background-color)",
					position: "relative",
					overflow: "hidden",
					pt: { xs: 2, md: 4 },
				}}
			>

				{/* Grid Layout: Avatar Left, Info Right */}
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
						alignItems: "center",
						minHeight: "100vh",
						px: { xs: 3, md: 8 },
						pt: { xs: 10, md: 0 },
						gap: { xs: 6, md: 10 },
					}}
				>
					{/* Avatar - Left on Desktop, Top on Mobile */}
					<Box sx={{ justifySelf: { xs: "center", md: "end" } }}>
						<Avatar
							src={user.profile_image_url || "/default-avatar.png"}
							alt={user.name}
							sx={{
								width: { xs: 240, sm: 300, md: 380 },
								height: { xs: 240, sm: 300, md: 380 },
								border: "16px solid white",
								boxShadow: "0 30px 80px rgba(0,0,0,0.3)",
								transition: "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
								"&:hover": {
									transform: "translateY(-16px) scale(1.04)",
									boxShadow: "0 40px 100px rgba(0,0,0,0.35)",
								},
							}}
						/>
					</Box>

					{/* Profile Card - Right on Desktop */}
					<Box sx={{ justifySelf: { xs: "", md: "start" }, width: "100%" }}>
						<Card
							elevation={24}
							sx={{
								borderRadius: 3,
								p: { xs: 4, md: 6 },
								background: "var(--background-paper)",
								color: "var(--text-color)",
								boxShadow: 3,
							}}
						>
							{/* Header */}
							<Box sx={{ textAlign: { xs: "center", md: "left" }, mb: 4 }}>
								<Typography
									variant="h3"
									component="h1"
									fontWeight={900}
									sx={{
										color: "var(--text-color)",
										mb: 1,
									}}
								>
									{user.name}
								</Typography>
								<Chip
									label={getUserTypeName(user.user_type_id)}
									sx={{
										backgroundColor: "var(--primary-color)",
										color: "white",
										fontWeight: 700,
										height: 40,
										px: 2
									}}
								/>
							</Box>

							<Divider sx={{ my: 5 }} />

							{/* User Details */}
							<Stack spacing={4.5}>
								<DetailRow icon={<Mail fontSize="small" />} label="Email" value={user.email} />
								{user.phone && <DetailRow icon={<Phone fontSize="small" />} label="Phone" value={user.phone} />}
								{user.address && <DetailRow icon={<LocationOn fontSize="small" />} label="Location" value={user.address} />}
							</Stack>

							{/* Penalty Warning */}
							{(user.no_show_count > 0 || user.cancellation_count > 0) && (
								<Alert icon={<WarningAmber />} severity="warning" sx={{ mt: 5, borderRadius: 3, py: 2 }}>
									<Typography fontWeight={700}>Penalty Record</Typography>
									{user.no_show_count > 0 && <div>• No-Show: {user.no_show_count} time(s)</div>}
									{user.cancellation_count > 0 && <div>• Late Cancellation: {user.cancellation_count} time(s)</div>}
								</Alert>
							)}

							{/* Fine Alert */}
							{fineDetails && (
								<Alert severity="error" sx={{ mt: 4, borderRadius: 3, py: 2 }}>
									<Typography fontWeight={700}>
										Outstanding Fine: {fineDetails["Total Fine"]} MMK
									</Typography>
								</Alert>
							)}

							{/* Action Buttons */}
							<Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ mt: 6, justifyContent: { xs: "center", md: "flex-start" }, alignItems: "center" }}>
								<Button
									variant="outlined"
									size="large"
									startIcon={<Edit />}
									onClick={handleOpenDialog}
									sx={{
										borderRadius: 50,
										px: 5,
										py: 1.8,
										fontWeight: 700,
										fontSize: "1.1rem",
										borderWidth: 2,
										"&:hover": { borderWidth: 2, transform: "translateY(-2px)" },
									}}
								>
									Edit Profile
								</Button>
								<Button
									variant="outlined"
									size="large"
									startIcon={<Lock />}
									onClick={() => setOpenChangePasswordDialog(true)}
									sx={{
										borderRadius: 50,
										px: 5,
										py: 1.8,
										fontWeight: 700,
										fontSize: "1.1rem",
										borderWidth: 2,
										borderColor: "warning.main",
										color: "warning.main",
										"&:hover": { borderWidth: 2, transform: "translateY(-2px)", borderColor: "warning.dark", color: "warning.dark" },
									}}
								>
									Change Password
								</Button>
								{fineDetails && (
									<Button
										variant="contained"
										color="error"
										size="large"
										sx={{
											borderRadius: 50,
											px: 5,
											py: 1.8,
											fontWeight: 700,
											fontSize: "1.1rem",
										}}
										onClick={() => alert("Payment gateway coming soon!")}
									>
										Pay Fine Now
									</Button>
								)}
							</Stack>
						</Card>
					</Box>
				</Box>
			</Box>

			{/* Dialogs */}
			<EditProfileDialog
				open={openDialog}
				onClose={handleCloseDialog}
				onSave={handleProfileUpdate}
				initialData={user}
				isSaving={isSaving}
			/>

			<ChangePasswordDialog
				open={openChangePasswordDialog}
				onClose={() => setOpenChangePasswordDialog(false)}
				onSave={handleChangePassword}
				isSaving={isChangingPassword}
			/>

			<ContactUs open={isContactUsOpen} onClose={() => setContactUsOpen(false)} />
		</>
	);
};

// Detail Row Component
const DetailRow = ({ icon, label, value }) => (
	<Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
		<Box sx={{ color: "var(--primary-color)", width: 36, display: "flex", justifyContent: "center" }}>
			{icon}
		</Box>
		<Box>
			<Typography variant="body2" sx={{ color: "var(--text-secondary-color)", fontWeight: 500 }}>
				{label}
			</Typography>
			<Typography variant="h6" fontWeight={700} sx={{ mt: 0.5, color: "var(--text-color)" }}>
				{value || "—"}
			</Typography>
		</Box>
	</Box>
);

export default ModernUserProfile;