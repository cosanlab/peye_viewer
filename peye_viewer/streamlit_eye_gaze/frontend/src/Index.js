import { Streamlit, StreamlitComponentBase, withStreamlitConnection } from "streamlit-component-lib";
import React from "react";
import ReactDOM from "react-dom";
import VideoPlayerWithEyeGaze from "./VideoPlayerWithEyeGaze"; // Correct import path

class VideoPlayerWithEyeGazeWrapper extends StreamlitComponentBase {
  state = {
    currentTime: 0,
  };

  componentDidMount() {
    if (typeof Streamlit !== 'undefined') {
      Streamlit.setComponentReady();
    }
    Streamlit.setFrameHeight();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.args.eyeGazeData !== this.props.args.eyeGazeData) {
      console.log('Updated eyeGazeData in component:', this.props.args.eyeGazeData);
      this.setState({ eyeGazeData: this.props.args.eyeGazeData });
    }

    if (prevProps.args.currentTime !== this.props.args.currentTime) {
      console.log('Current time updated in component:', this.props.args.currentTime);
      this.setState({ currentTime: this.props.args.currentTime });
    }

    Streamlit.setFrameHeight();
  }

  handleTimeUpdate = (currentTime) => {
    this.setState({ currentTime });

    if (typeof Streamlit !== 'undefined') {
      console.log(`Sending current time to Streamlit: ${currentTime}`);
      Streamlit.setComponentValue({ currentTime });
    } else {
      console.error('Streamlit is not defined');
    }

    console.log('Updated state currentTime:', this.state.currentTime);
  };

  render() {
    const { videoUrl, eyeGazeData, activeSubjects } = this.props.args;
    console.log("Video URL received from Streamlit:", videoUrl);

    return (
      <div style={{ position: 'relative' }}>
        <VideoPlayerWithEyeGaze
          videoUrl={videoUrl} // Ensure this prop is correctly passed
          eyeGazeData={eyeGazeData}
          activeSubjects={activeSubjects}
          onTimeUpdate={this.handleTimeUpdate}
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
