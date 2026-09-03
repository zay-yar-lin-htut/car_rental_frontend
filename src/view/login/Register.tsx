import React, { useState, type ChangeEvent, type FormEvent } from "react";
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
	Alert,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Visibility, VisibilityOff } from "@mui/icons-material";

// Assuming these are correctly set up in your project
import { API_ENDPOINTS } from "../../services/Configuration";
import { createDataServices } from "../../services/DataServices";
import { useSnackbar } from "../../contexts/ErrorMessage";
import VideoBackground1 from "../common/Background1";
import type { ApiResponse } from "../../types";

const dataServices = createDataServices();

interface RegisterForm {
	name: string;
	email: string;
	phone: string;
	password: string;
	confirmPassword: string;
	agreeTerms: boolean;
}

const Register = () => {
	// --- State and Logic (Preserved from original) ---
	const [form, setForm] = useState<RegisterForm>({
		name: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
		agreeTerms: false,
	});
	const [showPassword, setShowPassword] = useState<{ password: boolean; confirmPassword: boolean }>({
		password: false,
		confirmPassword: false,
	});
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string | null | undefined>>({});
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const { showSnackbar } = useSnackbar();

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}) as RegisterForm);
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: null }));
		}
		setError("");
	};

	const togglePasswordVisibility = (field: "password" | "confirmPassword") => {
		setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
	};

	const validateForm = () => {
		const newErrors: Record<string, string | undefined> = {};
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
		if (!form.confirmPassword) newErrors.confirmPassword = "Confirm Password is required";
		else if (form.password !== form.confirmPassword)
			newErrors.confirmPassword = "Passwords do not match";
		if (!form.agreeTerms)
			newErrors.agreeTerms = "You must agree to the terms and conditions";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;
		setLoading(true);
		try {
			const response = (await dataServices.Register(
				{
					name: form.name,
					email: form.email,
					phone: form.phone,
					password: form.password,
					password_confirmation: form.confirmPassword,
				},
				API_ENDPOINTS.auth.register
			)) as ApiResponse<unknown>;
			if (!response.success) {
				setError(response.message || "Registration failed");
				return;
			}
			showSnackbar(response.message || "Registration successful", "success");
			navigate("/login");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Registration failed");
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
			<VideoBackground1 videoSrc="/bg-2.mp4" />

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
				elevation={3}
				sx={{
					p: { xs: 3, sm: 4 },
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					maxWidth: 450,
					width: "100%",
					borderRadius: 2,
					position: "relative",
					zIndex: 2,
					backgroundColor: "var(--background-paper)",
					color: "var(--text-color)",
				}}>
				<Typography
					component='h1'
					variant='h4'
					fontWeight='bold'>
					Create Account
				</Typography>
				<Typography
					variant='body2'
					sx={{ mt: 1, color: "var(--text-secondary-color)" }}>
					Already have an account?{" "}
					<Link
						to='/login'
						style={{
							textDecoration: "none",
							color: "var(--primary-color)",
							fontWeight: 600,
						}}>
						Sign In
					</Link>
				</Typography>

				<Stack
					spacing={2}
					sx={{ mt: 3, width: "100%" }}>
					{error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
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
										sx={{ color: "var(--text-secondary-color)" }}>
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
										sx={{ color: "var(--text-secondary-color)" }}>
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
										color: "var(--text-secondary-color)",
										"&.Mui-checked": { color: "var(--primary-color)" },
									}}
								/>
							}
							label={
								<Typography
									variant='body2'
									sx={{ color: "var(--text-secondary-color)" }}>
									I agree to the{" "}
									<Typography
										component="span"
										sx={{
											color: "var(--primary-color)",
											textDecoration: "underline",
											cursor: "default"
										}}>
										Terms and Conditions
									</Typography>
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
							bgcolor: "var(--primary-color)",
							color: "var(--primary-contrast-text)",
							"&:hover": { bgcolor: "var(--primary-color)" },
							"&.Mui-disabled": { bgcolor: "rgba(0, 0, 0, 0.12)" },
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
	"& .MuiInputBase-input": { color: "var(--text-color)" },
	"& .MuiInputLabel-root": { color: "var(--text-secondary-color)" },
	"& .MuiInputLabel-root.Mui-focused": { color: "var(--primary-color)" },
	"& .MuiFormHelperText-root": { color: "var(--error-color)" },
	"& .MuiOutlinedInput-root": {
		"& fieldset": { borderColor: "var(--divider-color)" },
		"&:hover fieldset": { borderColor: "var(--primary-color)" },
		"&.Mui-focused fieldset": { borderColor: "var(--primary-color)" },
		"&.Mui-error fieldset": { borderColor: "var(--error-color)" },
	},
};

export default Register;
