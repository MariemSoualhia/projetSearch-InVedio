import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Grid,
  Button,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
  IconButton
} from "@material-ui/core";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import LinkedCameraIcon from "@mui/icons-material/LinkedCamera";
import { makeStyles } from "@material-ui/core/styles";
import DetectionPage from "./DetectionPage";
import {
  API_API_URL,
} from "../../config/serverApiConfig";
import DeleteIcon from "@mui/icons-material/Delete";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
    paddingTop: theme.spacing(4),
  },
  buttonCamera: {
    margin: theme.spacing(1),
    backgroundColor: "#9E58FF",
    color: "#fff",
    fontWeight: "bold",
    textTransform: "none",
    "&:hover": {
      backgroundColor: "#8C4FE9",
    },
  },
  buttonVideo: {
    margin: theme.spacing(1),
    borderColor: "#9E58FF",
    color: "#9E58FF",
    fontWeight: "bold",
    textTransform: "none",
    "&:hover": {
      borderColor: "#8C4FE9",
      color: "#8C4FE9",
    },
  },
}));

const AllDetection = () => {
  const [components, setComponents] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  const classes = useStyles();

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const fetchCameras = async () => {
    try {
      const response = await axios.get(API_API_URL + "/api/cameras");
      setCameras(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cameras:", error);
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await axios.get(API_API_URL + "/api/videosUploads");
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const fetchStreams = async () => {
    try {
      const response = await axios.get(API_API_URL + "/api/stream/play");
      if (response.data.length > 0) {
        setComponents(
          response.data.map((stream, index) => ({
            id: `stream-${index}`,
            stream: (
              <Grid item xs={6} key={`stream-${index}`}>
                <DetectionPage
                  allCameras={cameras}
                  stream={stream}
                  componentId={`stream-${index}`}
                  onDelete={handleDeleteComponent}
                />
              </Grid>
            ),
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching streams:", error);
    }
  };

  useEffect(() => {
    fetchCameras();
    fetchStreams();
    fetchVideos();
  }, []);

  const addComponent = (camera) => {
    const componentId = `stream-${components.length}`;
    setComponents((prevComponents) => [
      ...prevComponents,
      {
        id: componentId,
        stream: (
          <Grid item xs={6} key={componentId}>
            <DetectionPage
              camera={camera}
              allCameras={cameras}
              stream={camera}
              componentId={componentId}
              onDelete={handleDeleteComponent}
            />
          </Grid>
        ),
      },
    ]);
  };

  const handleDeleteComponent = (componentId) => {
    setComponents((prevComponents) =>
      prevComponents.filter((component) => component.id !== componentId)
    );
  };

  const handleCameraButtonClick = (camera) => {
    addComponent(camera);
  };

  const handleUpload = async (camera) => {
    const dataCam = {
      rtspUrl: camera.path,
      name: camera.name,
    };
    handleCameraButtonClick(dataCam);
  };
  const handleDeleteVideo = async (videoId) => {
    try {
      await axios.delete(`${API_API_URL}/api/videosUploads/${videoId}`);
      fetchVideos(); // Refresh the list of videos
     
    } catch (error) {
      console.error("Error deleting video:", error);
      
    }
  };


  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            {loading ? (
              <CircularProgress />
            ) : (
              <Grid container spacing={2}>
                {cameras.map((camera) => (
                  <Grid item key={camera.id}>
                    <Button
                      variant="contained"
                      className={classes.buttonCamera}
                      onClick={() => handleCameraButtonClick(camera)}
                      startIcon={<LinkedCameraIcon />}
                    >
                      {camera.name}
                    </Button>
                  </Grid>
                ))}
     {videos.map((video) => (
                  <Grid item key={video._id}>
                    <Button
                      variant="outlined"
                      className={classes.buttonVideo}
                      onClick={() => handleUpload(video)}
                      startIcon={<OndemandVideoIcon />}
                    >
                      {video.name}
                    </Button>
                    <IconButton
                      onClick={() => handleDeleteVideo(video._id)}
                      className={classes.deleteButton}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
          <Grid container spacing={2}>
            {components.map((component) => component.stream)}
          </Grid>
        </Grid>
      </ThemeProvider>
    </>
  );
};

export default AllDetection;
