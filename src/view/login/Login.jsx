import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	Box,
	Typography,
	TextField,
	Button,
	Checkbox,
	FormControlLabel,
	Divider,
	Stack,
	Alert,
	Paper,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

// Icons
import GoogleIcon from "@mui/icons-material/Google";

// Assuming these are correctly set up in your project
import { API_ENDPOINTS, AUTH_CONFIG } from "../../services/Configuration";
import { createDataServices } from "../../services/DataServices";
import { useSnackbar } from "../../contexts/ErrorMessage";

const dataServices = createDataServices();

const Login = () => {
	// --- State and Logic (unchanged) ---
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const { showSnackbar } = useSnackbar();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const response = await dataServices.retrievePOST(
				{ email, password },
				API_ENDPOINTS.auth.login
			);
			showSnackbar(response.message, "success");
			AUTH_CONFIG.setToken(response.data.token);
			AUTH_CONFIG.setUserData(response.data.user);
			navigate("/home");
		} catch (err) {
			setError(err.message || "An error occurred during login.");
		} finally {
			setLoading(false);
		}
	};

	// --- Render Logic with Background Video ---
	return (
		<Box
			sx={{
				minHeight: "100vh",
				position: "relative", // Needed for children positioning
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				overflow: "hidden", // Hide anything that might spill out
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
					objectFit: "cover", // Ensures the video covers the screen without distortion
					zIndex: 0, // Puts it at the very back
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
					backgroundColor: "rgba(0, 0, 0, 0.5)",
					zIndex: 1, // Sits on top of the video
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
					maxWidth: 420,
					width: "100%",
					borderRadius: 4,
					position: "relative",
					zIndex: 2, // Sits on top of the overlay
					// The "Frosted Glass" effect
					backgroundColor: "rgba(255, 255, 255, 0.1)",
					backdropFilter: "blur(10px)",
					border: "1px solid rgba(255, 255, 255, 0.2)",
					color: "white",
				}}>
				<Typography
					component='h1'
					variant='h4'
					fontWeight='bold'>
					Sign In
				</Typography>
				<Typography
					variant='body2'
					sx={{ mt: 1, color: "grey.300" }}>
					New here?{" "}
					<Link
						to='/register'
						style={{
							textDecoration: "none",
							color: "#64b5f6",
							fontWeight: 600,
						}}>
						Create an account
					</Link>
				</Typography>

				<Box sx={{ mt: 3, width: "100%" }}>
					{error && (
						<Alert
							severity='error'
							sx={{
								mb: 2,
								bgcolor: "rgba(255, 179, 179, 0.1)",
								color: "white",
								border: "1px solid rgba(255, 128, 128, 0.5)",
							}}>
							{error}
						</Alert>
					)}
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
						onChange={(e) => setEmail(e.target.value)}
						error={!!error}
						sx={customTextFieldStyle}
					/>
					<TextField
						margin='normal'
						required
						fullWidth
						name='password'
						label='Password'
						type='password'
						id='password'
						autoComplete='current-password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						error={!!error}
						sx={customTextFieldStyle}
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
										color: "grey.400",
										"&.Mui-checked": { color: "white" },
									}}
									checked={rememberMe}
									onChange={(e) => setRememberMe(e.target.checked)}
								/>
							}
							label={
								<Typography
									variant='body2'
									sx={{ color: "grey.200" }}>
									Remember me
								</Typography>
							}
						/>
						<Link
							to='/forgot-password'
							style={{ textDecoration: "none" }}>
							<Typography
								variant='body2'
								sx={{
									color: "#64b5f6",
									"&:hover": { textDecoration: "underline" },
								}}>
								Forgot password?
							</Typography>
						</Link>
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
							bgcolor: "rgba(255, 255, 255, 0.9)",
							color: "black",
							"&:hover": { bgcolor: "white" },
							"&.Mui-disabled": { bgcolor: "rgba(255, 255, 255, 0.5)" },
						}}>
						Sign In
					</LoadingButton>
					<Divider
						sx={{
							my: 2,
							"&::before, &::after": {
								borderColor: "rgba(255, 255, 255, 0.3)",
							},
						}}>
						<Typography
							variant='body2'
							sx={{ color: "grey.300" }}>
							OR
						</Typography>
					</Divider>
					<Button
						fullWidth
						variant='outlined'
						startIcon={<GoogleIcon />}
						sx={{
							color: "white",
							borderColor: "rgba(255, 255, 255, 0.5)",
							"&:hover": {
								borderColor: "white",
								bgcolor: "rgba(255, 255, 255, 0.1)",
							},
						}}>
						Sign In with Google
					</Button>
				</Box>
			</Paper>
		</Box>
	);
};

const customTextFieldStyle = {
	"& .MuiInputBase-input": { color: "white" },
	"& .MuiInputLabel-root": { color: "grey.400" },
	"& .MuiInputLabel-root.Mui-focused": { color: "white" },
	"& .MuiOutlinedInput-root": {
		"& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
		"&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
		"&.Mui-focused fieldset": { borderColor: "white" },
	},
};

export default Login;
