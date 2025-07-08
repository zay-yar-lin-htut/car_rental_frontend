import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	Box,
	Typography,
	TextField,
	Button,
	Checkbox,
	FormControlLabel,
	Stack,
	Paper,
	IconButton,
	InputAdornment,
	FormControl,
	FormHelperText,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Visibility, VisibilityOff } from "@mui/icons-material";

// Assuming these are correctly set up in your project
import { API_ENDPOINTS } from "../../services/Configuration";
import { createDataServices } from "../../services/DataServices";
import { useSnackbar } from "../../contexts/ErrorMessage";

const dataServices = createDataServices();

const Register = () => {
	// --- State and Logic (Preserved from original) ---
	const [form, setForm] = useState({
		name: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
		agreeTerms: false,
	});
	const [showPassword, setShowPassword] = useState({
		password: false,
		confirmPassword: false,
	});
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});
	const navigate = useNavigate();
	const { showSnackbar } = useSnackbar();

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: null }));
		}
	};

	const togglePasswordVisibility = (field) => {
		setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
	};

	const validateForm = () => {
		const newErrors = {};
		if (!form.name.trim()) newErrors.name = "Name is required";
		if (!form.email.trim()) newErrors.email = "Email is required";
		else if (!/\S+@\S+\.\S+/.test(form.email))
			newErrors.email = "Invalid email address";
		if (!form.phone.trim()) newErrors.phone = "Phone number is required";
		else if (!/^\+?\d{10,15}$/.test(form.phone.replace(/\s/g, "")))
			newErrors.phone = "Invalid phone number";
		if (!form.password) newErrors.password = "Password is required";
		else if (form.password.length < 8)
			newErrors.password = "Password must be at least 8 characters";
		if (form.password !== form.confirmPassword)
			newErrors.confirmPassword = "Passwords do not match";
		if (!form.agreeTerms)
			newErrors.agreeTerms = "You must agree to the terms and conditions";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;
		setLoading(true);
		try {
			await dataServices
				.Register(
					{
						name: form.name,
						email: form.email,
						phone: form.phone,
						password: form.password,
						password_confirmation: form.confirmPassword,
					},
					API_ENDPOINTS.auth.register
				)
				.then((response) => {
					showSnackbar(response.message, "success");
					navigate("/login");
				})
				.catch((error) => {
					showSnackbar(error.message, "error");
				});
		} catch (err) {
			showSnackbar(err.message || "Registration failed", "error");
		}
		setLoading(false);
	};

	// --- Render Logic with Background Video ---
	return (
		<Box
			sx={{
				minHeight: "100vh",
				position: "relative",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				overflow: "hidden",
				p: 2,
			}}>
			{/* Background Video Element */}
			<Box
				component='video'
				autoPlay
				loop
				muted
				playsInline
				sx={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					objectFit: "cover",
					zIndex: 0,
				}}>
				{/* IMPORTANT: Your video file must be in the `public` folder */}
				<source
					src='/background/bg-1.mp4'
					type='video/mp4'
				/>
				Your browser does not support the video tag.
			</Box>

			{/* Dark overlay for better readability */}
			<Box
				sx={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					backgroundColor: "rgba(0, 0, 0, 0.6)",
					zIndex: 1,
				}}
			/>

			<Paper
				component='form'
				noValidate
				onSubmit={handleSubmit}
				elevation={12}
				sx={{
					p: { xs: 3, sm: 4 },
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					maxWidth: 450,
					width: "100%",
					borderRadius: 4,
					position: "relative",
					zIndex: 2, // Sits on top of the overlay
					backgroundColor: "rgba(255, 255, 255, 0.1)",
					backdropFilter: "blur(10px)",
					border: "1px solid rgba(255, 255, 255, 0.2)",
					color: "white",
				}}>
				<Typography
					component='h1'
					variant='h4'
					fontWeight='bold'>
					Create Account
				</Typography>
				<Typography
					variant='body2'
					sx={{ mt: 1, color: "grey.300" }}>
					Already have an account?{" "}
					<Link
						to='/login'
						style={{
							textDecoration: "none",
							color: "#64b5f6",
							fontWeight: 600,
						}}>
						Sign In
					</Link>
				</Typography>

				<Stack
					spacing={2}
					sx={{ mt: 3, width: "100%" }}>
					<TextField
						fullWidth
						required
						label='Full Name'
						name='name'
						value={form.name}
						onChange={handleChange}
						error={!!errors.name}
						helperText={errors.name}
						sx={customTextFieldStyle}
					/>
					<TextField
						fullWidth
						required
						label='Email Address'
						name='email'
						value={form.email}
						onChange={handleChange}
						error={!!errors.email}
						helperText={errors.email}
						sx={customTextFieldStyle}
					/>
					<TextField
						fullWidth
						required
						label='Phone Number'
						name='phone'
						value={form.phone}
						onChange={handleChange}
						error={!!errors.phone}
						helperText={errors.phone}
						sx={customTextFieldStyle}
					/>
					<TextField
						fullWidth
						required
						label='Password'
						name='password'
						type={showPassword.password ? "text" : "password"}
						value={form.password}
						onChange={handleChange}
						error={!!errors.password}
						helperText={errors.password}
						sx={customTextFieldStyle}
						InputProps={{
							endAdornment: (
								<InputAdornment position='end'>
									<IconButton
										onClick={() => togglePasswordVisibility("password")}
										edge='end'
										sx={{ color: "grey.400" }}>
										{showPassword.password ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
					<TextField
						fullWidth
						required
						label='Confirm Password'
						name='confirmPassword'
						type={showPassword.confirmPassword ? "text" : "password"}
						value={form.confirmPassword}
						onChange={handleChange}
						error={!!errors.confirmPassword}
						helperText={errors.confirmPassword}
						sx={customTextFieldStyle}
						InputProps={{
							endAdornment: (
								<InputAdornment position='end'>
									<IconButton
										onClick={() => togglePasswordVisibility("confirmPassword")}
										edge='end'
										sx={{ color: "grey.400" }}>
										{showPassword.confirmPassword ? (
											<VisibilityOff />
										) : (
											<Visibility />
										)}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
					<FormControl error={!!errors.agreeTerms}>
						<FormControlLabel
							control={
								<Checkbox
									name='agreeTerms'
									checked={form.agreeTerms}
									onChange={handleChange}
									sx={{
										color: "grey.400",
										"&.Mui-checked": { color: "white" },
									}}
								/>
							}
							label={
								<Typography
									variant='body2'
									sx={{ color: "grey.200" }}>
									I agree to the{" "}
									<Link
										to='/terms'
										style={{ color: "#64b5f6" }}>
										Terms and Conditions
									</Link>
								</Typography>
							}
						/>
						{errors.agreeTerms && (
							<FormHelperText sx={{ ml: "14px" }}>
								{errors.agreeTerms}
							</FormHelperText>
						)}
					</FormControl>
					<LoadingButton
						type='submit'
						fullWidth
						variant='contained'
						loading={loading}
						sx={{
							py: 1.5,
							mt: 1,
							fontSize: "1rem",
							fontWeight: "bold",
							bgcolor: "rgba(255, 255, 255, 0.9)",
							color: "black",
							"&:hover": { bgcolor: "white" },
							"&.Mui-disabled": { bgcolor: "rgba(255, 255, 255, 0.5)" },
						}}>
						Register
					</LoadingButton>
				</Stack>
			</Paper>
		</Box>
	);
};

// Custom style object for TextFields to keep code clean and consistent
const customTextFieldStyle = {
	"& .MuiInputBase-input": { color: "white" },
	"& .MuiInputLabel-root": { color: "grey.400" },
	"& .MuiInputLabel-root.Mui-focused": { color: "white" },
	"& .MuiFormHelperText-root": { color: "#ff8a80" },
	"& .MuiOutlinedInput-root": {
		"& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
		"&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
		"&.Mui-focused fieldset": { borderColor: "white" },
		"&.Mui-error fieldset": { borderColor: "#e57373" },
	},
};

export default Register;
