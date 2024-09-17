import streamlit as st
import pandas as pd
import os
from streamlit_eye_gaze import video_player_with_eye_gaze

# Constants
BASE_DIR = "/Users/lukechang/Dropbox/FNL_Eyetracking"
DATA_FILE = os.path.join(BASE_DIR, "Data", "combined_dfs_0908.csv")
VIDEO_URL = "https://svelte-rating-public.s3.amazonaws.com/originals/FNL/FNL_01_720.mp4"


# Load and preprocess eye-tracking data
@st.cache_data
def load_data():
    data = pd.read_csv(DATA_FILE, index_col=0)
    data = data.rename(
        columns={
            "section id": "section_id",
            "recording id": "recording_id",
            "gaze detected on surface": "gaze_detected",
        }
    )
    data.dropna(inplace=True)
    data = data.loc[data["gaze_detected"]]
    data = data.astype(
        {"gaze_x": float, "gaze_y": float, "relative_timestamp": float, "SID": str}
    )
    return data[["SID", "gaze_x", "gaze_y", "relative_timestamp"]]


# Initialize session state
def initialize_session_state():
    if "data" not in st.session_state:
        st.session_state.data = load_data()
    if "video_player_key" not in st.session_state:
        st.session_state.video_player_key = "video_player_1"
    if "active_subjects" not in st.session_state:
        st.session_state.active_subjects = []
    if "chunk_request" not in st.session_state:
        st.session_state.chunk_request = {"currentTime": 0}
    if "current_time" not in st.session_state:
        st.session_state.current_time = 0
    if "gaze_data" not in st.session_state:
        st.session_state.gaze_data = None


# Sidebar for subject selection
def render_sidebar():
    st.sidebar.title("Subject Selection")
    subjects = st.session_state.data["SID"].unique()
    selected_subjects = st.sidebar.multiselect(
        "Select Subjects", options=subjects, default=st.session_state.active_subjects
    )
    st.session_state.active_subjects = selected_subjects


# Function to get gaze data
def get_eye_gaze_chunk(data, subjects, start_time, end_time):
    # Filter data based on the selected subjects and time window
    filtered_data = data[
        (data["SID"].isin(subjects))
        & (data["relative_timestamp"] >= start_time)
        & (data["relative_timestamp"] <= end_time)
    ]

    # Format the data as a dictionary
    gaze_data_dict = {}
    for subject in subjects:
        subject_data = filtered_data[filtered_data["SID"] == subject]
        gaze_entries = [
            {
                "gaze_x": row["gaze_x"],
                "gaze_y": row["gaze_y"],
                "relative_timestamp": row["relative_timestamp"],
            }
            for _, row in subject_data.iterrows()
        ]
        gaze_data_dict[subject] = gaze_entries

    return gaze_data_dict


# Function to handle video player and gaze data
def handle_video_player():
    # Create a placeholder for the video player
    video_container = st.empty()

    # Always render the video player
    with video_container:
        # Update the video player without changing the key to avoid re-render
        component_value = video_player_with_eye_gaze(
            VIDEO_URL,
            st.session_state.gaze_data
            if st.session_state.gaze_data
            else {},  # Use the current gaze data
            st.session_state.active_subjects,
            key=st.session_state.video_player_key,  # Maintain the same key to prevent re-rendering
        )

    # Check if the component returned a new current time
    if component_value and "currentTime" in component_value:
        new_current_time = component_value["currentTime"]
        if new_current_time != st.session_state.current_time:
            # Update current time
            st.session_state.current_time = new_current_time

            # Fetch the gaze data chunk for the current time
            start_time = max(st.session_state.current_time - 0.5, 0)
            end_time = st.session_state.current_time + 0.5
            st.session_state.gaze_data = get_eye_gaze_chunk(
                st.session_state.data,
                st.session_state.active_subjects,
                start_time,
                end_time,
            )

            # Update the component's session state with new gaze data
            st.session_state.chunk_request = {
                "gaze_data": st.session_state.gaze_data,
                "currentTime": st.session_state.current_time,
            }

    # Send the updated gaze data to the frontend via component_value (chunk_request)
    # Return the chunk request to ensure frontend is aware of changes
    return st.session_state.chunk_request


# Main function
def main():
    initialize_session_state()
    render_sidebar()

    # Handle video player interaction
    handle_video_player()

    # Debug logs
    st.write(f"current time: {st.session_state.current_time}")
    st.write(f"chunk_request in session_state: {st.session_state.chunk_request}")
    st.write(f"Current subjects: {st.session_state.active_subjects}")


if __name__ == "__main__":
    main()
