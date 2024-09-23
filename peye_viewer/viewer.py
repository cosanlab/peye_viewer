import streamlit as st
import pandas as pd
import os
from streamlit_eye_gaze import video_player_with_eye_gaze

# Constants
BASE_DIR = "/Users/lukechang/Dropbox/FNL_Eyetracking"
DATA_FILE = os.path.join(BASE_DIR, "Data", "combined_dfs_0908_24hz.csv")
VIDEO_URL = "https://svelte-rating-public.s3.amazonaws.com/originals/FNL/FNL_01_720.mp4"
EYE_GAZE_WINDOW_SIZE = 3


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
    if "gaze_detected" in data.columns:
        data = data.loc[data["gaze_detected"]]
    data = data.astype(
        {"gaze_x": float, "gaze_y": float, "relative_timestamp": float, "SID": str}
    )
    return data[["SID", "gaze_x", "gaze_y", "relative_timestamp"]]


# Function to get gaze data
@st.cache_data(ttl=2)
def get_eye_gaze_chunk(data, subjects, current_time, window_size=1):
    start_time = max(current_time - window_size, 0)
    end_time = current_time + window_size
    filtered_data = data[
        (data["SID"].isin(subjects))
        & (data["relative_timestamp"] >= start_time)
        & (data["relative_timestamp"] <= end_time)
    ]

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


# Initialize session state
def initialize_session_state():
    if "data" not in st.session_state:
        st.session_state.data = load_data()
    if "video_player_key" not in st.session_state:
        st.session_state.video_player_key = "video_player_1"
    if "active_subjects" not in st.session_state:
        st.session_state.active_subjects = list(
            st.session_state.data["SID"].unique()
        )  # Set all subjects by default
    if "chunk_request" not in st.session_state:
        st.session_state.chunk_request = {"currentTime": 0}
    if "current_time" not in st.session_state:
        st.session_state.current_time = 0
    if "gaze_data" not in st.session_state:
        st.session_state.gaze_data = None
    if "last_current_time" not in st.session_state:
        st.session_state.last_current_time = None  # Used to detect stale values
    if "history_samples" not in st.session_state:
        st.session_state.history_samples = 0  # Initialize the slider value
    if "show_heatmap" not in st.session_state:
        st.session_state.show_heatmap = False


# Sidebar for subject selection
# Sidebar for subject selection
def render_sidebar():
    st.sidebar.title("Gaze Data Visualization")

    # Add the heatmap toggle checkbox
    st.session_state.show_heatmap = st.sidebar.checkbox("Show Heatmap", value=False)

    st.session_state.history_samples = st.sidebar.slider(
        "Eye Gaze History Samples", min_value=0, max_value=30, value=0
    )

    st.sidebar.title("Subject Selection")
    subjects = st.session_state.data["SID"].unique()

    # Use a callback to update the session state when subjects are selected
    def update_active_subjects():
        st.session_state.active_subjects = st.session_state.selected_subjects

    # Set all subjects as the default selected options
    st.sidebar.multiselect(
        "Select Subjects",
        options=subjects,
        default=list(subjects),  # Select all subjects by default
        key="selected_subjects",
        on_change=update_active_subjects,
    )


# Handle video player interaction
def handle_video_player():
    video_container = st.empty()

    with video_container:
        component_value = video_player_with_eye_gaze(
            VIDEO_URL,
            st.session_state.gaze_data if st.session_state.gaze_data else {},
            st.session_state.active_subjects,
            st.session_state.history_samples,
            show_heatmap=st.session_state.show_heatmap,  # Toggle heatmap based on checkbox
            key=st.session_state.video_player_key,
        )

    if component_value and "currentTime" in component_value:
        new_current_time = component_value["currentTime"]

        # Only update if current time changes and prevent stale time use
        if (
            new_current_time != st.session_state.current_time
            and new_current_time != st.session_state.last_current_time
        ):
            st.session_state.current_time = new_current_time
            st.session_state.last_current_time = new_current_time

            st.session_state.gaze_data = get_eye_gaze_chunk(
                st.session_state.data,
                st.session_state.active_subjects,
                st.session_state.current_time,
                window_size=EYE_GAZE_WINDOW_SIZE,
            )

            st.session_state.chunk_request = {
                "gaze_data": st.session_state.gaze_data,
                "currentTime": st.session_state.current_time,
            }

    return st.session_state.chunk_request


# Main function
def main():
    initialize_session_state()
    render_sidebar()

    if st.session_state.active_subjects:
        handle_video_player()


if __name__ == "__main__":
    main()
