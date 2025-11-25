import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const BookingLayout = ({ title, children }) => {
	return (
		<Box
			sx={{
				pt: { xs: 12, md: 14 },
				pb: 5,
				px: 2,
				minHeight: "100vh",
				bgcolor: "var(--background-paper)",
			}}>
			<Paper
				sx={{
					py: { xs: 2, md: 4 },
					maxWidth: "lg",
					mx: "auto",
					borderRadius: 3,
					boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
				}}>
				{title && (
					<Typography
						variant='h4'
						align='center'
						fontWeight='bold'
						gutterBottom>
						{title}
					</Typography>
				)}
				<Box sx={{ mt: 2 }}>{children}</Box>
			</Paper>
		</Box>
	);
};

export default BookingLayout;
