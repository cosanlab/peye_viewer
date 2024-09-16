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


def video_player_with_eye_gaze(video_url, eye_gaze_data, active_subjects, key=None):
    component_value = _component_func(
        videoUrl=video_url,
        eyeGazeData=eye_gaze_data,
        activeSubjects=active_subjects,
        key=key,
        default=None,  # Default to None
    )
    return component_value  # Return the new data requested
