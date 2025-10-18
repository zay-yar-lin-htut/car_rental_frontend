import React from "react";
import {
	Box,
	Container,
	Paper,
	Typography,
	CardMedia,
	Button,
} from "@mui/material";

const offers = [
	{
		id: 1,
		title: "Monthly & Annual Car Solutions",
		description:
			"Save money on corporate fleets, office transport, or personal long-term rentals. Simple contracts, full support.",
		img: "https://cdn.pixabay.com/photo/2023/03/27/08/53/woman-7880177_1280.jpg",
	},
	{
		id: 2,
		title: "Instant Savings & Best Prices",
		description:
			"Your lowest price is here. Find all our deals, discount codes, and special promotions for any rental period. Start saving now!",
		img: "https://cdn.pixabay.com/photo/2024/07/13/07/40/cars-8891625_1280.jpg",
	},
	{
		id: 3,
		title: "Earn Hassle-Free Income",
		description:
			"Tired of your car sitting idle? Turn your depreciating asset into a steady stream of income by partnering with us.",
		img: "https://cdn.pixabay.com/photo/2024/11/05/05/38/japancontest-9175030_1280.jpg",
	},
];
const OurOffersSection = () => {
	return (
		<Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.paper" }}>
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
						color: "text.primary",
					}}>
					What We Offer
				</Typography>
				<Box
					sx={{
						display: "flex",
						flexWrap: "wrap",
						gap: 4,
						justifyContent: "center",
					}}>
					{offers.map((offer) => (
						<Paper
							key={offer.id}
							elevation={3}
							component={Box}
							data-aos='fade-up'
							data-aos-delay={(offer.id - 1) * 150}
							sx={{
								display: "flex",
								flexDirection: { xs: "column", sm: "row" },
								alignItems: "center",
								width: { xs: "100%", md: "calc(50% - 20px)" }, // Adjusted for new gap
								p: 3, // Increased padding for a bigger card feel
								borderRadius: 3,
								overflow: "hidden",
								transition: "transform 0.3s, box-shadow 0.3s",
								"&:hover": {
									transform: "translateY(-8px)",
									boxShadow: 6,
								},
							}}>
							<CardMedia
								component='img'
								image={offer.img}
								alt={offer.title}
								sx={{
									width: { xs: "100%", sm: 250 }, // Made image wider
									height: { xs: 180, sm: "auto" }, // Adjusted height
									objectFit: "cover",
									borderRadius: 2,
								}}
							/>
							<Box
								sx={{
									p: { xs: 2, sm: 3 },
									textAlign: "left",
									display: "flex",
									flexDirection: "column",
									flexGrow: 1,
								}}>
								<Box sx={{ flexGrow: 1 }}>
									<Typography
										variant='h5' // Larger title
										fontWeight='bold'
										gutterBottom>
										{offer.title}
									</Typography>
									<Typography
										variant='body1'
										color='text.secondary'>
										{offer.description}
									</Typography>
								</Box>
								<Button
									variant='contained'
									sx={{ mt: 2, alignSelf: "flex-start" }}>
									Learn More
								</Button>
							</Box>
						</Paper>
					))}
				</Box>
			</Container>
		</Box>
	);
};

export default OurOffersSection;
