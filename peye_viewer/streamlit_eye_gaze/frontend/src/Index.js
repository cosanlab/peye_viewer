import { Streamlit, StreamlitComponentBase, withStreamlitConnection } from "streamlit-component-lib";
import React from "react";
import ReactDOM from "react-dom";
import VideoPlayerWithEyeGaze from "./VideoPlayerWithEyeGaze";

class VideoPlayerWithEyeGazeWrapper extends StreamlitComponentBase {
  // This method updates the component based on Streamlit's event changes
  componentDidMount() {
    Streamlit.setComponentReady();
    Streamlit.setFrameHeight();
  }

  componentDidUpdate() {
    Streamlit.setFrameHeight();
  }

  render() {
    const { videoUrl, eyeGazeData, activeSubjects } = this.props.args;
    console.log(videoUrl, eyeGazeData, activeSubjects);  // Add this line to debug the received props
    return (
      <VideoPlayerWithEyeGaze
        videoUrl={videoUrl}
        eyeGazeData={eyeGazeData}
        activeSubjects={activeSubjects}
      />
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
