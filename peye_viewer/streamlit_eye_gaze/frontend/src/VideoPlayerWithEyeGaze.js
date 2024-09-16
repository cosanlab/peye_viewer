import React, { useRef, useState, useEffect } from 'react';
import Streamlit from "streamlit-component-lib";
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

// Expose Streamlit to the window object
window.Streamlit = Streamlit;

const VideoPlayerWithEyeGaze = ({ videoUrl, eyeGazeData, activeSubjects }) => {
  const playerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentEyeGazeData, setCurrentEyeGazeData] = useState(eyeGazeData);

  const chunkDuration = 60; // 60 seconds per chunk

  useEffect(() => {
    // Initialize Video.js player
    const player = videojs(playerRef.current, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true,
      sources: [{ src: videoUrl, type: 'video/mp4' }],
    });

    // Update currentTime and check for chunk loading
    player.on('timeupdate', () => {
      const current = player.currentTime();
      setCurrentTime(current);

      // Check if we need to load the next chunk
      const currentChunkEnd = Math.ceil(current / chunkDuration) * chunkDuration;
      if (current + 5 >= currentChunkEnd) {
        loadNextChunk(currentChunkEnd, currentChunkEnd + chunkDuration);
      }
    });

    // Get video duration
    player.on('loadedmetadata', () => {
      setDuration(player.duration());
    });

    // Cleanup the player on unmount
    return () => {
      if (player) {
        player.dispose();
      }
    };
  }, [videoUrl]);

  useEffect(() => {
    setCurrentEyeGazeData(eyeGazeData);
  }, [eyeGazeData]);

  const loadNextChunk = (start, end) => {
    try {
      // Send the request to Streamlit
      if (window.Streamlit) {
        window.Streamlit.setComponentValue({ start, end });
      } else {
        console.error("Streamlit is not defined in the window context.");
      }
    } catch (error) {
      console.error("Error fetching eye gaze data:", error);
    }
  };

  const getCurrentGazePositions = () => {
    const videoElement = playerRef.current;
    if (!videoElement) {
      return [];
    }

    // Use actual video element's dimensions
    const videoWidth = videoElement.clientWidth || 1;
    const videoHeight = videoElement.clientHeight || 1;

    return activeSubjects.map(subject => {
      const subjectData = currentEyeGazeData[subject];
      if (!subjectData || subjectData.length === 0) return null;

      // Find the closest timestamp
      const closestPoint = subjectData.reduce((prev, curr) => {
        return Math.abs(curr.relative_timestamp - currentTime) < Math.abs(prev.relative_timestamp - currentTime) ? curr : prev;
      });

      // Calculate positions relative to video dimensions
      const left = `${(closestPoint.gaze_x * 100).toFixed(2)}%`; // Use percentage
      const top = `${(closestPoint.gaze_y * 100).toFixed(2)}%`; // Use percentage

      return {
        subject,
        left,
        top,
      };
    }).filter(Boolean);
  };

  const gazePositions = getCurrentGazePositions();

  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
      {/* Parent container for video and overlay */}
      <div style={{ position: 'relative' }}>
        <div data-vjs-player style={{ position: 'relative', zIndex: 1 }}>
          <video ref={playerRef} className="video-js vjs-default-skin" playsInline />
        </div>
        {/* Overlay for gaze points */}
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
              zIndex: 2, // Ensure overlay is above the video
            }}
          />
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '5px', zIndex: 3 }}>
        Current Time: {currentTime.toFixed(2)} / {duration.toFixed(2)}
      </div>
    </div>
  );
};

export default VideoPlayerWithEyeGaze;
