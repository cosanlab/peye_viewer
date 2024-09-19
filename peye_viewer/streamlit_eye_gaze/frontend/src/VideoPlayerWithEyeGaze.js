import React, { useRef, useState, useEffect } from 'react';
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


// Define VideoPlayer component
const VideoPlayer = ({ videoUrl, onTimeUpdate }) => {
  const playerRef = useRef(null);

  useEffect(() => {
    // Initialize Video.js player without any conditions
    const videoJsPlayer = videojs(playerRef.current, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true,
      sources: [{ src: videoUrl, type: 'video/mp4' }],
    });

    // Time update event
    videoJsPlayer.on('timeupdate', () => {
      const current = videoJsPlayer.currentTime();
      console.log(`Current time from video player: ${current}`);
      onTimeUpdate(current);
      if (typeof Streamlit !== 'undefined') {
        Streamlit.setComponentValue({ currentTime: current });
      }
    });

    // Cleanup the player on unmount
    return () => {
      if (videoJsPlayer) {
        videoJsPlayer.dispose();
      }
    };
  }, [videoUrl, onTimeUpdate]); // Only run on component mount and when videoUrl changes

  return (
    <div data-vjs-player>
      <video ref={playerRef} className="video-js vjs-default-skin" playsInline />
    </div>
  );
};


// Define VideoPlayerWithEyeGaze component
const VideoPlayerWithEyeGaze = ({ videoUrl, eyeGazeData, activeSubjects, onTimeUpdate }) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    setCurrentTime(currentTime);
  }, [eyeGazeData]); // Ensure this effect runs when `eyeGazeData` changes

  const handleTimeUpdate = (current) => {
    setCurrentTime(current);
    if (onTimeUpdate) {
      onTimeUpdate(current);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: '300px', minHeight: '200px', resize: 'both', overflow: 'auto' }}>
      <VideoPlayer videoUrl={videoUrl} onTimeUpdate={handleTimeUpdate} />
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
