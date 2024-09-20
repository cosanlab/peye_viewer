# Peye-Viewer Eye Gaze Visualization App

This app is built with Streamlit and visualizes eye gaze data over a video. It overlays real-time eye gaze positions of selected subjects on the video as it plays, allowing you to see how each subject tracks the content. You can toggle individual subjects to visualize their gaze data.

## Features
- **Video Player**: Plays a video while displaying the corresponding eye gaze data.
- **Subject Selection**: Toggle individual subjects to display their gaze data.
- **Gaze Tracking**: Shows real-time eye gaze positions as the video plays.

## Requirements

The application relies on the following key packages:
- **Streamlit**
- **Pandas**
- **Numpy**
- **video.js** (for video rendering)
- **Streamlit Component** (for integrating the video player)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/cosanlab/peye_viewer.git
cd peye_viewer
```

### 2. Setup Conda Environment the repository
You can use Conda to manage the environment for this app. Below are instructions to set up a Conda environment:

**a. Create Conda environment**

```bash
conda create -n peye_viewer python=3.11
```

**b. Activate the environment**
```bash
conda activate eye-gaze-app
```

**c. Install dependencies**

```bash
pip install -r requirements.txt
```

### 3. Run the App
Once all dependencies are installed, run the Streamlit app by executing the following command:

```bash

streamlit run peye_viewer/viewer.py
```

### 4. Video and Data File

Ensure that your video and gaze data files are correctly set up. The paths to these resources are configured in the code:

- Video URL: Defined in the viewer.py script
- Eye Gaze Data File: Defined in the DATA_FILE constant in viewer.py


### 6. Expected Data Format
The CSV data should include at least the following columns for eye gaze data:

- SID: Subject ID
- gaze_x: Gaze position on the x-axis (normalized between 0 and 1)
- gaze_y: Gaze position on the y-axis (normalized between 0 and 1)
- relative_timestamp: Time in seconds relative to the start of the video

### Contribution
Feel free to submit a pull request or open an issue if you encounter any problems or have suggestions.

### License
This project is licensed under the MIT License.
