import React from "react";
import { Box } from "@mui/material";

const VideoBackground1 = ({ videoSrc }: { videoSrc: string }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
        }}
      />
      <Box
        component="video"
        autoPlay
        loop
        muted
        playsInline
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover", // Ensures the video covers the screen without distortion
          zIndex: 0, // Puts it at the very back
        }}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </Box>
    </div>
  );
};

export default VideoBackground1;
