import os
import streamlit as st
import streamlit.components.v1 as components

# Path to the build directory of your component
_component_func = components.declare_component(
    "video_overlay_component",
    path=os.path.join(
        os.path.dirname(__file__), "video_overlay_component/frontend/build"
    ),
)


# # st_video_overlay/component.py
# import os
# import streamlit.components.v1 as components

# # Set _RELEASE to True for production use
# _RELEASE = False

# if not _RELEASE:
#     _component_func = components.declare_component(
#         "st_video_overlay",
#         url="http://localhost:8000",  # Port for Svelte dev server
#         # url="http://localhost:5000",  # Port for Svelte dev server
#     )
# else:
#     parent_dir = os.path.dirname(os.path.abspath(__file__))
#     build_dir = os.path.join(parent_dir, "frontend", "svelte", "public")
#     _component_func = components.declare_component(
#         "st_video_overlay",
#         path=build_dir,  # Ensure this path points to the directory containing `index.html`
#     )


# def st_video_overlay(video_url, filtered_data, selected_subjects=None, key=None):
#     # Pass the filtered data and selected subjects to the component
#     component_value = _component_func(
#         videoUrl=video_url,
#         eyeData=filtered_data,
#         selectedSubjects=selected_subjects,
#         key=key,
#     )
#     return component_value
