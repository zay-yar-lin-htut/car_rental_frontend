import { useState } from "react";
import {
	Box,
	Typography,
	Link,
	Stack,
	Card,
	CardMedia,
	Button,
	IconButton,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	CircularProgress,
	Alert,
} from "@mui/material";
import { Facebook, Instagram, Twitter, Edit } from "@mui/icons-material";
import { useNavigate } from "react-router";

// --- Configuration for the editable form fields ---
const formFields = [
	{ name: "name", label: "Full Name", type: "text", required: true },
	{ name: "username", label: "Username", type: "text", required: true },
	{ name: "email", label: "Email Address", type: "email", required: true },
	{ name: "phone", label: "Phone Number", type: "tel" },
	{ name: "avatar", label: "Avatar URL", type: "url" },
	{ name: "bio", label: "Bio", type: "text", multiline: true, rows: 4 },
	{ name: "location", label: "Location", type: "text" },
];

const ModernUserProfile = () => {
	const navigate = useNavigate();
	// --- STATE MANAGEMENT ---
	const [user, setUser] = useState({
		name: "Alexandra Chen",
		username: "alexchen",
		email: "alex.chen@example.com",
		phone: "555-010-9876",
		avatar:
			"https://images.unsplash.com/photo-1521119989659-a83eee488004?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
		bio: "Lead product designer with a passion for creating human-centered digital experiences. Believer in the power of simplicity and thoughtful design to solve complex problems.",
		location: "San Francisco, CA",
		joinedDate: "March 2021",
	});

	const [openDialog, setOpenDialog] = useState(false);
	const [formData, setFormData] = useState({});
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	// --- DIALOG & FORM LOGIC ---
	const handleOpenDialog = () => {
		setFormData(user);
		setError("");
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		if (isLoading) return;
		setOpenDialog(false);
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		setError("");

		if (!formData.name || !formData.username || !formData.email) {
			setError("Name, Username, and Email are required fields.");
			setIsLoading(false);
			return;
		}

		try {
			await new Promise((resolve) => setTimeout(resolve, 1200));
			setUser({ ...user, ...formData });
			handleCloseDialog();
		} catch (err) {
			setError("Failed to update profile. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	// --- RENDER LOGIC ---
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
						flexGrow: 1,
						flexBasis: { xs: "auto", md: "40%" }, // UPDATED from flex: 1
						bgcolor: "#111",
						color: "common.white",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
						p: { xs: 3, md: 6 },
						minHeight: { xs: "auto", md: "auto" },
						textAlign: { xs: "center", md: "left" },
						transition: "flex-basis 0.5s ease", // Added for smooth transition
					}}>
					<Typography
						variant='h4'
						component='h2'
						fontWeight={600}
						letterSpacing={2}
						sx={{ cursor: "pointer" }}
						onClick={() => navigate("/")}>
						PROFILE
					</Typography>
					<Stack
						direction='row'
						spacing={3}
						justifyContent={{ xs: "center", md: "flex-start" }}>
						<Link
							href='#'
							sx={{
								color: "text.secondary",
								textDecoration: "none",
								"&:hover": { color: "common.white" },
							}}>
							Settings
						</Link>
						<Link
							href='#'
							sx={{
								color: "text.secondary",
								textDecoration: "none",
								"&:hover": { color: "common.white" },
							}}>
							Help
						</Link>
					</Stack>
				</Box>

				{/* ===== Right White Pane (UPDATED) ===== */}
				<Box
					sx={{
						flexGrow: 1,
						flexBasis: { xs: "auto", md: "60%" }, // UPDATED from flex: 1
						bgcolor: "common.white",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						p: { xs: 3, md: 6 },
						pt: { xs: 15, md: 6 },
						transition: "flex-basis 0.5s ease", // Added for smooth transition
					}}>
					<Box sx={{ maxWidth: 450 }}>
						<Typography
							variant='h2'
							component='h1'
							fontWeight={900}
							sx={{ mb: 2, lineHeight: 1.1 }}>
							{user.name}
						</Typography>
						<Typography
							variant='body1'
							sx={{
								color: "text.secondary",
								fontStyle: "italic",
								lineHeight: 1.7,
								mb: 4,
							}}>
							"{user.bio}"
						</Typography>
						<Stack
							spacing={1.5}
							sx={{ mb: 5 }}>
							<DetailRow
								label='Username'
								value={user.username}
							/>
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
								value={user.location}
							/>
						</Stack>
						<Button
							variant='outlined'
							startIcon={<Edit />}
							onClick={handleOpenDialog}
							sx={{
								color: "common.black",
								borderColor: "grey.400",
								borderRadius: "50px",
								px: 3,
								py: 1,
								"&:hover": { bgcolor: "grey.100", borderColor: "common.black" },
							}}>
							Edit Profile
						</Button>
					</Box>
				</Box>

				{/* ===== Central Floating Avatar (UPDATED) ===== */}
				<Card
					sx={{
						position: "absolute", // Absolute for both mobile and desktop
						top: { xs: "22vh", md: "50%" },
						left: { xs: "50%", md: "40%" }, // UPDATED from 50% on desktop
						transform: "translate(-50%, -50%)", // This now centers it on the 40% line
						width: { xs: 200, sm: 280, md: 320 }, // Slightly reduced size
						height: { xs: 200, sm: 380, md: 450 },
						borderRadius: 2,
						boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
						overflow: "hidden",
						zIndex: 10,
					}}>
					<CardMedia
						component='img'
						image={user.avatar}
						alt={user.name}
						sx={{ width: "100%", height: "100%", objectFit: "cover" }}
					/>
				</Card>

				<SocialLinks />
				<LanguageSelector />
			</Box>

			{/* ===== Edit Dialog (No changes needed here) ===== */}
			<Dialog
				open={openDialog}
				onClose={handleCloseDialog}
				maxWidth='sm'
				fullWidth>
				<DialogTitle sx={{ fontWeight: "bold" }}>Edit Your Profile</DialogTitle>
				<DialogContent>
					{error && (
						<Alert
							severity='error'
							sx={{ mb: 2 }}>
							{error}
						</Alert>
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
								type={field.type}
								value={formData[field.name] || ""}
								onChange={handleInputChange}
								required={field.required}
								multiline={field.multiline}
								rows={field.rows}
								disabled={isLoading}
							/>
						))}
					</Box>
				</DialogContent>
				<DialogActions sx={{ p: "16px 24px" }}>
					<Button
						onClick={handleCloseDialog}
						disabled={isLoading}
						color='inherit'>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						variant='contained'
						disabled={isLoading}>
						{isLoading ? (
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
const SocialLinks = () => (
	<Stack
		spacing={1}
		sx={{
			position: "fixed",
			top: "50%",
			right: { xs: "1rem", md: "2rem" },
			transform: "translateY(-50%)",
			display: { xs: "none", sm: "flex" },
		}}>
		<IconButton sx={{ color: "grey.500", "&:hover": { color: "#1877F2" } }}>
			<Facebook />
		</IconButton>
		<IconButton sx={{ color: "grey.500", "&:hover": { color: "#E4405F" } }}>
			<Instagram />
		</IconButton>
		<IconButton sx={{ color: "grey.500", "&:hover": { color: "#1DA1F2" } }}>
			<Twitter />
		</IconButton>
	</Stack>
);
const LanguageSelector = () => (
	<Box
		sx={{
			position: "fixed",
			bottom: { xs: "1rem", md: "2rem" },
			right: { xs: "1rem", md: "2rem" },
			display: { xs: "none", sm: "block" },
		}}>
		<Typography
			component='span'
			sx={{ cursor: "pointer", fontWeight: 600, color: "text.primary" }}>
			EN
		</Typography>
		<Typography
			component='span'
			sx={{ mx: 1, color: "text.secondary" }}>
			/
		</Typography>
		<Typography
			component='span'
			sx={{
				cursor: "pointer",
				color: "text.secondary",
				"&:hover": { color: "text.primary" },
			}}>
			FR
		</Typography>
	</Box>
);

export default ModernUserProfile;
