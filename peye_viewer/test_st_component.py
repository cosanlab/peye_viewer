import streamlit as st
from st_video_overlay import st_video_overlay

# Hardcoded test video URL and eye-tracking data
video_url = "https://svelte-rating-public.s3.amazonaws.com/originals/FNL/FNL_01_720.mp4"

# Dummy eye-tracking data
test_data = [
    {"SID": "1", "gaze_x_norm": 0.5, "gaze_y_norm": 0.5, "relative_timestamp": 0},
    {"SID": "1", "gaze_x_norm": 0.6, "gaze_y_norm": 0.4, "relative_timestamp": 1},
    {"SID": "2", "gaze_x_norm": 0.4, "gaze_y_norm": 0.6, "relative_timestamp": 2},
]

# Directly use the custom component with the test data
st_video_overlay(
    video_url=video_url,
    filtered_data=test_data,  # Pass hardcoded data
    selected_subjects=["1", "2"],
)
