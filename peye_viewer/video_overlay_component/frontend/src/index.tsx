import React from "react";
import ReactDOM from "react-dom";
import MyComponent from "./MyComponent";
import { Streamlit } from "streamlit-component-lib";

Streamlit.setComponentReady();

// Listen for events from Streamlit
Streamlit.events.addEventListener("render", (event) => {
  const { videoUrl, eyeData } = event.detail.args;

  ReactDOM.render(
    <React.StrictMode>
      <MyComponent videoUrl={videoUrl} eyeData={eyeData} />
    </React.StrictMode>,
    document.getElementById("root")
  );
});

// Render the component with empty props initially
ReactDOM.render(
  <React.StrictMode>
    <MyComponent videoUrl="" eyeData={[]} />
  </React.StrictMode>,
  document.getElementById("root")
);
