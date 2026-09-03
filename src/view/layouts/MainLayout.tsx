import React from "react";
import { Outlet } from "react-router-dom";
import VideoBackground1 from "../common/Background1";

const MainLayout = () => {
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Background (only mounts once) */}
      <VideoBackground1 videoSrc="/bg-2.mp4" />

      {/* Optional global overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-[1]" />

      {/* Foreground content */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <Outlet /> 
        {/* <-- this is where your pages will render */}
      </div>
    </div>
  );
};

export default MainLayout;
