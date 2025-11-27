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
	Alert,
	Paper,
	InputAdornment,
	IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

// Assuming these are correctly set up in your project
import { API_ENDPOINTS, AUTH_CONFIG } from "../../services/Configuration";
import { createDataServices } from "../../services/DataServices";
import { useSnackbar } from "../../contexts/ErrorMessage";
import VideoBackground1 from "../common/Background1";
import { useUserRole } from "../../contexts/userRoleContext";
import ConfirmDialog from "../../common/ConfirmDialog";

const dataServices = createDataServices();

const Login = () => {
	// --- State and Logic (unchanged) ---
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});
	const [forgotDialogOpen, setForgotDialogOpen] = useState(false);
	const navigate = useNavigate();
	const { showSnackbar } = useSnackbar();
	const { updateRole } = useUserRole();

 	const validateForm = () => {
		const newErrors = {};
		if (!email.trim()) newErrors.email = "Email is required";
		else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email address";
		if (!password.trim()) newErrors.password = "Password is required";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChange = (field) => (e) => {
		const value = e.target.value;
		if (field === 'email') setEmail(value);
		if (field === 'password') setPassword(value);
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: null }));
		}
	};

	const handleForgotPassword = () => {
		setForgotDialogOpen(true);
	};

	const handleForgotOk = () => {
		setForgotDialogOpen(false);
		navigate('/?contact=true');
	};

	const handleForgotCancel = () => {
		setForgotDialogOpen(false);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;
		setLoading(true);
		try {
			const response = await dataServices.retrievePOST(
				{ email, password },
				API_ENDPOINTS.auth.login
			);
			if (!response.success) {
				showSnackbar(response.message, "error");
				return;
			}
			showSnackbar(response.message, "success");
			AUTH_CONFIG.setToken(response.data.token, rememberMe);
			AUTH_CONFIG.setUserData(response.data.user, rememberMe);

			// Explicitly update the role in the context before navigating
			updateRole(response.data.user);

			if (response.data.user.user_type_id === 3) {
				navigate("/admin/dashboard");
			} else if (response.data.user.user_type_id === 2) {
				navigate("/admin/task-management");
			} else {
				navigate("/");
			}
		} catch (err) {
			showSnackbar(err.message || "An error occurred during login.", "error");
		} finally {
			setLoading(false);
		}
	};

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
			<VideoBackground1 videoSrc='/bg-2.mp4' />

			<Box
				sx={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					backgroundColor: "rgba(0, 0, 0, 0.5)",
					zIndex: 1, // Sits on top of the video
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
					maxWidth: 420,
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
					Sign In
				</Typography>
				<Typography
					variant='body2'
					sx={{ mt: 1, color: "var(--text-secondary-color)" }}>
					New here?{" "}
					<Link
						to='/register'
						style={{
							textDecoration: "none",
							color: "var(--primary-color)",
							fontWeight: 600,
						}}>
						Create an account
					</Link>
				</Typography>

				<Box sx={{ mt: 3, width: "100%" }}>

					<TextField
						margin='normal'
						required
						fullWidth
						id='email'
						label='Email Address'
						name='email'
						autoComplete='email'
						autoFocus
						value={email}
						onChange={handleChange('email')}
						error={!!errors.email}
						helperText={errors.email}
						sx={customTextFieldStyle}
					/>
					<TextField
						margin='normal'
						required
						fullWidth
						name='password'
						label='Password'
						type={showPassword ? "text" : "password"}
						id='password'
						autoComplete='current-password'
						value={password}
						onChange={handleChange('password')}
						error={!!errors.password}
						helperText={errors.password}
						sx={customTextFieldStyle}
						InputProps={{
							endAdornment: (
								<InputAdornment position='end'>
									<IconButton
										aria-label='toggle password visibility'
										onClick={() => setShowPassword(!showPassword)}
										onMouseDown={(e) => e.preventDefault()}
										edge='end'>
										{showPassword ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
					<Stack
						direction='row'
						justifyContent='space-between'
						alignItems='center'
						sx={{ my: 1 }}>
						<FormControlLabel
							control={
								<Checkbox
									value='remember'
									sx={{
										color: "var(--text-secondary-color)",
										"&.Mui-checked": { color: "var(--primary-color)" },
									}}
									checked={rememberMe}
									onChange={(e) => setRememberMe(e.target.checked)}
								/>
							}
							label={
								<Typography
									variant='body2'
									sx={{ color: "var(--text-secondary-color)" }}>
									Remember me
								</Typography>
							}
						/>
						<Typography
							variant='body2'
							sx={{
								color: "var(--primary-color)",
								cursor: "pointer",
								"&:hover": { textDecoration: "underline" },
							}}
							onClick={handleForgotPassword}>
							Forgot password?
						</Typography>
					</Stack>
					<LoadingButton
						type='submit'
						fullWidth
						variant='contained'
						loading={loading}
						sx={{
							py: 1.5,
							mt: 2,
							mb: 2,
							fontSize: "1rem",
							fontWeight: "bold",
							bgcolor: "var(--primary-color)",
							color: "var(--primary-contrast-text)",
							"&:hover": { bgcolor: "var(--primary-color)" },
							"&.Mui-disabled": { bgcolor: "rgba(0, 0, 0, 0.12)" },
						}}>
						Sign In
					</LoadingButton>
				</Box>
			</Paper>

			<ConfirmDialog
				open={forgotDialogOpen}
				onClose={handleForgotCancel}
				onConfirm={handleForgotOk}
				title="Forgot Password"
				message="If you forget your password, to reset your account password, contact the admin."
				confirmText="OK"
				cancelText="Cancel"
			/>
		</Box>
	);
};

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

export default Login;
