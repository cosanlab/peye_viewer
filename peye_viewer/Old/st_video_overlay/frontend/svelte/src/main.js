import App from './App.svelte';
import { Streamlit } from "streamlit-component-lib";

const app = new App({
    target: document.body,
    props: {
        videoUrl: "",
        eyeData: []
    }
});

// Listen for Streamlit events
Streamlit.events.addEventListener(Streamlit.RENDER_EVENT, (event) => {
    const data = event.detail;

    // Update the app's props based on the data received from Streamlit
    app.$set({
        videoUrl: data.args.videoUrl,
        eyeData: data.args.eyeData
    });

    // Log to check data passed from Streamlit
    console.log('Data received from Streamlit:', data.args);

    // Let Streamlit know the component is ready
    Streamlit.setFrameHeight();
});

// Initialize Streamlit component
Streamlit.setComponentReady();
Streamlit.setFrameHeight();

export default app;
