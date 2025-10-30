import React, { useState, useMemo } from "react";
import {
	Box,
	Typography,
	Container,
	Card,
	CardMedia,
	CardContent,
	IconButton,
	Skeleton,
} from "@mui/material";
import Slider from "react-slick";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { createDataServices } from "../../../services/DataServices";

const Arrow = React.memo((props) => {
	// The `style` prop contains properties from react-slick, including `display: 'none'` when the arrow should be hidden.
	// We spread it first, then override with our custom positioning.
	const { direction, onClick, style } = props;
	return (
		<IconButton
			onClick={onClick}
			sx={{
				...style,
				position: "absolute",
				width: 60,
				height: 60,
				top: "40%", // Vertically align with the card images
				transform: "translateY(-50%)",
				...(direction === "left"
					? { left: { xs: -50, md: -100 } }
					: { right: { xs: -50, md: -100 } }),
				zIndex: 2,
				bgcolor: "var(--background-paper)",
				color: "var(--text-color)",
				boxShadow: 3,
				"&:hover": {
					bgcolor: "var(--primary-color)",
					color: "var(--primary-contrast-text)",
				},
			}}>
			{direction === "left" ? <ArrowBackIosNewIcon /> : <ArrowForwardIosIcon />}
		</IconButton>
	);
});

const sliderSettings = {
	dots: true,
	infinite: true,
	speed: 500,
	slidesToShow: 3,
	slidesToScroll: 1,
	centerMode: true,
	centerPadding: "0px",
	autoplay: true,
	autoplaySpeed: 3000, // Time in ms
	pauseOnHover: true,
	nextArrow: <Arrow direction='right' />,
	prevArrow: <Arrow direction='left' />,
	responsive: [
		{
			breakpoint: 960,
			settings: {
				slidesToShow: 1,
				centerPadding: "20px",
			},
		},
	],
};

const HighlightCard = React.memo(({ item, dataServices }) => {
	const [isImageLoaded, setIsImageLoaded] = useState(false);

	const handleImageLoad = () => {
		setIsImageLoaded(true);
	};

	return (
		<Box sx={{ px: 2, outline: "none" }}>
			<Card
				sx={{
					bgcolor: "var(--background-paper)",
					borderRadius: 3,
					overflow: "hidden",
					display: "flex",
					flexDirection: "column",
					height: "100%",
					boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
					transition: "box-shadow 0.3s ease-in-out",
					"&:hover": {
						boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
					},
				}}>
				<Box sx={{ position: "relative", height: { xs: 200, md: 250 } }}>
					{!isImageLoaded && (
						<Skeleton
							variant='rectangular'
							animation='wave'
							sx={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								height: "100%",
							}}
						/>
					)}
					<CardMedia
						component='img'
						image={dataServices.retrieveImage(item.car_type_image_url)}
						alt={item.type_name}
						onLoad={handleImageLoad}
						sx={{
							height: "100%",
							width: "100%",
							objectFit: "cover",
							opacity: isImageLoaded ? 1 : 0,
							transition: "opacity 0.5s ease-in-out",
						}}
					/>
				</Box>
				<CardContent
					sx={{
						textAlign: "center",
						p: 3,
						flexGrow: 1,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
					}}>
					<Typography
						variant='h5'
						fontWeight='bold'
						sx={{
							fontSize: { xs: "1.2rem", md: "1.5rem" },
							fontFamily: "'Orbitron', sans-serif",
							color: "var(--text-color)",
							mb: 1,
						}}>
						{item.type_name}
					</Typography>
					<Typography
						color='var(--text-secondary-color)'
						sx={{
							fontSize: { xs: "0.8rem", md: "1rem" },
						}}>
						{item.description}
					</Typography>
				</CardContent>
			</Card>
		</Box>
	);
});

const HighlightsSection = ({ highlightsData = [], isLoading }) => {
	const dataServices = useMemo(() => createDataServices(), []);

	if (isLoading) {
		return (
			<Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "var(--background-color)" }}>
				<Container maxWidth='lg'>
					<Typography
						variant='h3'
						component='h2'
						fontWeight={800}
						textAlign='center'
						gutterBottom
						sx={{
							fontFamily: "'Orbitron', sans-serif",
							mb: 6,
							color: "var(--text-color)",
						}}>
						Meet Your Fleet
					</Typography>
					<Box
						sx={{
							display: "flex",
							flexDirection: { xs: "column", sm: "row" },
							gap: 4,
						}}
						justifyContent='center'
						alignItems='center'>
						{Array.from(new Array(3)).map((_, index) => (
							<Skeleton
								key={index}
								variant='rectangular'
								height={350}
								sx={{
									borderRadius: 3,
									width: { xs: "90%", sm: "60%", md: "33%" },
								}}
							/>
						))}
					</Box>
				</Container>
			</Box>
		);
	}

	if (!highlightsData || highlightsData.length === 0) {
		// Render nothing if there's no data and we are not loading
		return null;
	}

	return (
		<Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "var(--background-color)" }}>
			<Container maxWidth='lg'>
				<Typography
					variant='h3'
					component='h2'
					fontWeight={800}
					textAlign='center'
					gutterBottom
					sx={{
						fontFamily: "'Orbitron', sans-serif",
						mb: 6,
						color: "var(--text-color)",
					}}>
					Meet Your Fleet
				</Typography>

				<Box
					sx={{
						position: "relative",
						mx: { xs: 4, md: 8 },
						// Target the slick-track to ensure slides are vertically centered after scaling
						".slick-track": {
							display: "flex",
							alignItems: "center",
						},
						".slick-slide .MuiCard-root": {
							willChange: "transform", // Performance optimization
							transform: "scale(0.9)",
							transition: "transform 0.4s ease-in-out",
							"&:hover": {
								transform: "scale(0.95)",
							},
						},
						".slick-center .MuiCard-root": {
							transform: "scale(1)",
							"&:hover": {
								transform: "scale(1.05)",
							},
						},
					}}>
					<Slider {...sliderSettings}>
						{highlightsData.map((item, index) => (
							<HighlightCard
								key={item.id || index}
								item={item}
								dataServices={dataServices}
							/>
						))}
					</Slider>
				</Box>
			</Container>
		</Box>
	);
};

export default HighlightsSection;
