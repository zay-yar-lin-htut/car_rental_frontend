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
} from "@mui/material";

const ContactUs = ({ open, onClose }) => {
	const [formValues, setFormValues] = useState({
		name: "",
		email: "",
		phone: "",
		description: "",
	});

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormValues({
			...formValues,
			[name]: value,
		});
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		// Handle form submission logic here
		console.log("Form Submitted:", formValues);
		alert("Thank you for your message!");
		// Reset form
		setFormValues({ name: "", email: "", phone: "", description: "" });
		onClose();
	};

	const handleCancel = () => {
		// Reset form
		setFormValues({ name: "", email: "", phone: "", description: "" });
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth='lg'
			fullWidth
			PaperProps={{
				sx: {
					backgroundColor: "rgba(255, 255, 255, 0.2)",
					backdropFilter: "blur(10px)",
					boxShadow: "0 8px 32px 0 rgba( 31, 38, 135, 0.37 )",
					border: "1px solid rgba( 255, 255, 255, 0.18 )",
					zIndex: 1000,
				},
			}}>
			<DialogContent sx={{ p: 3 }}>
				<Typography
					variant='h3'
					component='h1'
					sx={{
						typography: { xs: "h4", sm: "h3" },
						color: "white",
					}}
					gutterBottom
					align='center'
					fontWeight='bold'>
					Contact Us
				</Typography>
				<Box
					sx={{
						display: "flex",
						flexDirection: { xs: "column", md: "row" },
						gap: 4,
						alignItems: "center",
						mt: 0,
					}}>
					{/* Left side: Image */}
					<Box
						sx={{
							width: { xs: "100%", md: "50%" },
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							height: "100%",
						}}>
						<Box
							component='img'
							sx={{
								width: 400,
								height: 400,
								borderRadius: "50%",
								objectFit: "cover",
							}}
							alt='Contact us'
							src='https://images.unsplash.com/photo-1596524430615-b46475ddff6e?q=80&w=2070&auto=format&fit=crop' // Placeholder image
						/>
					</Box>

					{/* Right side: Form */}
					<Box sx={{ width: { xs: "100%", md: "50%" } }}>
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
								id='name'
								name='name'
								label='Name'
								value={formValues.name}
								onChange={handleChange}
								InputLabelProps={{
									style: { color: "white" },
								}}
								inputProps={{
									style: { color: "white" },
								}}
								sx={{
									"& label.Mui-focused": {
										color: "white",
									},
									"& .MuiInput-underline:after": {
										borderBottomColor: "white",
									},
									"& .MuiOutlinedInput-root": {
										"& fieldset": {
											borderColor: "white",
										},
										"&:hover fieldset": {
											borderColor: "white",
										},
										"&.Mui-focused fieldset": {
											borderColor: "white",
										},
									},
								}}
							/>
							<TextField
								fullWidth
								required
								id='email'
								name='email'
								label='Email'
								type='email'
								value={formValues.email}
								onChange={handleChange}
								InputLabelProps={{
									style: { color: "white" },
								}}
								inputProps={{
									style: { color: "white" },
								}}
								sx={{
									"& label.Mui-focused": {
										color: "white",
									},
									"& .MuiInput-underline:after": {
										borderBottomColor: "white",
									},
									"& .MuiOutlinedInput-root": {
										"& fieldset": {
											borderColor: "white",
										},
										"&:hover fieldset": {
											borderColor: "white",
										},
										"&.Mui-focused fieldset": {
											borderColor: "white",
										},
									},
								}}
							/>
							<TextField
								fullWidth
								id='phone'
								name='phone'
								label='Phone'
								type='tel'
								value={formValues.phone}
								onChange={handleChange}
								InputLabelProps={{
									style: { color: "white" },
								}}
								inputProps={{
									style: { color: "white" },
								}}
								sx={{
									"& label.Mui-focused": {
										color: "white",
									},
									"& .MuiInput-underline:after": {
										borderBottomColor: "white",
									},
									"& .MuiOutlinedInput-root": {
										"& fieldset": {
											borderColor: "white",
										},
										"&:hover fieldset": {
											borderColor: "white",
										},
										"&.Mui-focused fieldset": {
											borderColor: "white",
										},
									},
								}}
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
								InputLabelProps={{
									style: { color: "white" },
								}}
								inputProps={{
									style: { color: "white" },
								}}
								sx={{
									"& label.Mui-focused": {
										color: "white",
									},
									"& .MuiInput-underline:after": {
										borderBottomColor: "white",
									},
									"& .MuiOutlinedInput-root": {
										"& fieldset": {
											borderColor: "white",
										},
										"&:hover fieldset": {
											borderColor: "white",
										},
										"&.Mui-focused fieldset": {
											borderColor: "white",
										},
									},
								}}
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
						sx={{
							borderColor: "white",
							color: "white",
							"&:hover": {
								backgroundColor: "white",
								color: "black",
							},
						}}>
						Cancel
					</Button>
					<Button
						type='submit'
						variant='contained'
						onClick={handleSubmit}
						sx={{
							backgroundColor: "white",
							color: "black",
							"&:hover": {
								backgroundColor: "white",
								color: "black",
							},
						}}>
						Submit
					</Button>
				</Box>
			</DialogActions>
		</Dialog>
	);
};

export default ContactUs;
