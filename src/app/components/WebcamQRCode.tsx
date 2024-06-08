import axios from "axios";
import Image from "next/image";
import QRCode from "qrcode.react";
import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import camera from "../public/camera.png";
import retake from "../public/retake.png";

const WebcamQRCode = () => {
  const webcamRef = useRef<Webcam>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [qrValue, setQrValue] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [secondVideoFinished, setSecondVideoFinished] =
    useState<boolean>(false);
  const [cameraWidth, setCameraWidth] = useState<string>("1%");

  const capture = async () => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot();
      console.log("webcam", cameraWidth);

      if (image) {
        setImageSrc(image);
        setUploading(true);
        const imageUrl = await uploadImageToCloudinary(image);
        setUploading(false);
        if (imageUrl) {
          setQrValue(imageUrl);
        }
      } else {
        console.error("Failed to capture image");
      }
    } else {
      console.error("Webcam reference is not available");
    }
  };

  const uploadImageToCloudinary = async (image: string) => {
    try {
      const blob = await fetch(image).then((res) => res.blob());
      const formData = new FormData();
      formData.append("file", blob);
      formData.append("upload_preset", "vu52wpvk");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dxajrtcwk/image/upload",
        formData
      );
      return response.data.secure_url; // URL of the uploaded image
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      return null;
    }
  };

  const resetValues = () => {
    setQrValue("");
    setCountdown(null);
    setImageSrc(null);
    setSecondVideoFinished(false);
    setShowVideo(true);
    setCameraWidth("1%");
  };

  const handleVideoClick = () => {
    setShowVideo(false);
    setCountdown(3); // Start countdown
    setCameraWidth("100%");
  };

  const handleSecondVideoEnded = () => {
    setSecondVideoFinished(true);
  };

  useEffect(() => {
    if (countdown === 0) {
      setTimeout(() => {
        capture(); // Automatically capture the picture when countdown is 0
        setCountdown(null);
      }, 100); // Adding a slight delay to ensure webcamRef is set
    } else if (countdown && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown === 1) {
            clearInterval(timer);
          }
          return prevCountdown && prevCountdown - 1;
        });
      }, 1000);
      console.log("count", countdown);

      return () => clearInterval(timer);
    } else if (countdown == null) return console.log("count", countdown);
  }, [countdown]);

  return (
    <div className="containerComponentWeb">
      {showVideo && countdown === null && !secondVideoFinished ? (
        <div
          className="videoContainer"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "black",
          }}
          onClick={handleVideoClick}
        >
          <video
            autoPlay
            loop
            muted
            className="introVideo"
            style={{ objectFit: "cover" }}
            // Add event handler for when the second video ends
          >
            <source
              src="https://res.cloudinary.com/dxajrtcwk/video/upload/v1717867510/video_intro_uebicu.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <>
          {countdown && countdown > 0 ? (
            <div
              className="countdown"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "white",
                fontSize: "3rem",
              }}
            >
              {countdown}
            </div>
          ) : (
            <>
              {imageSrc && !secondVideoFinished ? (
                <div
                  className="videoContainer"
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "black",
                  }}
                >
                  <video
                    className="videoQr"
                    autoPlay
                    muted
                    style={{ objectFit: "cover" }}
                    onEnded={handleSecondVideoEnded}
                  >
                    <source
                      src="https://res.cloudinary.com/dxajrtcwk/video/upload/v1717868435/video_qr_qhlk1h.mp4"
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <>
                  {" "}
                  <div className="qrPictureContainer">
                    <img src={imageSrc || ''} alt="Captured" className="picture" />
                    {qrValue && (
                      <>
                        <QRCode value={qrValue} size={456} />{" "}
                      </>
                    )}
                    {qrValue && imageSrc && (
                      <>
                        <button
                          style={{ background: "none", border: "none" }}
                          onClick={() => resetValues()}
                        >
                          <Image width={100} src={retake} alt="retakeIcon" />
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
      <Webcam
        audio={false}
        ref={webcamRef}
        className="webcam"
        style={{
          visibility: imageSrc ? "hidden" : "visible",
          width: imageSrc ? "0%" :"100%",
        }}
        screenshotFormat="image/jpeg"
        onUserMedia={() => console.log("Webcam ready")}
        onUserMediaError={(error) => console.error("Webcam error:", error)}
      />
    </div>
  );
};

export default WebcamQRCode;
