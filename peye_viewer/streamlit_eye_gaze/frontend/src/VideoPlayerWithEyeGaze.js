import React, { useRef, useEffect, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { Streamlit, withStreamlitConnection } from "streamlit-component-lib";

// Define VideoPlayer component
const VideoPlayer = ({ videoUrl, onTimeUpdate }) => {
  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null);

  useEffect(() => {
    // Initialize Video.js player
    if (playerRef.current && !playerInstanceRef.current) {
      playerInstanceRef.current = videojs(playerRef.current, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
        sources: [{ src: videoUrl, type: 'video/mp4' }],
      });

      // Time update event to update current time continuously
      playerInstanceRef.current.on('timeupdate', () => {
        const current = playerInstanceRef.current.currentTime();
        onTimeUpdate(current); // Update current time
      });

      // Error handling for media errors
      playerInstanceRef.current.on('error', () => {
        console.error(`Video.js error: ${playerInstanceRef.current.error().message}`);
      });
    }

    // Cleanup the player on unmount
    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.dispose();
        playerInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div data-vjs-player>
      <video ref={playerRef} className="video-js vjs-default-skin" playsInline>
        <p className="vjs-no-js">
          To view this video please enable JavaScript, and consider upgrading to a
          web browser that
          <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
        </p>
      </video>
    </div>
  );
};

// Define GazeOverlay component
const GazeOverlay = ({ eyeGazeData, activeSubjects, currentTime }) => {
  activeSubjects = activeSubjects || [];

  const getCurrentGazePositions = () => {
    if (!eyeGazeData || typeof eyeGazeData !== 'object') {
      return [];
    }

    return activeSubjects.map(subject => {
      const subjectData = eyeGazeData[subject];
      if (!subjectData || subjectData.length === 0) return null;

      // Find the closest timestamp
      const closestPoint = subjectData.reduce((prev, curr) => {
        return Math.abs(curr.relative_timestamp - currentTime) < Math.abs(prev.relative_timestamp - currentTime) ? curr : prev;
      });

      const left = `${(closestPoint.gaze_x * 100).toFixed(2)}%`;
      const top = `${(closestPoint.gaze_y * 100).toFixed(2)}%`;

      return { subject, left, top };
    }).filter(Boolean);
  };

  const gazePositions = getCurrentGazePositions();

  return (
    <>
      {gazePositions.map((gaze, index) => (
        <div
          key={gaze.subject}
          style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: `hsl(${index * 137.5 % 360}, 70%, 50%)`,
            left: gaze.left,
            top: gaze.top,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      ))}
    </>
  );
};

// Define VideoPlayerWithEyeGaze component
const VideoPlayerWithEyeGaze = (props) => {
  const { videoUrl, eyeGazeData, activeSubjects, onTimeUpdate } = props.args;
  const [currentTime, setCurrentTime] = useState(0);

  const handleTimeUpdate = (current) => {
    // Set and update current time only from the timeupdate event
    setCurrentTime(current);
    Streamlit.setComponentValue({ currentTime: current }); // Always send the updated time to Streamlit
  };

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: '300px', minHeight: '200px', resize: 'both', overflow: 'auto' }}>
      <VideoPlayer 
        videoUrl={videoUrl} 
        onTimeUpdate={handleTimeUpdate}
      />
      <GazeOverlay eyeGazeData={eyeGazeData} activeSubjects={activeSubjects} currentTime={currentTime} />
    </div>
  );
};

export default withStreamlitConnection(VideoPlayerWithEyeGaze);
