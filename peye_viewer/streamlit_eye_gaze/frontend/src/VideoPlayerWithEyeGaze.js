import React, { useRef, useEffect, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { Streamlit, withStreamlitConnection } from "streamlit-component-lib";

// Define VideoPlayer component
const VideoPlayer = ({ videoUrl, onTimeUpdate }) => {
  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null);

  // Ref to store the current time of the video to prevent restarting
  const currentTimeRef = useRef(0);  // This stores the current time

  useEffect(() => {
    // Initialize Video.js player only once
    if (playerRef.current && !playerInstanceRef.current) {
      playerInstanceRef.current = videojs(playerRef.current, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
        sources: [{ src: videoUrl, type: 'video/mp4' }],
      });

      // Restore current time when video re-initializes
      playerInstanceRef.current.currentTime(currentTimeRef.current);

      // Time update event to continuously track current time
      playerInstanceRef.current.on('timeupdate', () => {
        const current = playerInstanceRef.current.currentTime();
        currentTimeRef.current = current;  // Store the current time in ref
        onTimeUpdate(current);  // Notify parent component of time update
      });

      // Error handling for media errors
      playerInstanceRef.current.on('error', () => {
        console.error(`Video.js error: ${playerInstanceRef.current.error().message}`);
      });
    }

    // Cleanup when component unmounts
    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.dispose();
        playerInstanceRef.current = null;
      }
    };
  }, [videoUrl]);  // Re-initialize only when videoUrl changes

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

// Define GazeOverlay component to render current and past positions
const GazeOverlay = ({ eyeGazeData, activeSubjects, currentTime, historySamples }) => {
  const getCurrentGazePositions = () => {
    if (!eyeGazeData || typeof eyeGazeData !== 'object') {
      return [];
    }

    return activeSubjects.map(subject => {
      const subjectData = eyeGazeData[subject];
      if (!subjectData || subjectData.length === 0) return null;

      // Find gaze data within the history window
      const gazeHistory = subjectData.filter(entry =>
        entry.relative_timestamp <= currentTime
      ).slice(-historySamples); // Limit by historySamples

      // Get current and past positions
      const positions = gazeHistory.map(gaze => ({
        x: gaze.gaze_x * 100, // Coordinates for SVG
        y: gaze.gaze_y * 100, // Coordinates for SVG
        relative_timestamp: gaze.relative_timestamp,
      }));

      return { subject, positions };
    }).filter(Boolean); // Remove null entries
  };

  const gazePositions = getCurrentGazePositions();

  return (
    <>
      {/* SVG container for drawing lines */}
      {historySamples > 0 && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,  // Keep the SVG below the circles
            pointerEvents: 'none',
          }}
          viewBox="0 0 100 100"  // Use a consistent viewBox for percentage-based positioning
          preserveAspectRatio="none"
        >
          {gazePositions.map((gaze, index) => (
            <g key={gaze.subject}>
              {/* Trace history as line connecting past positions */}
              {gaze.positions.length > 1 && gaze.positions.map((pos, idx) => (
                idx > 0 && (
                  <line
                    key={`line-${gaze.subject}-${idx}`}
                    x1={`${gaze.positions[idx - 1].x}`}
                    y1={`${gaze.positions[idx - 1].y}`}
                    x2={`${pos.x}`}
                    y2={`${pos.y}`}
                    stroke={`hsl(${index * 137.5 % 360}, 70%, 50%)`}
                    strokeWidth="1"  // Increased stroke width for better visibility
                    opacity="0.8"    // Add opacity for better visibility
                  />
                )
              ))}
            </g>
          ))}
        </svg>
      )}

      {/* Render the current gaze point */}
      {gazePositions.map((gaze, index) => (
        gaze.positions.length > 0 && (
          <div
            key={gaze.subject}
            style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: `hsl(${index * 137.5 % 360}, 70%, 50%)`,
              left: `${gaze.positions[gaze.positions.length - 1].x}%`,
              top: `${gaze.positions[gaze.positions.length - 1].y}%`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 2,  // Circles appear above lines
            }}
          />
        )
      ))}
    </>
  );
};


// Define VideoPlayerWithEyeGaze component
const VideoPlayerWithEyeGaze = (props) => {
  const { videoUrl, eyeGazeData, activeSubjects, historySamples } = props.args;
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
      <GazeOverlay 
        eyeGazeData={eyeGazeData} 
        activeSubjects={activeSubjects} 
        currentTime={currentTime} 
        historySamples={historySamples} 
      />
    </div>
  );
};

export default withStreamlitConnection(VideoPlayerWithEyeGaze);
