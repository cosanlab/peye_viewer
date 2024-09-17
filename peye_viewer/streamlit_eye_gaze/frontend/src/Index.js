import { Streamlit, StreamlitComponentBase, withStreamlitConnection } from "streamlit-component-lib";
import React from "react";
import ReactDOM from "react-dom";
import VideoPlayerWithEyeGaze from "./VideoPlayerWithEyeGaze";

class VideoPlayerWithEyeGazeWrapper extends StreamlitComponentBase {
  // State to keep track of the current video time
  state = {
    currentTime: 0
  };

  // This method updates the component based on Streamlit's event changes
  componentDidMount() {
    if (typeof Streamlit !== 'undefined') {
        Streamlit.setComponentReady();
    }
    Streamlit.setFrameHeight();
}   

componentDidUpdate(prevProps) {
    // Update the gaze overlay when the gaze data changes
    if (prevProps.args.eyeGazeData !== this.props.args.eyeGazeData) {
        console.log('Updated eyeGazeData in component:', this.props.args.eyeGazeData); // Debug log
        this.setState({ eyeGazeData: this.props.args.eyeGazeData });
    }

    // Trigger overlay update on new gaze data or time update
    if (prevProps.args.currentTime !== this.props.args.currentTime) {
        console.log('Current time updated in component:', this.props.args.currentTime); // Debug log
        this.setState({ currentTime: this.props.args.currentTime });
    }

    Streamlit.setFrameHeight();
}

// Callback to receive the current time from the VideoPlayerWithEyeGaze component
handleTimeUpdate = (currentTime) => {
    this.setState({ currentTime });

    // Safeguard: Check if Streamlit is defined
    if (typeof Streamlit !== 'undefined') {
        console.log(`Sending current time to Streamlit: ${currentTime}`); // Debug statement
        Streamlit.setComponentValue({ currentTime });
    } else {
        console.error('Streamlit is not defined'); // Error logging
    }

    // Log to see if the time is correctly updating in the state
    console.log('Updated state currentTime:', this.state.currentTime);
}

  render() {
    const { videoUrl, eyeGazeData, activeSubjects } = this.props.args;

    return (
      <div style={{ position: 'relative' }}>
        <VideoPlayerWithEyeGaze
          videoUrl={videoUrl}
          eyeGazeData={eyeGazeData}
          activeSubjects={activeSubjects}
          onTimeUpdate={this.handleTimeUpdate} // Pass the callback
        />
      </div>
    );
  }
}

const VideoPlayerWithEyeGazeComponent = withStreamlitConnection(VideoPlayerWithEyeGazeWrapper);

ReactDOM.render(
  <React.StrictMode>
    <VideoPlayerWithEyeGazeComponent />
  </React.StrictMode>,
  document.getElementById("root")
);

