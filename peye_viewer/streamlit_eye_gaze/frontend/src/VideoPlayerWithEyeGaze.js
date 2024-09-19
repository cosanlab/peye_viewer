import React, { useRef, useEffect, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { Streamlit, withStreamlitConnection } from "streamlit-component-lib";

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// Define VideoPlayer component
const VideoPlayer = ({ videoUrl, onTimeUpdate, onDebouncedTimeUpdate }) => {
  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null); // Ref to store the Video.js player instance

  useEffect(() => {
    // Initialize Video.js player only if the player is not already initialized
    if (playerRef.current && !playerInstanceRef.current) {
      playerInstanceRef.current = videojs(playerRef.current, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
        sources: [{ src: videoUrl, type: 'video/mp4' }],
      });

      // Time update event
      playerInstanceRef.current.on('timeupdate', () => {
        const current = playerInstanceRef.current.currentTime();
        onTimeUpdate(current);
        // Debounced call to update backend
        onDebouncedTimeUpdate(current);
      });

      // Error handling for media errors
      playerInstanceRef.current.on('error', () => {
        console.error(`Video.js error: ${playerInstanceRef.current.error().message}`);
      });
    }

    // Cleanup function to dispose of the video player
    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.dispose();
        playerInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div data-vjs-player>
      <video
        ref={playerRef}
        className="video-js vjs-default-skin"
        playsInline
      >
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
  // Ensure activeSubjects is an array
  activeSubjects = activeSubjects || [];

  const getCurrentGazePositions = () => {
    // Ensure eyeGazeData is an object
    if (!eyeGazeData || typeof eyeGazeData !== 'object') {
      return [];
    }

    // Map over activeSubjects
    return activeSubjects.map(subject => {
      const subjectData = eyeGazeData[subject];
      if (!subjectData || subjectData.length === 0) return null;

      // Find the closest timestamp
      const closestPoint = subjectData.reduce((prev, curr) => {
        return Math.abs(curr.relative_timestamp - currentTime) < Math.abs(prev.relative_timestamp - currentTime) ? curr : prev;
      });

      // Calculate positions relative to video dimensions
      const left = `${(closestPoint.gaze_x * 100).toFixed(2)}%`;
      const top = `${(closestPoint.gaze_y * 100).toFixed(2)}%`;

      return {
        subject,
        left,
        top,
      };
    }).filter(Boolean); // Filter out any null values
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

  // Debounced time update function for backend communication
  const debouncedTimeUpdate = debounce((current) => {
    if (typeof Streamlit !== 'undefined') {
      Streamlit.setComponentValue({ currentTime: current });
    }
  }, 500); // 500ms debounce delay

  const handleTimeUpdate = (current) => {
    setCurrentTime(current);
    if (onTimeUpdate) {
      onTimeUpdate(current);
    }
  };

  // Add continuous request for next chunk of gaze data
  useEffect(() => {
    const intervalId = setInterval(() => {
      Streamlit.setComponentValue({ currentTime });
    }, 1000); // Trigger request every second to keep fetching new gaze data

    return () => clearInterval(intervalId); // Clear interval when component is unmounted
  }, [currentTime]); // This effect runs when currentTime changes

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: '300px', minHeight: '200px', resize: 'both', overflow: 'auto' }}>
      <VideoPlayer 
        videoUrl={videoUrl} 
        onTimeUpdate={handleTimeUpdate} 
        onDebouncedTimeUpdate={debouncedTimeUpdate} // Pass the debounced callback
      />
      <GazeOverlay eyeGazeData={eyeGazeData} activeSubjects={activeSubjects} currentTime={currentTime} />
    </div>
  );
};

export default withStreamlitConnection(VideoPlayerWithEyeGaze);

// import React, { useRef, useState, useEffect } from 'react';
// import videojs from 'video.js';
// import 'video.js/dist/video-js.css';
// import { Streamlit, StreamlitComponentBase, withStreamlitConnection } from "streamlit-component-lib";

// // Debounce function to limit how often the backend is updated
// const debounce = (func, delay) => {
//   let timeoutId;
//   return (...args) => {
//     if (timeoutId) {
//       clearTimeout(timeoutId);
//     }
//     timeoutId = setTimeout(() => {
//       func(...args);
//     }, delay);
//   };
// };

// // Video Player Component
// const VideoPlayer = ({ videoUrl, onTimeUpdate }) => {
//   const playerRef = useRef(null);

//   useEffect(() => {
//     // Initialize Video.js player
//     const player = videojs(playerRef.current, {
//       controls: true,
//       autoplay: false,
//       preload: 'auto',
//       fluid: true,
//       sources: [{ src: videoUrl, type: 'video/mp4' }],
//     });

//     // Debounced time update to limit backend calls
//     const debouncedTimeUpdate = debounce((current) => {
//       if (onTimeUpdate) {
//           console.log(`Sending current time to Streamlit: ${current}`);
//           onTimeUpdate(current);
//           Streamlit.setComponentValue({ currentTime: current });
//       }
//   }, 1000); // Increase delay to reduce backend calls
  
        
//     // Update current time
//     player.on('timeupdate', () => {
//       const current = player.currentTime();
//       console.log(`Current time from video player: ${current}`); // Debug statement
//       debouncedTimeUpdate(current);
//     });

//     // Cleanup the player on unmount
//     return () => {
//       if (player) {
//         player.dispose();
//       }
//     };
//   }, [videoUrl]); // Only reinitialize the player if videoUrl changes

//   // Ensure this return is inside the component function
//   return (
//     <div data-vjs-player>
//       <video ref={playerRef} className="video-js vjs-default-skin" playsInline />
//     </div>
//   );
// };


// // Gaze Overlay Component
// const GazeOverlay = ({ eyeGazeData, activeSubjects, currentTime }) => {
//   const getCurrentGazePositions = () => {
//     return activeSubjects.map(subject => {
//         const subjectData = eyeGazeData[subject];
//         if (!subjectData || subjectData.length === 0) return null;

//         // Find the closest timestamp within the pre-fetched chunk
//         const closestPoint = subjectData.reduce((prev, curr) => {
//             return Math.abs(curr.relative_timestamp - currentTime) < Math.abs(prev.relative_timestamp - currentTime) ? curr : prev;
//         });

//         // Calculate positions relative to video dimensions
//         const left = `${(closestPoint.gaze_x * 100).toFixed(2)}%`;
//         const top = `${(closestPoint.gaze_y * 100).toFixed(2)}%`;

//         return {
//             subject,
//             left,
//             top,
//         };
//     }).filter(Boolean);
// };


//   const gazePositions = getCurrentGazePositions();
  
//   console.log('Rendering Gaze Overlay:', gazePositions); // Debug statement

//   return (
//     <>
//       {gazePositions.map((gaze, index) => (
//         <div
//           key={gaze.subject}
//           style={{
//             position: 'absolute',
//             width: '10px',
//             height: '10px',
//             borderRadius: '50%',
//             backgroundColor: `hsl(${index * 137.5 % 360}, 70%, 50%)`,
//             left: gaze.left,
//             top: gaze.top,
//             transform: 'translate(-50%, -50%)',
//             pointerEvents: 'none',
//             zIndex: 2,
//           }}
//         />
//       ))}
//     </>
//   );
// };

// // Main Component combining both
// const VideoPlayerWithEyeGaze = ({ videoUrl, eyeGazeData, activeSubjects, onTimeUpdate }) => {
//   const [currentTime, setCurrentTime] = useState(0);

//   useEffect(() => {
//     // Trigger a re-render when currentTime or eyeGazeData changes
//     setCurrentTime(currentTime);
// }, [eyeGazeData, currentTime]); // Include currentTime to ensure re-renders

// const handleTimeUpdate = (current) => {
//     setCurrentTime(current); // Update the currentTime state
//     if (onTimeUpdate) {
//         onTimeUpdate(current); // Send the current time to Streamlit
//     }
// };

//   console.log('Received eyeGazeData:', eyeGazeData); // Debug statement
//   console.log('Current Time in Video Player:', currentTime); // Debug statement

//   return (
//     <div style={{ position: 'relative', width: '100%', minWidth: '300px', minHeight: '200px', resize: 'both', overflow: 'auto' }}>
//       <VideoPlayer videoUrl={videoUrl} onTimeUpdate={handleTimeUpdate} />
//       <GazeOverlay eyeGazeData={eyeGazeData} activeSubjects={activeSubjects} currentTime={currentTime} />
//     </div>
//   );
// };

// export default VideoPlayerWithEyeGaze;
