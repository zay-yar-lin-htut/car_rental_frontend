import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const BookingLayout = ({ title, children }) => {
	return (
		<Box sx={{ py: 5, px: 2, bgcolor: "grey.100", minHeight: "100vh" }}>
			<Paper sx={{ p: { xs: 2, md: 4 }, maxWidth: "lg", mx: "auto" }}>
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
