import os
import streamlit.components.v1 as components

_RELEASE = True

if not _RELEASE:
    _component_func = components.declare_component(
        "video_player_with_eye_gaze",
        url="http://localhost:3001",
    )
else:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend", "build")
    _component_func = components.declare_component(
        "video_player_with_eye_gaze", path=build_dir
    )


def video_player_with_eye_gaze(
    video_url,
    eye_gaze_data,
    active_subjects,
    history_samples,
    show_heatmap=False,
    key=None,
):
    """
    Streamlit component function for the video player with eye gaze overlay.

    Parameters:
    - video_url: URL of the video to play.
    - eye_gaze_data: Eye gaze data to overlay.
    - active_subjects: List of active subjects whose data should be displayed.
    - history_samples: Number of gaze history samples to show.
    - key: Optional key for Streamlit component state.

    Returns:
    - component_value: The updated data from the component (e.g., currentTime).
    """
    component_value = _component_func(
        videoUrl=video_url,
        eyeGazeData=eye_gaze_data,
        activeSubjects=active_subjects,
        historySamples=history_samples,  # Pass the historySamples to the frontend
        showHeatmap=show_heatmap,  # Pass the heatmap state to the frontend
        key=key,
        default=None,  # Default to None
    )
    return component_value  # Return the new data requested
