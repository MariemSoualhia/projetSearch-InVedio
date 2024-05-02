import React, { useState, useEffect } from "react";
import axios from "axios";
import JSMpeg from "@cycjimmy/jsmpeg-player";
import { API_API_URL } from "../../config/serverApiConfig";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Button, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  streamContainer: {
    margin: "10px",
    padding: theme.spacing(2),
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  button: {
    margin: theme.spacing(1),
  },
}));

const MultipleStreamsPage = () => {
  const [cameras, setCameras] = useState([]);
  const classes = useStyles();

  const stopStream = async (port) => {
    try {
      const resp = await axios.get(API_API_URL + `/stopStream?port=${port}`);
      console.log(resp);
    } catch (error) {
      console.error("Error stopping stream:", error);
    }
  };

  const fetchCameras = async () => {
    try {
      const response = await axios.get(API_API_URL + "/api/cameras");
      setCameras(response.data);
    } catch (error) {
      console.error("Error fetching cameras:", error);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  useEffect(() => {
    cameras.forEach((camera) => {
      const url = `ws://127.0.0.1:${camera.port}`;
      const canvasId = `canvas-${camera.rtspUrl}`;
      let canvas = document.getElementById(canvasId);
      new JSMpeg.Player(url, { canvas: canvas });
    });
  }, [cameras]);

  const startStream = async (rtspUrl, port) => {
    try {
      const resp = await axios.get(
        API_API_URL + `/streamAll?rtsp=${rtspUrl}&port=${port}`
      );
      console.log(resp);
    } catch (error) {
      console.error("Error starting stream:", error);
    }
  };

  return (
    <Grid container spacing={2}>
      {cameras.map((camera) => (
        <Grid item xs={12} sm={6} md={4} key={camera.id}>
          <StreamComponent
            camera={camera}
            startStream={startStream}
            stopStream={stopStream}
            classes={classes}
          />
        </Grid>
      ))}
    </Grid>
  );
};

const StreamComponent = ({ camera, startStream, stopStream, classes }) => {
  const [isStreaming, setIsStreaming] = useState(false);

  const handleStartStream = () => {
    startStream(camera.rtspUrl, camera.port);
    setIsStreaming(true);
  };

  const handleStopStream = () => {
    stopStream(camera.port);
    setIsStreaming(false);
    const url = `ws://127.0.0.1:${camera.port}`;
    const canvasId = `canvas-${camera.rtspUrl}`;
    let canvas = document.getElementById(canvasId);
    new JSMpeg.Player(url, { canvas: canvas });
  };

  return (
    <div className={classes.streamContainer}>
      <canvas
        id={`canvas-${camera.rtspUrl}`}
        width={532}
        height={324}
      ></canvas>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleStopStream}
        disabled={!isStreaming}
        className={classes.button}
      >
        Stop Stream
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleStartStream}
        disabled={isStreaming}
        className={classes.button}
      >
        Start Stream
      </Button>
    </div>
  );
};

export default MultipleStreamsPage;
