import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const Cars = () => {
	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "var(--background-color)",
			}}>
			<Container
				maxWidth='md'
				sx={{ textAlign: "center", p: 4 }}>
				<Typography
					variant='h2'
					component='h1'
					gutterBottom
					sx={{ fontWeight: "bold", color: "var(--primary-color)" }}>
					Our Models
				</Typography>
				<Typography
					variant='h5'
					color='var(--text-secondary-color)'
					paragraph>
					Welcome to the models page. Content is under construction.
				</Typography>
				<Button
					variant='contained'
					component={RouterLink}
					to='/'
					sx={{ mt: 4 }}>
					Back to Home
				</Button>
			</Container>
		</Box>
	);
};

export default Cars;
