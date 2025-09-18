import React from "react";
import { Box, Typography, Container } from "@mui/material";
import VideoBackground1 from "../../common/background1";

const HeroSection = () => {
    return (
        <Box
            sx={{
                height: "100vh",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
            }}>
            <VideoBackground1 videoSrc="/bg-2.mp4" />
            <Container
                maxWidth='lg'
                sx={{ position: "relative", zIndex: 3, textAlign: "center"}}>
                <Typography
                    variant='h1'
                    fontWeight={900}
                    letterSpacing={2}
                    sx={{
                        textTransform: "uppercase",
                        fontSize: { xs: "1.5rem", sm: "2rem", md: "4rem" },
                    }}>
                    Welcome to
                </Typography>
                <Typography
                    variant='h1'
                    fontWeight={900}
                    letterSpacing={1}
                    sx={{
                        textTransform: "uppercase",
                        fontSize: { xs: "1.5rem", sm: "2rem", md: "4rem" },
                        marginBottom: { xs: 5, sm: 3, md: 0 },
                    }}>
                    Journey Wheel
                </Typography>
                <Typography
                    variant='h1'
                    fontWeight={900}
                    letterSpacing={2}
                    sx={{
                        textTransform: "uppercase",
                        fontSize: { xs: "0.8rem", sm: "1.5rem", md: "3rem" },
                    }}>
                    Start Your Journey Today!
                </Typography>
            </Container>
        </Box>
    );
};

export default HeroSection;