import React, { useState , useEffect} from "react";
import JSMpeg from "@cycjimmy/jsmpeg-player"
import axios from "axios"
import {
  Grid,
  Container,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  MenuItem,
  Menu,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles((theme) => ({
  root: {
  
    paddingTop: theme.spacing(4),
  },
  button: {
    margin: theme.spacing(1),
    borderRadius: theme.spacing(2),
    padding: `${theme.spacing(1)}px ${theme.spacing(3)}px`,
    color: "#fff",
  },
  streamContainer: {
    width: "100%",
    margin: "0",
  
  },
  stream: {
    width: "100%",
    height: "auto",
    borderRadius: theme.spacing(1),
    backgroundColor: "#000",
  },
  cameraList: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end", 
    "& > *": {
      marginBottom: theme.spacing(1),
      width: "100%",
      maxWidth: "400px",
    },
  },
  
  cameraItem: {
    backgroundColor: theme.palette.primary.main,
    padding: theme.spacing(2),
    borderRadius: theme.spacing(2),
    cursor: "pointer",
    transition: "background-color 0.3s",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  cameraText: {
    color: "#fff",
    fontWeight: "bold",
  },
  sectionTitle: {
    color: "#333",
    marginBottom: theme.spacing(2),
    borderBottom: "2px solid #333",
    paddingBottom: theme.spacing(1),
    fontWeight: "bold",
    fontSize: "1.5rem",
    marginRight: theme.spacing(2), // Ajoute une marge à droite de 16px (2 * theme.spacing(2))
  },
  
  videoEditor: {
    width: "100%",
    height: "auto",
    marginBottom: theme.spacing(2),
    border: "2px solid #ccc",
    borderRadius: theme.spacing(1),
    cursor: "pointer",
    transition: "transform 0.3s",
    "&:hover": {
      transform: "scale(1.05)",
    },
  },
  selectedCameraItem: {
    backgroundColor: theme.palette.primary.light,
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  disabledCameraItem: {
    opacity: 0.6,
    pointerEvents: "none",
  },
  canvas: {

    width: "1280px", // Taille initiale de 1280px
    height: "720px", // Taille initiale de 720px
  },
  
}));
const LivePage = () => {
  const classes = useStyles();
  const [streamUrl, setStreamUrl] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [selectedCam, setSelectedCam] = useState({});
  const [cameras, setCameras] = useState([]);
  const [durationDialogOpen, setDurationDialogOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(60000); 
  useEffect(()=>{
    const url = 'ws://127.0.0.1:9999'
    let canvas = document.getElementById("video-canvas")
    new JSMpeg.Player(url, { canvas: canvas })
},[])
useEffect(() => {
  fetchCameras();
}, []);

const fetchCameras = async () => {
  try {
    const response = await axios.get("http://localhost:3002/api/cameras");
    setCameras(response.data);
  } catch (error) {
    console.error("Error fetching cameras:", error);
  }
};
const rtspurl = "rtsp://rtspstream:9f8f7639a88af813b1bbfc507f8d9c63@zephyr.rtsp.stream/movie"

const httpRequest = async (url) => {
  try {
    await axios.get(`http://127.0.0.1:3002/stream?rtsp=${url}`);
  } catch (error) {
    console.error("Error starting stream:", error);
    setIsStreaming(false);
  }
};

const startRTSPFeed = async (i) => {
  try {
    setIsStreaming(true);
    await httpRequest(cameras[i].rtspUrl);
  } catch (error) {
    console.error("Error starting stream:", error);
    
  }
};
const handleDurationSelect = (value) => {
 
  setSelectedDuration(value);
  //setDurationDialogOpen(false);
  handleStartRecording()
  
};
    
const stopRTSPFeed = () => {
   httpRequest("stop")
   setIsStreaming(false);
   const url = 'ws://127.0.0.1:9999'
    let canvas = document.getElementById("video-canvas")
    new JSMpeg.Player(url, { canvas: canvas })
   //window.location.reload()
}

const handleCameraSelect = (camera, i) => {
  setSelectedCamera(camera.id);
  setSelectedCam(cameras[i])
  startRTSPFeed(i);
};
const handleStartRecording = () => {
  console.log()
  const recordingData = {
    
    url: selectedCam.rtspUrl,
    cameraName: selectedCam.name,
    //recordingDuration: selectedDuration,

  };

  axios
  .post("http://127.0.0.1:3002/api/start-recording", recordingData)
  .then((response) => {
    console.log(response)
    console.log("Recording started");
    setIsRecording(true);
    setDurationDialogOpen(false)

    // Définir un timer pour désactiver l'enregistrement après 2 minutes
   
  })
  .catch((error) => {
    console.error("Error starting recording:", error);
  });
};

const handleStopRecording = () => {
  const recordingData = {
    
    url: selectedCam.rtspUrl,
    recordingDuration: 2 * 60 * 1000, // 2 minutes par défaut

  };
  axios
    .post("http://127.0.0.1:3002/api/stop-recording", recordingData)
    .then((response) => {
      console.log("Recording stopped");
      setIsRecording(false);
    })
    .catch((error) => {
      console.error("Error stopping recording:", error);
    });
};

return(

  <div>
  <Typography variant="h3" gutterBottom className={classes.sectionTitle}>
    Video Stream
  </Typography>
  <Grid container spacing={2}>
    <Grid item xs={12} sm={8}>
      <div className={classes.streamContainer}>
        <canvas id="video-canvas"></canvas>
        {!isStreaming && (
          <div className={classes.stream}>
            <Typography variant="body1" className={classes.cameraText}>
              Click "Start Stream" to view live stream
            </Typography>
          </div>
        )}
      </div>
      <Button
        variant="contained"
        color="secondary"
        onClick={stopRTSPFeed}
        disabled={!isStreaming}
        className={classes.button}
      >
        Stop Stream
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={()=> setDurationDialogOpen(true)}
        disabled={!isStreaming || isRecording}
        className={classes.button}
      >
        Start Record
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleStopRecording}
        disabled={!isRecording}
        className={classes.button}
      >
        Stop Record
      </Button>
      <Menu
        anchorEl={null}
        open={durationDialogOpen}
        onClose={handleStartRecording}
      >
        <MenuItem  onClick={() => handleDurationSelect(30000)}>30 seconds</MenuItem>
        <MenuItem onClick={() => handleDurationSelect(60000)}>1 minute</MenuItem>
        <MenuItem onClick={() => handleDurationSelect(120000)}>2 minutes</MenuItem>
        {/* Ajoutez autant d'options que nécessaire */}
      </Menu>
    </Grid>
    <Grid item xs={12} sm={4}>
      <List className={classes.cameraList}>
        {cameras.map((camera, index) => (
          <Paper
            key={camera.id}
            className={`${classes.cameraItem} ${
              selectedCamera === camera.id ? classes.selectedCameraItem : ""
            } ${
              isStreaming ? classes.disabledCameraItem : ""
            }`}
            onClick={() => handleCameraSelect(camera, index)}
          >
            <ListItemText
              primary={
                <Typography variant="body1" className={classes.cameraText}>
                  {camera.name}
                </Typography>
              }
            />
          </Paper>
        ))}
      </List>
    </Grid>
  </Grid>
</div>


)}

export default LivePage;
