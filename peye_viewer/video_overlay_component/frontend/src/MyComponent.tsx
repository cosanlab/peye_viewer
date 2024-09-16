import React, { useEffect, useRef } from "react";
import { Streamlit, withStreamlitConnection } from "streamlit-component-lib";

interface EyeData {
  gaze_x_norm: number;
  gaze_y_norm: number;
  timestamp: number;
}

interface MyComponentProps {
  videoUrl: string;
  eyeData: EyeData[];
}

const MyComponent: React.FC<MyComponentProps> = ({ videoUrl, eyeData }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw eye-tracking points whenever the video time updates
    const drawEyeTracking = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const currentTime = video.currentTime;

      // Find the relevant eye data points for the current timestamp
      const eyeDataForTimestamp = eyeData.filter(
        (point) => Math.abs(point.timestamp - currentTime) < 0.5
      );

      eyeDataForTimestamp.forEach((point) => {
        const x = point.gaze_x_norm * canvas.width;
        const y = (1 - point.gaze_y_norm) * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = "red";
        ctx.fill();
      });
    };

    video.addEventListener("timeupdate", drawEyeTracking);

    return () => {
      video.removeEventListener("timeupdate", drawEyeTracking);
    };
  }, [eyeData]);  // Note: Add eyeData to dependency array

  return (
    <div style={{ position: "relative", width: "640px", height: "480px" }}>
      <video ref={videoRef} width="640" height="480" controls>
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{ position: "absolute", top: 0, left: 0 }}
      />
    </div>
  );
};

export default withStreamlitConnection(MyComponent);
