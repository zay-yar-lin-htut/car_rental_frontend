import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import Slider from "react-slick";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BaseUrl } from "../../../services/BaseUrl";
import { API_ENDPOINTS } from "../../../services/Configuration";

const HighlightsSection = ({ highlightsData = [] }) => {
  const [imageLoaded, setImageLoaded] = useState({});

  useEffect(() => {
    highlightsData.forEach((item, index) => {
      const img = new Image();
      img.src = item.car_type_image_url;
      img.onload = () => {
        setImageLoaded((prev) => ({ ...prev, [index]: true }));
      };
    });
  }, [highlightsData]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "0px",
    arrows: true,
    responsive: [
      {
        breakpoint: 960,
        settings: {
          slidesToShow: 1,
          centerPadding: "20px",
        }
      }
    ]
  };

  if (!highlightsData || highlightsData.length === 0) {
    return (
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container
          maxWidth="lg"
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <CircularProgress color="inherit" />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h2"
          fontWeight={800}
          textAlign="center"
          gutterBottom
          sx={{ 
            fontFamily: "'Orbitron', sans-serif",
            mb: 6,
            color: "text.primary"
          }}
        >
          Meet Your Fleet
        </Typography>

        <Slider {...settings}>
          {highlightsData.map((item, index) => (
            <Box key={index} sx={{ px: 2 }}>
              <Card
                sx={{
                  mx: "auto",
                  width: { xs: "90%", md: "80%" },
                  boxShadow: 10,
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05)"
                  }
                }}
              >
                {!imageLoaded[index] ? (
                  <Box
                    sx={{
                      width: "100%",
                      height: { xs: 200, md: 300 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "background.paper",
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box
                    component="img"
                    src={`${BaseUrl}${API_ENDPOINTS.image.proxy}?url=${encodeURIComponent(item.car_type_image_url)}`}
                    alt={item.type_name}
                    sx={{
                      width: "100%",
                      height: { xs: 200, md: 300 },
                      objectFit: "cover",
                      borderRadius: "8px 8px 0 0",
                    }}
                  />
                )}
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{
                      fontSize: { xs: "1.5rem", md: "2rem" },
                      fontFamily: "'Orbitron', sans-serif",
                      color: "text.primary",
                    }}
                  >
                    {item.type_name}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: "0.9rem", md: "1.2rem" },
                      mt: 1
                    }}
                  >
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Slider>
      </Container>
    </Box>
  );
};

export default HighlightsSection;