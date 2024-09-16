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


# import streamlit as st
# import pandas as pd
# import os
# from streamlit_eye_gaze import video_player_with_eye_gaze


# # Load and preprocess eye-tracking data
# @st.cache_data
# def load_data():
#     base_dir = "/Users/lukechang/Dropbox/FNL_Eyetracking"
#     data_file = os.path.join(base_dir, "Data", "combined_dfs_0908.csv")
#     data = pd.read_csv(data_file, index_col=0)
#     data = data.rename(
#         columns={
#             "section id": "section_id",
#             "recording id": "recording_id",
#             "gaze detected on surface": "gaze_detected",
#         }
#     )
#     data.dropna(inplace=True)
#     data["gaze_x"] = data["gaze_x"].astype(float)
#     data["gaze_y"] = data["gaze_y"].astype(float)
#     data["relative_timestamp"] = data["relative_timestamp"].astype(float)
#     data = data.loc[data["gaze_detected"]]
#     data["SID"] = data["SID"].astype(str)
#     return data[["SID", "gaze_x", "gaze_y", "relative_timestamp"]]


# @st.cache_data
# def get_eye_gaze_chunk(data, subjects, start_time, end_time):
#     chunk = data[
#         data["SID"].isin(subjects)
#         & (data["relative_timestamp"] >= start_time)
#         & (data["relative_timestamp"] < end_time)
#     ]
#     return {
#         subject: chunk[chunk["SID"] == subject][
#             ["gaze_x", "gaze_y", "relative_timestamp"]
#         ].to_dict("records")
#         for subject in subjects
#     }


# data = load_data()

# # Get unique subjects
# subjects = data["SID"].unique()

# st.title("Video Player with Multi-Subject Eye Gaze Overlay")

# # Sidebar for subject selection
# st.sidebar.title("Subject Selection")
# active_subjects = []
# for i, subject in enumerate(subjects):
#     if st.sidebar.checkbox(f"Subject {subject}", value=(i == 0)):
#         active_subjects.append(subject)

# video_url = "https://svelte-rating-public.s3.amazonaws.com/originals/FNL/FNL_01_720.mp4"

# # Get the time range for the initial chunk (e.g., first 60 seconds)
# start_time = 0
# end_time = 60

# # Get the initial chunk of eye gaze data
# initial_eye_gaze_data = get_eye_gaze_chunk(data, active_subjects, start_time, end_time)

# # Use the custom component
# video_player_with_eye_gaze(
#     video_url=video_url,
#     eye_gaze_data=initial_eye_gaze_data,  # Dictionary as expected by the component
#     active_subjects=active_subjects,  # List of active subjects
# )


# # Function to update eye gaze data (to be called from JavaScript)
# def update_eye_gaze_data(start_time, end_time):
#     return get_eye_gaze_chunk(data, active_subjects, start_time, end_time)


# # Register the update function with Streamlit
# st.session_state.update_eye_gaze_data = update_eye_gaze_data


# import streamlit as st
# from streamlit_eye_gaze import video_player_with_eye_gaze

# video_url = "https://svelte-rating-public.s3.amazonaws.com/originals/FNL/FNL_01_720.mp4"
# filtered_data = [
#     {"gaze_x_norm": 0.5, "gaze_y_norm": 0.5, "timestamp": 1.0}
# ]  # Sample eye data

# st.title("Video Player with Eye Gaze Overlay")

# video_player_with_eye_gaze(video_url, filtered_data)


# import streamlit as st
# from peye_viewer.video_overlay_component import video_overlay_component


# # Sample data for testing
# video_url = "https://svelte-rating-public.s3.amazonaws.com/originals/FNL/FNL_01_720.mp4"
# filtered_data = [
#     {"gaze_x_norm": 0.5, "gaze_y_norm": 0.5, "timestamp": 1.0}
# ]  # Sample eye data
# selected_subjects = ["subject1"]

# # Use the custom Streamlit component
# video_overlay_component(video_url=video_url, filtered_data=filtered_data)


# # Load and preprocess eye-tracking data
# base_dir = "/Users/lukechang/Dropbox/FNL_Eyetracking"
# data_file = os.path.join(base_dir, "Data", "combined_dfs_0908.csv")
# data = pd.read_csv(data_file, index_col=0)
# data = data.rename(
#     columns={
#         "section id": "section_id",
#         "recording id": "recording_id",
#         "gaze detected on surface": "gaze_detected",
#     }
# )
# data.dropna(inplace=True)
# data["gaze_x"] = data["gaze_x"].astype(float)
# data["gaze_y"] = data["gaze_y"].astype(float)
# data["relative_timestamp"] = data["relative_timestamp"].astype(float)
# data = data.loc[data["gaze_detected"]]
# data["SID"] = data["SID"].astype(str)
# data = data[["SID", "gaze_x", "gaze_y", "relative_timestamp"]]


# @st.cache_data
# def load_subjects(data):
#     return sorted(data["SID"].unique())


# @st.cache_data
# def filter_data(data, selected_subjects):
#     return data[data["SID"].isin(selected_subjects)]


# # Sidebar for subject selection
# subject_ids = load_subjects(data)
# st.sidebar.title("Subject Selection")
# selected_subjects = st.sidebar.multiselect(
#     "Select subjects to display", options=subject_ids, default=subject_ids[:1]
# )


# # Use the custom component
# filtered_data = filter_data(data, selected_subjects)
# video_overlay_component(
#     video_url=video_url,
#     filtered_data=filtered_data,
#     selected_subjects=selected_subjects,
# )


# # Base directory
# base_dir = "/Users/lukechang/Dropbox/FNL_Eyetracking"

# # Load video URL
# video_url = "https://svelte-rating-public.s3.amazonaws.com/originals/FNL/FNL_01_720.mp4"

# # Load and preprocess eye-tracking data
# data_file = os.path.join(base_dir, "Data", "combined_dfs_0908.csv")
# data = pd.read_csv(data_file, index_col=0)
# data = data.rename(
#     columns={
#         "section id": "section_id",
#         "recording id": "recording_id",
#         "gaze detected on surface": "gaze_detected",
#     }
# )
# data["gaze_x"] = data["gaze_x"].astype(float)
# data["gaze_y"] = data["gaze_y"].astype(float)
# data["relative_timestamp"] = data["relative_timestamp"].astype(float)
# data = data.loc[data["gaze_detected"]]
# data["SID"] = data["SID"].astype(str)
# #     subject_data[subj_id] = group[["relative_timestamp", "gaze_x", "gaze_y"]].to_dict(
# #         orient="records"
# #     )

# # Load data and subjects
# @st.cache_data
# def load_subjects(data):
#     subject_ids = sorted(data["SID"].unique())
#     return subject_ids


# # Sidebar for subject selection
# subject_ids = load_subjects(data)

# st.sidebar.title("Subject Selection")
# selected_subjects = st.sidebar.multiselect(
#     "Select subjects to display", options=subject_ids, default=subject_ids[0]
# )

# # Use the custom component
# st_video_overlay(video_url=video_url, selected_subjects=selected_subjects)


# # Ensure required columns are present
# required_columns = {"SID", "relative_timestamp", "gaze_x", "gaze_y"}
# if not required_columns.issubset(data.columns):
#     st.error(f"Data file must contain the following columns: {required_columns}")
#     st.stop()

# # Ensure the coordinates and timestamps are floats
# data["gaze_x"] = data["gaze_x"].astype(float)
# data["gaze_y"] = data["gaze_y"].astype(float)
# data["relative_timestamp"] = data["relative_timestamp"].astype(float)

# # Drop rows when gaze isn't detected
# data = data.loc[data["gaze_detected"]]

# # Get the list of unique subject IDs
# data["SID"] = data["SID"].astype(str)
# subject_ids = sorted(data["SID"].unique())

# # Sidebar for subject selection
# st.sidebar.title("Subject Selection")
# selected_subjects = st.sidebar.multiselect(
#     "Select subjects to display",
#     options=subject_ids,
#     default=subject_ids[:1],  # Optionally select the first subject by default
# )

# if not selected_subjects:
#     st.warning("Please select at least one subject to display.")
#     st.stop()

# # Generate a list of colors
# colors = list(mcolors.TABLEAU_COLORS.values()) + list(mcolors.CSS4_COLORS.values())

# # Ensure we have enough colors
# if len(selected_subjects) > len(colors):
#     st.error("Not enough colors to assign to each subject.")
#     st.stop()

# # Create a mapping from subject ID to color
# subject_colors = {
#     subj: colors[i % len(colors)] for i, subj in enumerate(selected_subjects)
# }

# # Filter data for selected subjects
# filtered_data = data[data["SID"].isin(selected_subjects)]

# # Group data by subject
# grouped_data = filtered_data.groupby("SID")

# # Create a dictionary to hold data for each subject
# subject_data = {}

# for subj_id, group in grouped_data:
#     # Drop NaNs
#     group = group.dropna(subset=["relative_timestamp", "gaze_x", "gaze_y"])
#     # Ensure data is sorted by timestamp
#     group = group.sort_values("relative_timestamp")
#     # Convert to list of dictionaries
#     subject_data[subj_id] = group[["relative_timestamp", "gaze_x", "gaze_y"]].to_dict(
#         orient="records"
#     )

# # Convert Python dictionaries to JSON strings
# subject_data_json = json.dumps(subject_data)
# subject_colors_json = json.dumps(subject_colors)

# # Streamlit App Code
# st.title("Eye Tracking Viewer")
# # Prepare the HTML code
# html_code = f"""
# <div id="video-container" style="position: relative; display: inline-block;">
#   <video id="video" width="640" height="480" controls>
#     <source src="{video_url}" type="video/mp4">
#     Your browser does not support the video tag.
#   </video>
#   <canvas id="overlay" width="640" height="480" style="position: absolute; top: 0; left: 0; pointer-events: none;"></canvas>
# </div>

# <script>
#   var subjectData = {subject_data_json};
#   var subjectColors = {subject_colors_json};

#   var video = document.getElementById('video');
#   var canvas = document.getElementById('overlay');
#   var ctx = canvas.getContext('2d');

#   // Adjust canvas size to match video dimensions
#   video.addEventListener('loadedmetadata', function() {{
#     canvas.width = video.videoWidth;
#     canvas.height = video.videoHeight;
#   }});

#   function drawEyeTracking() {{
#     ctx.clearRect(0, 0, canvas.width, canvas.height);

#     var currentTime = video.currentTime;

#     // Loop through each subject
#     for (var subj_id in subjectData) {{
#       var eyeData = subjectData[subj_id];
#       var color = subjectColors[subj_id];

#       // Find the closest eye data point to the current time
#       var eyePoint = findClosestEyePoint(eyeData, currentTime);

#       // Draw the eye-tracking point
#       if (eyePoint) {{
#         var x = parseFloat(eyePoint.gaze_x) * canvas.width;
#         var y = parseFloat(eyePoint.gaze_y) * canvas.height;

#         ctx.beginPath();
#         ctx.arc(x, y, 10, 0, 2 * Math.PI, false);
#         ctx.fillStyle = color;
#         ctx.fill();
#       }}
#     }}
#   }}

#   // Helper function to find the closest eye data point
#   function findClosestEyePoint(eyeData, time) {{
#     let left = 0;
#     let right = eyeData.length - 1;
#     let bestMatch = eyeData[0];

#     while (left <= right) {{
#       let mid = Math.floor((left + right) / 2);
#       let delta = eyeData[mid].relative_timestamp - time;

#       if (Math.abs(delta) < Math.abs(bestMatch.relative_timestamp - time)) {{
#         bestMatch = eyeData[mid];
#       }}

#       if (delta < 0) {{
#         left = mid + 1;
#       }} else if (delta > 0) {{
#         right = mid - 1;
#       }} else {{
#         return eyeData[mid];
#       }}
#     }}
#     return bestMatch;
#   }}

#   video.addEventListener('timeupdate', drawEyeTracking);
#   video.addEventListener('pause', drawEyeTracking);
#   video.addEventListener('seeked', drawEyeTracking);
# </script>
# """

# Prepare the HTML code
# html_code = f"""
# <style>
#   /* Reset default styles */
#   #video-container, #video, #overlay {{
#     margin: 0;
#     padding: 0;
#     border: 0;
#   }}
#   #video-container {{
#     position: relative;
#     width: 100%;
#     max-width: 640px;
#     margin: 0 auto;
#     padding: 0;
#   }}
#   #video, #overlay {{
#     position: absolute;
#     top: 0;
#     left: 0;
#     width: 100%;
#     height: 100%;
#     display: block;
#     margin: 0;
#     padding: 0;
#   }}
# </style>

# <div id="video-container">
#   <video id="video" controls>
#     <source src="{video_url}" type="video/mp4">
#     Your browser does not support the video tag.
#   </video>
#   <canvas id="overlay"></canvas>
# </div>

# <script>
#   var subjectData = {subject_data_json};
#   var subjectColors = {subject_colors_json};

#   var video = document.getElementById('video');
#   var canvas = document.getElementById('overlay');
#   var ctx = canvas.getContext('2d');

#   // Function to adjust canvas size
#   function resizeCanvas() {{
#     canvas.width = video.clientWidth;
#     canvas.height = video.clientHeight;
#   }}

#   video.addEventListener('loadedmetadata', function() {{
#     resizeCanvas();
#   }});

#   window.addEventListener('resize', function() {{
#     resizeCanvas();
#   }});

#   function drawEyeTracking() {{
#     ctx.clearRect(0, 0, canvas.width, canvas.height);

#     var currentTime = video.currentTime;

#     // Loop through each subject
#     for (var subj_id in subjectData) {{
#       var eyeData = subjectData[subj_id];
#       var color = subjectColors[subj_id];

#       // Find the closest eye data point to the current time
#       var eyePoint = findClosestEyePoint(eyeData, currentTime);

#       // Draw the eye-tracking point
#       if (eyePoint) {{
#         var x = parseFloat(eyePoint.gaze_x_norm) * canvas.width;
#         var y = (parseFloat(eyePoint.gaze_y_norm)) * canvas.height; // Invert y-axis if necessary

#         // Ensure coordinates are within bounds
#         if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {{
#           ctx.beginPath();
#           ctx.arc(x, y, 10, 0, 2 * Math.PI, false);
#           ctx.fillStyle = color;
#           ctx.fill();
#         }}
#       }}
#     }}
#   }}

#   // Helper function to find the closest eye data point
#   function findClosestEyePoint(eyeData, time) {{
#     let left = 0;
#     let right = eyeData.length - 1;
#     let bestMatch = eyeData[0];

#     while (left <= right) {{
#       let mid = Math.floor((left + right) / 2);
#       let delta = eyeData[mid].relative_timestamp - time;

#       if (Math.abs(delta) < Math.abs(bestMatch.relative_timestamp - time)) {{
#         bestMatch = eyeData[mid];
#       }}

#       if (delta < 0) {{
#         left = mid + 1;
#       }} else if (delta > 0) {{
#         right = mid - 1;
#       }} else {{
#         return eyeData[mid];
#       }}
#     }}
#     return bestMatch;
#   }}

#   video.addEventListener('timeupdate', drawEyeTracking);
#   video.addEventListener('pause', drawEyeTracking);
#   video.addEventListener('seeked', drawEyeTracking);
# </script>
# """

# Display the HTML in Streamlit
# st.components.v1.html(html_code, height=500)

# # Display the HTML code for debugging
# st.code(html_code, language="html")
