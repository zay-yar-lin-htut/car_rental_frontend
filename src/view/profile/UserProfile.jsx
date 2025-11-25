import React, { useState, useEffect, useCallback, useRef } from "react";
import {
	Box,
	Typography,
	Link,
	Stack,
	Card,
	CardMedia,
	Button,
	IconButton,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Alert,
} from "@mui/material";
import {
	Facebook,
	Instagram,
	Twitter,
	Edit,
	ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "./useUserProfile";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const formFields = [
	{ name: "name", label: "Full Name", type: "text", required: true },
	{ name: "email", label: "Email Address", type: "email", required: true },
	{ name: "phone", label: "Phone Number", type: "tel" },
	{ name: "image", label: "Avatar", type: "file" },
	{ name: "address", label: "Location", type: "text" },
];

const EditProfileDialog = ({
	open,
	onClose,
	onSave,
	initialData,
	isSaving,
}) => {
	const [formData, setFormData] = useState({});
	const [selectedFile, setSelectedFile] = useState(null);
	const [previewImage, setPreviewImage] = useState(null);
	const [error, setError] = useState("");
	const imageRef = useRef(null);

	useEffect(() => {
		if (open) {
			setFormData(initialData || {});
			setSelectedFile(null);
			setPreviewImage(initialData?.profile_image_url || null);
			setError("");
		}
	}, [open, initialData]);

	useEffect(() => {
		let st; // To hold the ScrollTrigger instance

		if (open && previewImage && imageRef.current) {
			// A more subtle and smooth parallax zoom effect
			st = gsap.fromTo(
				imageRef.current,
				{
					scale: 1.15, // Start slightly zoomed in
				},
				{
					scale: 1, // End at normal size
					ease: "none", // Linear ease is best for scrub
					scrollTrigger: {
						trigger: imageRef.current,
						scroller: ".MuiDialogContent-root",
						// Start when the image top enters the viewport, end when it's centered
						start: "top bottom",
						end: "center center",
						scrub: 1, // Makes the animation smoother than scrub: true
					},
				}
			).scrollTrigger; // Get the scrollTrigger instance from the animation
		}

		// Cleanup ScrollTrigger on effect cleanup
		return () => {
			st?.kill();
		};
	}, [open, previewImage]);

	const handleClose = useCallback(() => {
		if (isSaving) return;
		// Clean up blob URL if dialog is closed without saving
		if (previewImage && previewImage.startsWith("blob:")) {
			URL.revokeObjectURL(previewImage);
		}
		onClose();
	}, [isSaving, onClose, previewImage]);

	const handleInputChange = (e) => {
		if (e.target.type === "file") {
			const file = e.target.files[0];
			setSelectedFile(file);
			if (previewImage && previewImage.startsWith("blob:")) {
				URL.revokeObjectURL(previewImage);
			}
			if (file) {
				setPreviewImage(URL.createObjectURL(file));
			} else {
				setPreviewImage(initialData?.profile_image_url);
			}
		} else {
			const { name, value } = e.target;
			setFormData((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleSave = async () => {
		console.log("formData", formData);

		if (!formData.name || !formData.email) {
			setError("Name and Email are required fields.");
			return;
		}
		setError("");
		try {
			await onSave({ formData, selectedFile });
		} catch (err) {
			// Display the error from the API call inside the dialog
			setError(
				err.message || "An unexpected error occurred. Please try again."
			);
		}
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth='sm'
			fullWidth
			PaperProps={{
				sx: {
					backgroundColor: "rgba(255, 255, 255, 0.2)",
					backdropFilter: "blur(10px)",
					boxShadow: "0 8px 32px 0 rgba( 31, 38, 135, 0.37 )",
					border: "1px solid rgba( 255, 255, 255, 0.18 )",
				},
			}}>
			<DialogTitle sx={{ fontWeight: "bold" }}>Edit Your Profile</DialogTitle>
			<DialogContent
				sx={{
					maxHeight: "70vh", // Ensure dialog is scrollable
					overflowY: "auto",
				}}>
				{error && (
					<Alert
						severity='error'
						sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}
				{previewImage && (
					<Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
						<CardMedia
							ref={imageRef}
							component='img'
							image={previewImage}
							alt='Profile Preview'
							sx={{
								width: 250,
								height: 250,
								borderRadius: 4,
								objectFit: "cover",
								border: "3px solid",
								borderColor: "var(--divider-color)",
							}}
						/>
					</Box>
				)}
				<Box
					component='form'
					noValidate
					autoComplete='off'
					sx={{ pt: 1 }}>
					{formFields.map((field) => (
						<TextField
							key={field.name}
							margin='dense'
							fullWidth
							id={field.name}
							name={field.name}
							label={field.label}
							type={field.type === "file" ? "file" : field.type}
							value={
								field.type !== "file" ? formData[field.name] || "" : undefined
							}
							onChange={handleInputChange}
							required={field.required}
							disabled={isSaving}
							InputLabelProps={field.type === "file" ? { shrink: true } : {}}
						/>
					))}
				</Box>
			</DialogContent>
			<DialogActions sx={{ p: "16px 24px" }}>
				<Button
					onClick={handleClose}
					disabled={isSaving}
					color='inherit'>
					Cancel
				</Button>
				<Button
					onClick={handleSave}
					variant='contained'
					disabled={isSaving}>
					{isSaving ? (
						<CircularProgress
							size={24}
							color='inherit'
						/>
					) : (
						"Save Changes"
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

// --- Animation Keyframes ---
const slideInLeft = {
	"@keyframes slideInLeft": {
		"0%": { transform: "translateX(-100%)", opacity: 0 },
		"100%": { transform: "translateX(0)", opacity: 1 },
	},
	animation: "slideInLeft 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
};

const slideInRight = {
	"@keyframes slideInRight": {
		"0%": { transform: "translateX(100%)", opacity: 0 },
		"100%": { transform: "translateX(0)", opacity: 1 },
	},
	animation: "slideInRight 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
};

const popIn = {
	"@keyframes popIn": {
		"0%": { transform: "translate(-50%, -50%) scale(0.8)", opacity: 0 },
		"100%": { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
	},
	animation: "popIn 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55) 0.3s forwards",
};

const fadeIn = {
	"@keyframes fadeIn": { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
	animation: "fadeIn 0.8s ease-out 0.6s forwards",
};

const ModernUserProfile = () => {
	const {
		user,
		profileLoading,
		openDialog,
		isSaving,
		navigate,
		handleOpenDialog,
		handleCloseDialog,
		handleProfileUpdate,
		fineDetails,
	} = useUserProfile();

	if (profileLoading) {
		return (
			<Box
				sx={{
					display: "flex",
					minHeight: "100vh",
					alignItems: "center",
					justifyContent: "center",
				}}>
				<CircularProgress />
			</Box>
		);
	}

	if (!user) {
		return (
			<Box
				sx={{
					display: "flex",
					minHeight: "100vh",
					alignItems: "center",
					justifyContent: "center",
					flexDirection: "column",
					gap: 2,
				}}>
				<Typography>Could not load profile.</Typography>
				<Button
					variant='contained'
					onClick={() => navigate("/login")}>
					Go to Login
				</Button>
			</Box>
		);
	}

	return (
		<>
			<Box
				sx={{
					display: "flex",
					minHeight: "100vh",
					fontFamily: "sans-serif",
					position: "relative",
					overflow: "hidden",
					flexDirection: { xs: "column", md: "row" },
				}}>
				{/* ===== Left Black Pane (UPDATED) ===== */}
				<Box
					sx={{
						...slideInLeft,
						flexGrow: 1,
						flexBasis: { xs: "auto", md: "30%" },
						bgcolor: "var(--background-color)",
						color: "var(--text-color)",
						display: { md: "flex", xs: "none" },
						flexDirection: "column",
						justifyContent: "space-between",
						p: { xs: 3, md: 6 },
						minHeight: { xs: "auto", md: "auto" },
						textAlign: { xs: "center", md: "left" },
						transition: "flex-basis 0.5s ease",
					}}>
					<Stack
						direction='row'
						alignItems='center'
						spacing={3}
						justifyContent={{ xs: "center", md: "flex-start" }}
						sx={{ display: { xs: "none", md: "flex" } }}>
						{" "}
						{/* Hide on small screens */}
						<Button
							variant='text'
							startIcon={<ArrowBackIcon />}
							onClick={() => navigate("/")}
							sx={{
								color: "var(--text-color)",
								textTransform: "none",
								fontSize: "1rem",
								"&:hover": {
									backgroundColor: "rgba(255, 255, 255, 0.08)",
								},
							}}>
							Home
						</Button>
					</Stack>
				</Box>

				{/* ===== Right White Pane (UPDATED) ===== */}
				<Box
					sx={{
						...slideInRight,
						flexGrow: 1,
						flexBasis: { xs: "auto", md: "70%" },
						bgcolor: "white ",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						p: { xs: 3, md: 6 },
						pt: { xs: "18rem", sm: "18rem", md: 6 }, // Adjusted padding for mobile
						transition: "flex-basis 0.5s ease",
					}}>
					{/* Back Button for mobile */}
					<Button
						variant='text'
						startIcon={<ArrowBackIcon />}
						onClick={() => navigate("/")}
						sx={{
							color: "var(--text-color)",
							textTransform: "none",
							fontSize: "1rem",
							position: "fixed",
							top: 16,
							left: 16,
							zIndex: 11,
							display: { xs: "flex", md: "none" },
						}}>
						Home
					</Button>

					<Box
						sx={{ maxWidth: 450, ...fadeIn, opacity: 0 }}
						style={{ animationDelay: "0.6s" }}>
						<Typography
							variant='h2'
							component='h1'
							fontWeight={900}
							sx={{
								mb: 2,
								lineHeight: 1.1,
								color: "var(--primary-contrast-text)",
							}}>
							{user.name}
						</Typography>

						<Stack
							spacing={5}
							sx={{ my: 10, color: "var(--primary-contrast-text)" }}>
							<DetailRow
								label='Email'
								value={user.email}
							/>
							<DetailRow
								label='Phone'
								value={user.phone}
							/>
							<DetailRow
								label='Location'
								value={user.address}
							/>
							{fineDetails && (
								<DetailRow
									label='Fine'
									value={`$${fineDetails["Total Fine"]}`}
								/>
							)}
						</Stack>
						<Box>
							<Button
								variant='outlined'
								startIcon={<Edit />}
								onClick={handleOpenDialog}
								sx={{
									color: "var(--primary-contrast-text)",
									borderColor: "var(--divider-color)",
									borderRadius: "50px",
									px: 3,
									py: 1,
									"&:hover": {
										bgcolor: "rgba(255, 255, 255, 0.1)",
										borderColor: "var(--text-color)",
									},
								}}>
								Edit Profile
							</Button>
							{fineDetails && (
								<Button
									variant='contained'
									color='error'
									sx={{ ml: 2 }}
									onClick={() => {
										alert("Pay now functionality is not implemented yet.");
									}}>
									Pay Now
								</Button>
							)}
						</Box>
					</Box>
				</Box>

				{/* ===== Central Floating Avatar (UPDATED) ===== */}
				<Card
					sx={{
						...popIn,
						position: "absolute",
						top: { xs: "22vh", sm: "20vh", md: "50%" }, // Adjusted top position
						left: { xs: "50%", md: "30%" },
						transform: "translate(-50%, -50%)",
						width: { xs: 180, sm: 220, md: 320 },
						height: { xs: 200, sm: 280, md: 450 },
						borderRadius: 2,
						boxShadow: {
							md: "0 20px 50px rgba(0,0,0,0.25)",
							xs: "0 10px 20px rgba(0,0,0,2)",
						},
						overflow: "hidden",
						zIndex: 10,
					}}>
					<CardMedia
						component='img'
						image={user.profile_image_url}
						alt={user.name}
						sx={{
							width: "100%",
							height: "100%",
							objectFit: "cover",
							objectPosition: "center",
							transition: "transform 0.3s ease",
							"&:hover": { transform: "scale(1.1)" },
						}}
					/>
				</Card>
			</Box>

			<EditProfileDialog
				open={openDialog}
				onClose={handleCloseDialog}
				onSave={handleProfileUpdate}
				initialData={user}
				isSaving={isSaving}
			/>
		</>
	);
};

// --- Helper sub-components (no changes needed) ---
const DetailRow = ({ label, value }) => (
	<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
		<Typography
			variant='subtitle2'
			sx={{ width: 80, color: "text.secondary" }}>
			{label}
		</Typography>
		<Typography
			variant='body1'
			fontWeight={500}>
			{value}
		</Typography>
	</Box>
);

export default ModernUserProfile;
