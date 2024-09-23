import React, { useRef, useEffect, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { Streamlit, withStreamlitConnection } from "streamlit-component-lib";
import h337 from 'heatmap.js';  // Import heatmap.js

const VideoPlayer = ({ videoUrl, onTimeUpdate }) => {
  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const currentTimeRef = useRef(0);

  useEffect(() => {
    if (playerRef.current && !playerInstanceRef.current) {
      playerInstanceRef.current = videojs(playerRef.current, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
        sources: [{ src: videoUrl, type: 'video/mp4' }],
      });

      playerInstanceRef.current.currentTime(currentTimeRef.current);
      playerInstanceRef.current.on('timeupdate', () => {
        const current = playerInstanceRef.current.currentTime();
        currentTimeRef.current = current;
        onTimeUpdate(current);
      });

      playerInstanceRef.current.on('error', () => {
        console.error(`Video.js error: ${playerInstanceRef.current.error().message}`);
      });
    }

    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.dispose();
        playerInstanceRef.current = null;
      }
    };
  }, [videoUrl]);

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

// Enforce absolute position with MutationObserver
const enforceAbsolutePosition = (element) => {
  if (element) {
    element.style.position = 'absolute';
    element.style.top = '0';
    element.style.left = '0';
    element.style.width = '100%';
    element.style.height = '100%';
    element.style.pointerEvents = 'none';
    element.style.zIndex = '1000';

    // Create a MutationObserver to watch for style changes
    const observer = new MutationObserver(() => {
      if (element.style.position !== 'absolute') {
        element.style.position = 'absolute';
      }
    });

    observer.observe(element, { attributes: true, attributeFilter: ['style'] });
  }
};

// Add global CSS styles to enforce absolute positioning
const addGlobalStyles = () => {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = `
    .heatmap-canvas {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      pointer-events: none !important;
      z-index: 1000 !important;
    }
  `;
  document.head.appendChild(styleElement);
};

// Define GazeOverlay component
const GazeOverlay = ({ eyeGazeData, activeSubjects, currentTime, historySamples, showHeatmap }) => {
  const overlayRef = useRef(null);
  const heatmapInstanceRef = useRef(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [heatmapData, setHeatmapData] = useState({ max: 0, data: [] });

  useEffect(() => {
    // Add global styles on mount
    addGlobalStyles();

    // Enforce absolute positioning on heatmap overlay and canvas
    if (overlayRef.current) {
      enforceAbsolutePosition(overlayRef.current);
      const canvas = overlayRef.current.querySelector('canvas');
      if (canvas) {
        enforceAbsolutePosition(canvas);
      }
    }
  }, [overlayRef.current]);
  
  // Update dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (overlayRef.current) {
        const { offsetWidth, offsetHeight } = overlayRef.current;
        setContainerDimensions({ width: offsetWidth, height: offsetHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);


    // Heatmap logic
    useEffect(() => {
      if (showHeatmap && overlayRef.current && containerDimensions.width > 0 && containerDimensions.height > 0) {
        if (!heatmapInstanceRef.current) {
          heatmapInstanceRef.current = h337.create({
            container: overlayRef.current,
            radius: 40,
            maxOpacity: 1,
            minOpacity: 0.3,
            blur: 0.85,
            gradient: { '.3': 'blue', '.65': 'yellow', '1': 'red' }
          });
        }
  
        const newHeatmapData = {
          max: activeSubjects.length,
          data: activeSubjects.flatMap(subject => {
            const subjectData = eyeGazeData[subject] || [];
            const latestEntry = subjectData.find(entry => entry.relative_timestamp <= currentTime);
            if (latestEntry) {
              return [{
                x: Math.round(latestEntry.gaze_x * containerDimensions.width),
                y: Math.round(latestEntry.gaze_y * containerDimensions.height),
                value: 1
              }];
            }
            return [];
          })
        };
  
        heatmapInstanceRef.current.setData(newHeatmapData);
      } else if (!showHeatmap && heatmapInstanceRef.current) {
        heatmapInstanceRef.current.setData({ max: 0, data: [] });
      }
    }, [eyeGazeData, activeSubjects, currentTime, showHeatmap, containerDimensions]);  

  // Calculate gaze positions with historySamples
  const getCurrentGazePositions = () => {
    return activeSubjects.map((subject) => {
      const subjectData = eyeGazeData[subject];

      // Handle undefined or empty data
      if (!subjectData || subjectData.length === 0) {
        return null;  // Return null to skip this subject
      }

      // If historySamples is 0, just return the latest position
      const gazeHistory = historySamples > 0 
        ? subjectData.filter(entry => entry.relative_timestamp <= currentTime).slice(-historySamples)
        : [subjectData[subjectData.length - 1]];  // Just the latest position
      
      // Map gaze history to positions
      const positions = gazeHistory.map(gaze => ({
        x: gaze.gaze_x * 100,  // Scale to 0-100 for the SVG viewBox
        y: gaze.gaze_y * 100,
        relative_timestamp: gaze.relative_timestamp,
      }));

      return { subject, positions };
    }).filter(Boolean); // Remove invalid entries (e.g., null from missing data)
  };

  const gazePositions = getCurrentGazePositions();

  return (
    <>
      {/* Heatmap container */}
      <div
        ref={overlayRef}
        style={{
          position: 'absolute',  // Explicitly set to absolute here
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      />
      
      {/* Render gaze history lines */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1001,
          pointerEvents: 'none',
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {gazePositions.map((gaze, index) => (
          <g key={gaze.subject}>
            {gaze.positions.length > 1 && gaze.positions.map((pos, idx) => (
              idx > 0 && (
                <line
                  key={`line-${gaze.subject}-${idx}`}
                  x1={`${gaze.positions[idx - 1].x}%`}
                  y1={`${gaze.positions[idx - 1].y}%`}
                  x2={`${pos.x}%`}
                  y2={`${pos.y}%`}
                  stroke={`hsl(${index * 137.5 % 360}, 70%, 50%)`}
                  strokeWidth="1"
                  opacity="0.8"
                />
              )
            ))}
          </g>
        ))}
      </svg>

      {/* Render the current gaze dots */}
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
              zIndex: 1002,
            }}
          />
        )
      ))}
    </>
  );
};


const VideoPlayerWithEyeGaze = (props) => {
  const { videoUrl, eyeGazeData, activeSubjects, historySamples, showHeatmap } = props.args;
  const [currentTime, setCurrentTime] = useState(0);

  const handleTimeUpdate = (current) => {
    setCurrentTime(current);
    Streamlit.setComponentValue({ currentTime: current });
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
        showHeatmap={showHeatmap}
      />
    </div>
  );
};

export default withStreamlitConnection(VideoPlayerWithEyeGaze);
