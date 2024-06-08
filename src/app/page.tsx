// pages/index.js
"use client";
import React from "react";
import dynamic from "next/dynamic";

const WebcamQRCode = dynamic(() => import("./components/WebcamQRCode"), {
  ssr: false,
});

const Home = () => {
  return (
    <div  className="container">
      <WebcamQRCode />
    </div>
  );
};

export default Home;
