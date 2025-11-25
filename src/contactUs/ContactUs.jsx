import React, { useState } from "react";
import {
	Box,
	Paper,
	Typography,
	TextField,
	Button,
	Dialog,
	DialogContent,
	DialogActions,
	DialogTitle,
	CircularProgress, // Import CircularProgress
} from "@mui/material";
import { createDataServices } from "../services/DataServices";
import { API_ENDPOINTS } from "../services/Configuration";
import { useSnackbar } from "../contexts/ErrorMessage"; // Import useSnackbar

const ContactUs = ({ open, onClose }) => {
	const dataServices = createDataServices();
	const { showSnackbar } = useSnackbar(); // Use the snackbar hook
	const [formValues, setFormValues] = useState({
		title: "",
		email: "",
		phone: "",
		description: "",
	});
	const [loading, setLoading] = useState(false); // Add loading state

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormValues({
			...formValues,
			[name]: value,
		});
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setLoading(true); // Set loading to true on submission
		try {
			const res = await dataServices.retrievePOST(
				formValues,
				API_ENDPOINTS.auth.contact
			);
			console.log(res);
			showSnackbar("Message sent successfully!", "success"); // Show success message
			// Reset form
			setFormValues({ title: "", email: "", phone: "", description: "" });
			onClose();
		} catch (error) {
			showSnackbar(error.message || "Failed to send message.", "error"); // Show error message
		} finally {
			setLoading(false); // Set loading to false after submission
		}
	};

	const handleCancel = () => {
		// Reset form
		setFormValues({ title: "", email: "", phone: "", description: "" });
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth='sm'
			fullWidth
			PaperProps={{
				sx: {
					backgroundColor: "var(--background-paper)",
					zIndex: 1000,
				},
			}}>
			<DialogContent sx={{ p: 3 }}>
				<Typography
					variant='h3'
					component='h1'
					sx={{
						typography: { xs: "h4", sm: "h3" },
						color: "var(--text-color)",
					}}
					gutterBottom
					align='center'
					fontWeight='bold'>
					Contact Us
				</Typography>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column", // Changed to column as there's only one section
						gap: 3, // Adjusted gap
						alignItems: "center",
						mt: 0,
					}}>
					{/* Form section now takes full width */}
					<Box sx={{ width: "100%" }}>
						<Box
							component='form'
							onSubmit={handleSubmit}
							noValidate
							sx={{
								display: "flex",
								flexDirection: "column",
								gap: 3,
								height: "100%",
							}}>
							<TextField
								fullWidth
								required
								id='email'
								name='email'
								label='Email'
								type='email'
								value={formValues.email}
								onChange={handleChange}
								disabled={loading} // Disable field during loading
							/>
							<TextField
								fullWidth
								id='phone'
								name='phone'
								label='Phone'
								type='tel'
								value={formValues.phone}
								onChange={handleChange}
								disabled={loading} // Disable field during loading
							/>
							<TextField
								fullWidth
								required
								id='title'
								name='title'
								label='Title'
								value={formValues.title}
								onChange={handleChange}
								disabled={loading} // Disable field during loading
							/>
							<TextField
								fullWidth
								required
								id='description'
								name='description'
								label='Description'
								multiline
								rows={4}
								value={formValues.description}
								onChange={handleChange}
								disabled={loading} // Disable field during loading
							/>{" "}
							<Box sx={{ flexGrow: 1 }} /> {/* Spacer */}
						</Box>
					</Box>
				</Box>
			</DialogContent>
			<DialogActions sx={{ p: 3 }}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						gap: 2,
						mt: 0,
						width: "100%",
					}}>
					<Button
						variant='outlined'
						onClick={handleCancel}
						disabled={loading} // Disable button during loading
						>
						Cancel
					</Button>
					<Button
						type='submit'
						variant='contained'
						onClick={handleSubmit}
						disabled={loading} // Disable button during loading
						startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null} // Show loading indicator
						>
						Submit
					</Button>
				</Box>
			</DialogActions>
		</Dialog>
	);
};

export default ContactUs;
