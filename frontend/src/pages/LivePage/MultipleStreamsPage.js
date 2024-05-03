import React, { useState, useEffect } from "react";
import axios from "axios";
import JSMpeg from "@cycjimmy/jsmpeg-player";
import { API_API_URL } from "../../config/serverApiConfig";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Button, Typography } from "@material-ui/core";
import { IconButton } from "@material-ui/core";
import moment from 'moment';
import { PlayArrow, Stop, FiberManualRecord } from "@material-ui/icons";
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
      localStorage.setItem(`isStreaming-${rtspUrl}`, "true");
      setCameras((prevCameras) =>
        prevCameras.map((camera) =>
          camera.rtspUrl === rtspUrl ? { ...camera, isStreaming: true } : camera
        )
      );
    } catch (error) {
      console.error("Error starting stream:", error);
    }
  };

  const stopStreamHandler = (port) => {
    stopStream(port);
    const targetCamera = cameras.find((camera) => camera.port === port);
    localStorage.removeItem(`isStreaming-${targetCamera.rtspUrl}`);
    setCameras((prevCameras) =>
      prevCameras.map((camera) =>
        camera.port === port ? { ...camera, isStreaming: false } : camera
      )
    );
  };

  const startRecording = async (rtspUrl, port, cameraName) => {
    try {
      // Envoyer une requête POST pour démarrer l'enregistrement
      let dateTime = moment();
      let nameRecord = cameraName + dateTime.format('YYYY-MM-DD_HH:mm:ss');
      const response = await axios.post(API_API_URL + "/api/startAllRecording", {
        url: rtspUrl,
        port:port,
        recordingDuration: 3600, // Durée de l'enregistrement (en secondes)
        name: nameRecord, // Nom de la vidéo
        cameraName: cameraName, 
      });
      console.log(response);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = async (port) => {
    try {
      // Envoyer une requête POST pour arrêter l'enregistrement
      const response = await axios.post(
        API_API_URL + "/api/stopAllRecording",
        null,
        { params: { port: port } }
      );
      console.log(response);
      if(response){
        window.location.reload()
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  return (
    <Grid container spacing={2}>
      {cameras.map((camera) => (
        <Grid item xs={12} sm={6} md={4} key={camera.id}>
          <StreamComponent
            camera={camera}
            startStream={startStream}
            stopStreamHandler={stopStreamHandler}
            startRecording={startRecording}
            stopRecording={stopRecording}
            classes={classes}
          />
        </Grid>
      ))}
    </Grid>
  );
};

const StreamComponent = ({
  camera,
  startStream,
  stopStreamHandler,
  startRecording,
  stopRecording,
  classes,
}) => {
  const [isStreaming, setIsStreaming] = useState(
    localStorage.getItem(`isStreaming-${camera.rtspUrl}`) === "true"
  );
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    setIsRecording(localStorage.getItem(`isRecording-${camera.rtspUrl}`) === "true");
  }, []);

  const handleStartStream = () => {
    startStream(camera.rtspUrl, camera.port);
    setIsStreaming(true);
    localStorage.setItem(`isStreaming-${camera.rtspUrl}`, "true");
  };

  const handleStopStream = () => {
    stopStreamHandler(camera.port);
    setIsStreaming(false);
  };

  const handleStartRecording = () => {
    startRecording(camera.rtspUrl, camera.port, camera.name);
    setIsRecording(true);
    localStorage.setItem(`isRecording-${camera.rtspUrl}`, "true");
  };

  const handleStopRecording = () => {
    stopRecording(camera.port);
    setIsRecording(false);
    localStorage.removeItem(`isRecording-${camera.rtspUrl}`);
  };
  const handleStreamAction = () => {
    if (isStreaming) {
      handleStopStream();
    } else {
      handleStartStream();
    }
  };
  
  const handleRecordAction = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };
  

  return (
   
    <div className={classes.streamContainer} style={{ position: "relative" }}>
<canvas id={`canvas-${camera.rtspUrl}`} width={532} height={324}></canvas>
      <p
        style={{
          position: "absolute",
          top: 0,
          left: 20,
          color: "#3f51b5",
        }}
      >{`${camera.name} - ${new Date().toLocaleString()}`}</p>
      
      <IconButton onClick={handleStreamAction} disabled={isRecording} className={classes.button} style={{ color: isStreaming ? "#ff0000" : "#3f51b5" }}>
  {isStreaming ? <Stop /> : <PlayArrow />}
</IconButton>

<IconButton onClick={handleRecordAction} disabled={!isStreaming} className={classes.button} style={{ color: isRecording ? "#ff0000" : "#3f51b5" }}>
  <FiberManualRecord />
</IconButton>

    </div>

  );
};

export default MultipleStreamsPage;
