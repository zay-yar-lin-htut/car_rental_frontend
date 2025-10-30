import { useState, useEffect, useCallback, useRef } from "react";
import {
	Box,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Button,
	CircularProgress,
	Alert,
	CardMedia,
} from "@mui/material";
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

export const EditProfileDialog = ({
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
					bgcolor: "var(--background-paper)",
					color: "var(--text-color)"
				}
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
