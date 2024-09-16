import streamlit as st
import pandas as pd
import os
from streamlit_eye_gaze import video_player_with_eye_gaze


# Load and preprocess eye-tracking data
@st.cache_data
def load_data():
    base_dir = "/Users/lukechang/Dropbox/FNL_Eyetracking"
    data_file = os.path.join(base_dir, "Data", "combined_dfs_0908.csv")
    data = pd.read_csv(data_file, index_col=0)
    data = data.rename(
        columns={
            "section id": "section_id",
            "recording id": "recording_id",
            "gaze detected on surface": "gaze_detected",
        }
    )
    data.dropna(inplace=True)
    data["gaze_x"] = data["gaze_x"].astype(float)
    data["gaze_y"] = data["gaze_y"].astype(float)
    data["relative_timestamp"] = data["relative_timestamp"].astype(float)
    data = data.loc[data["gaze_detected"]]
    data["SID"] = data["SID"].astype(str)
    return data[["SID", "gaze_x", "gaze_y", "relative_timestamp"]]


# Add this function to update eye gaze data:
@st.cache_data
def get_eye_gaze_chunk(data, subjects, start_time, end_time):
    chunk = data[
        data["SID"].isin(subjects)
        & (data["relative_timestamp"] >= start_time)
        & (data["relative_timestamp"] < end_time)
    ]
    return {
        subject: chunk[chunk["SID"] == subject][
            ["gaze_x", "gaze_y", "relative_timestamp"]
        ].to_dict("records")
        for subject in subjects
    }


# Add code to get initial data
data = load_data()

# Get unique subjects
subjects = data["SID"].unique()

st.title("Video Player with Multi-Subject Eye Gaze Overlay")

# Sidebar for subject selection
st.sidebar.title("Subject Selection")
active_subjects = []
for i, subject in enumerate(subjects):
    if st.sidebar.checkbox(f"Subject {subject}", value=(i == 0)):
        active_subjects.append(subject)

video_url = "https://svelte-rating-public.s3.amazonaws.com/originals/FNL/FNL_01_720.mp4"

# Get the time range for the initial chunk (e.g., first 60 seconds)
start_time = 0
end_time = 60

# Get the initial chunk of eye gaze data
initial_eye_gaze_data = get_eye_gaze_chunk(data, active_subjects, start_time, end_time)

chunk_request = video_player_with_eye_gaze(
    video_url, initial_eye_gaze_data, active_subjects
)

# Update eye gaze data if a new chunk is requested
if chunk_request is not None and isinstance(chunk_request, dict):
    start_time = chunk_request.get("start", 0)
    end_time = chunk_request.get("end", 60)
    new_eye_gaze_data = get_eye_gaze_chunk(data, active_subjects, start_time, end_time)
    # Update the component with the new data
    video_player_with_eye_gaze(video_url, new_eye_gaze_data, active_subjects)
