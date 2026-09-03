import React from "react";
import { Box, CircularProgress, Typography, useTheme } from "@mui/material";

const FullPageLoader = ({ message = "Loading..." }: { message?: string }) => {
	const theme = useTheme();

	return (
		<Box
			sx={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100vw",
				height: "100vh",
				backgroundColor: `${theme.palette.primary.main}80`, // 50% opacity
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 9999,
			}}>
			<CircularProgress size={60} sx={{ color: "white", mb: 2 }} />
			<Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
				{message}
			</Typography>
		</Box>
	);
};

export default FullPageLoader;