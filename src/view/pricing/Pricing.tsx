import React from "react";
import { Box, Typography, Stack } from "@mui/material";

// Importing icons for the car specifications
import SpeedIcon from "@mui/icons-material/Speed";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import SettingsIcon from "@mui/icons-material/Settings";
import ShutterSpeedIcon from "@mui/icons-material/ShutterSpeed";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import ScaleIcon from "@mui/icons-material/Scale";

// Data for the car specifications to keep the JSX clean
const carSpecs = [
	{
		icon: <SpeedIcon fontSize='large' />,
		value: "250 km/h",
		label: "Max Speed",
	},
	{
		icon: <FlashOnIcon fontSize='large' />,
		value: "369 hp",
		label: "Engine Power",
	},
	{
		icon: <SettingsIcon fontSize='large' />,
		value: "1.5 L",
		label: "Engine Volume",
	},
	{
		icon: <ShutterSpeedIcon fontSize='large' />,
		value: "4.4 s",
		label: "0-100 km/h",
	},
	{
		icon: <LocalGasStationIcon fontSize='large' />,
		value: "2.1 L/100km",
		label: "Consumption",
	},
	{
		icon: <ScaleIcon fontSize='large' />,
		value: "1,560 kg",
		label: "Car Weight",
	},
];

const CarShowcasePage = () => {
	// A simple fade-in-up animation for text elements
	const fadeInUpAnimation = {
		"@keyframes fadeInUp": {
			"0%": {
				opacity: 0,
				transform: "translateY(20px)",
			},
			"100%": {
				opacity: 1,
				transform: "translateY(0)",
			},
		},
		animation: "fadeInUp 1s ease-out forwards",
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				width: "100%",
				position: "relative",
				overflow: "hidden",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				// The dark-to-light gradient background
				background:
					"linear-gradient(180deg, #0d1117 0%, #161b22 40%, #f0f2f5 80%)",
				fontFamily: "sans-serif",
			}}>
			{/* Subtle background geometric lines for a tech feel */}
			<Box
				sx={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundImage: `
                    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
                `,
					backgroundSize: "40px 40px",
					zIndex: 0,
				}}
			/>

			{/* Top Right Contact Info */}
			<Stack
				sx={{
					position: "absolute",
					top: { xs: "1rem", md: "2rem" },
					right: { xs: "1rem", md: "2rem" },
					alignItems: "flex-end",
					color: "grey.400",
					zIndex: 10,
				}}>
				<Typography variant='caption'>+1 (800) 555-0199</Typography>
				<Typography variant='caption'>showroom@bmw.example</Typography>
			</Stack>

			{/* Main Content Area */}
			<Box
				sx={{
					flexGrow: 1,
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					textAlign: "center",
					color: "common.white",
					zIndex: 2,
					px: 2,
				}}>
				{/* Subtitle */}
				<Typography
					sx={{
						...fadeInUpAnimation,
						letterSpacing: "0.3em",
						textTransform: "uppercase",
						fontWeight: 300,
						fontSize: "0.8rem",
						mb: 2,
						color: "grey.500",
					}}>
					The Ultimate Driving Machine
				</Typography>

				{/* Main Headline */}
				<Typography
					variant='h1'
					sx={{
						...fadeInUpAnimation,
						animationDelay: "0.2s",
						fontWeight: 900,
						fontSize: { xs: "4rem", sm: "6rem", md: "8rem", lg: "10rem" },
						lineHeight: 1,
						textShadow: "0px 10px 30px rgba(0, 0, 0, 0.5)",
					}}>
					BMW i8
				</Typography>
			</Box>

			{/* Centered Car Image (Overlapping) */}
			<Box
				component='img'
				src='/home-img.png' // Make sure you have this image in your `public` folder
				alt='BMW i8'
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: { xs: "90%", sm: "80%", md: "65%", lg: "55%" },
					maxWidth: "900px",
					zIndex: 3,
					filter: "drop-shadow(0px 20px 40px rgba(0, 0, 0, 0.6))",
					// Animation for the car
					animation: "fadeInZoom 1.2s ease-out forwards",
					"@keyframes fadeInZoom": {
						"0%": { opacity: 0, transform: "translate(-50%, -50%) scale(0.9)" },
						"100%": { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
					},
				}}
			/>

			{/* Bottom Specifications Section */}
			<Stack
				direction='row'
				justifyContent='center'
				alignItems='flex-start'
				spacing={{ xs: 2, md: 5 }}
				flexWrap='wrap'
				sx={{
					width: "100%",
					p: { xs: 2, md: 4 },
					zIndex: 4,
					// Position at the bottom of the light section
					position: "absolute",
					bottom: 0,
					...fadeInUpAnimation,
					animationDelay: "0.5s",
				}}>
				{carSpecs.map((spec, index) => (
					<Stack
						key={index}
						alignItems='center'
						spacing={1}
						sx={{ minWidth: { xs: "100px", md: "120px" }, p: 1 }}>
						<Box sx={{ color: "grey.700" }}>{spec.icon}</Box>
						<Typography
							variant='h6'
							component='p'
							sx={{ fontWeight: "bold", color: "grey.900" }}>
							{spec.value}
						</Typography>
						<Typography
							variant='caption'
							sx={{ color: "grey.600" }}>
							{spec.label}
						</Typography>
					</Stack>
				))}
			</Stack>
		</Box>
	);
};

export default CarShowcasePage;
