import React from "react"; // Assuming this was already here
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
import { EditProfileDialog } from "./EditProfileDialog";

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
		isUpload,
		setIsUpload,
	} = useUserProfile();

	// --- RENDER LOGIC ---
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
						sx={{ cursor: "pointer" }}>
						PROFILE
					</Typography>
					<Stack
						direction='row'
						alignItems='center'
						spacing={3}
						justifyContent={{ xs: "center", md: "flex-start" }}>
						<Button
							variant='text'
							startIcon={<ArrowBackIcon />}
							onClick={() => navigate("/")}
							sx={{
								color: "white",
								textTransform: "none",
								fontSize: "1rem",
								"&:hover": {
									backgroundColor: "rgba(255, 255, 255, 0.08)",
								},
							}}>
							Home
						</Button>
						<Link
							href='#'
							sx={{
								color: "white",
								textDecoration: "none",
								"&:hover": { color: "common.white" },
							}}>
							Settings
						</Link>
						<Link
							href='#'
							sx={{
								color: "white",
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
						...slideInRight,
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
					<Box
						sx={{ maxWidth: 450, ...fadeIn, opacity: 0 }}
						style={{ animationDelay: "0.6s" }} // Custom delay
					>
						<Typography
							variant='h2'
							component='h1'
							fontWeight={900}
							sx={{ mb: 2, lineHeight: 1.1, color: "black" }}>
							{user.name}
						</Typography>

						<Stack
							spacing={5}
							sx={{ my: 10, color: "text.secondary" }}>
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
								"&:hover": {
									bgcolor: "grey.100",
									borderColor: "common.black",
								},
							}}>
							Edit Profile
						</Button>
					</Box>
				</Box>

				{/* ===== Central Floating Avatar (UPDATED) ===== */}
				<Card
					sx={{
						...popIn,
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

				<SocialLinks />
				<LanguageSelector />
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
