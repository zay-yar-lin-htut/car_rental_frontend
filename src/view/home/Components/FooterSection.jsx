import React from "react";
import { Box, Typography } from "@mui/material";

const FooterSection = () => {
	return (
		<Box
			sx={{
				height: "60vh",
				position: "relative",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				backgroundImage: "url(/porsche-footer.jpg)",
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundAttachment: "fixed",
			}}>
			<Box
				sx={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: "#0D1B2A",
					opacity: 0.7,
				}}
			/>
			<Typography
				variant='h4'
				fontWeight={700}
				textAlign='center'
				sx={{ position: "relative", zIndex: 1, px: 2 }}>
				Timeless design, contemporary interpretation.
			</Typography>
		</Box>
	);
};

export default FooterSection;
