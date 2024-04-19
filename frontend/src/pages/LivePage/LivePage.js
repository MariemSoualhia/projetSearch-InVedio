import React, { useState , useRef,useEffect} from "react";
import JSMpeg from "@cycjimmy/jsmpeg-player"
import moment from 'moment';
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
    margin: "2",
  
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
  const [isStreaming, setIsStreaming] = useState(
    localStorage.getItem("isStreaming") === "true" ? true : false
  );
  const [isRecording, setIsRecording] = useState(
    localStorage.getItem("isRecording") === "true" ? true : false
  );
  const [selectedCamera, setSelectedCamera] = useState(
    localStorage.getItem("selectedCamera")
  );
  const [selectedCam, setSelectedCam] = useState({});
  const [cameras, setCameras] = useState([]);
  const [durationDialogOpen, setDurationDialogOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(200000);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDrawingStart, setIsDrawingStart] = useState(false);
  const [startCoords, setStartCoords] = useState({ x: 0, y: 0 });
  const [endCoords, setEndCoords] = useState({ x: 0, y: 0 });
  const [points, setPoints] = useState([]);
  const [drawMode, setDrawMode] = useState(false);

  useEffect(() => {
    const url = 'ws://127.0.0.1:9999'
    let canvas = document.getElementById("video-canvas")
    new JSMpeg.Player(url, { canvas: canvas })

    // Vérifier si le stream est en cours au chargement de la page
    if (isStreaming && selectedCamera) {
      startRTSPFeed(cameras.findIndex(camera => camera.id === selectedCamera));
    }
  }, []);

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

  const rtspurl = "rtsp://rtspstream:9f8f7639a88af813b1bbfc507f8d9c63@zephyr.rtsp.stream/movie";

  const httpRequest = async (url) => {
    try {
     const resp= await axios.get(`http://127.0.0.1:3002/stream?rtsp=${url}`);
     console.log(resp)
    } catch (error) {
      console.error("Error starting stream:", error);
      setIsStreaming(false);
    }
  };

  const startRTSPFeed = async (i) => {
    try {
      setIsStreaming(true);
      localStorage.setItem("isStreaming", "true");
      localStorage.setItem("selectedCamera", cameras[i].id);
      await httpRequest(cameras[i].rtspUrl);
    } catch (error) {
      console.error("Error starting stream:", error);
    }
  };

  const stopRTSPFeed = () => {
    httpRequest("stop");
    setIsStreaming(false);
    localStorage.removeItem("isStreaming");
    localStorage.removeItem("selectedCamera");
    const url = 'ws://127.0.0.1:9999'
    let canvas = document.getElementById("video-canvas")
    new JSMpeg.Player(url, { canvas: canvas });
  };

  const handleCameraSelect = (camera, i) => {
    setSelectedCamera(camera.id);
    setSelectedCam(cameras[i]);
    startRTSPFeed(i);
  };

  const handleStartRecording = () => {
    let dateTime = moment();
    let nameRecord = selectedCam.name + dateTime.format('YYYY-MM-DD_HH:mm:ss');
    const recordingData = {
      url: selectedCam.rtspUrl,
      cameraName: selectedCam.name,
      recordingDuration: selectedDuration,
      name: nameRecord
    };

    axios
    .post("http://127.0.0.1:3002/api/start-recording", recordingData)
    .then((response) => {
      console.log(response);
      console.log("Recording started");
      setIsRecording(true);
      localStorage.setItem("isRecording", "true");
      setDurationDialogOpen(false);
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
      console.log("Recording stopped", response);
      setIsRecording(false);
      localStorage.removeItem("isRecording");
    })
    .catch((error) => {
      console.error("Error stopping recording:", error);
    });
  };

  const handleDurationSelect = (value) => {
    setSelectedDuration(value);
    handleStartRecording();
  };

  const startDrawing = (event) => {
    setIsDrawingStart(true)
    if(drawMode=="line"){
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setStartCoords({ x, y });
   }
else{
  const rect = canvasRef.current.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Effacer les points existants si le nombre de points est égal à quatre
  if (points.length === 4) {
    setPoints([{ x, y }]);
  } else {
    // Ajouter un nouveau point
    setPoints([...points, { x, y }]);
  }
}
  };
  
  const draw = (event) => {
    if(drawMode=="line"){
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setEndCoords({ x, y });
    
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      
      // Dessine une ligne verticale
      ctx.moveTo(startCoords.x, 0); // Commence du haut de la toile (y = 0)
      ctx.lineTo(x, canvas.height); // Se termine en bas de la toile
      
      ctx.lineWidth = 5; // Épaisseur de la ligne
      ctx.strokeStyle = 'red'; // Couleur de la ligne
      ctx.stroke();
    }
 
  };
  
  

  const stopDrawing = () => {
    if(drawMode=="line"){
    setIsDrawing(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    console.log(ctx)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStartCoords({ x: 0, y: 0 });
    setEndCoords({ x: 0, y: 0 });
    setIsDrawingStart(false)
  };

  const handleDrawMode= (value) => {
 setDrawMode(value)
  };

  const handleMouseDown = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Effacer les points existants si le nombre de points est égal à quatre
    if (points.length === 4) {
      setPoints([{ x, y }]);
    } else {
      // Ajouter un nouveau point
      setPoints([...points, { x, y }]);
    }
  };

  const clearZone = () => {
    setPoints([]);
    setIsDrawingStart(false)
  };

  const drawZone = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    if (points.length === 4) {
      ctx.closePath(); // Fermer la forme si les 4 points sont présents
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'blue';
    ctx.stroke();
  };

  // Redessiner la zone à chaque changement dans les points
  React.useEffect(() => {
    drawZone();
  }, [points]);
return(

  <div>
  <Typography variant="h3" gutterBottom className={classes.sectionTitle}>
    Video Stream
  </Typography>
  <Grid container spacing={2}>
    <Grid item xs={12} sm={8}>
      <div className={classes.streamContainer}>
      <div style={{ position: 'relative', width: '1280px', height: '720px' }}>
        <canvas
          id='video-canvas'
          width={1280}
          height={720}
          style={{ border: '1px solid black', position: 'absolute', top: 0, left: 0 }}
        ></canvas>
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          style={{ border: '1px solid black', position: 'absolute', top: 0, left: 0 }}
          onMouseDown={ startDrawing }
          onMouseMove={draw}
          onMouseUp={ stopDrawing}
    
        ></canvas>
        <p style={{ position: 'absolute', top: '10px', left: '10px' }}>Start: ({startCoords.x}, {startCoords.y})</p>
        <p style={{ position: 'absolute', top: '30px', left: '10px' }}>End: ({endCoords.x}, {endCoords.y})</p>
       
      </div>
      <br></br>
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
        onClick={handleStartRecording}
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
      <Button
        variant="contained"
        color="primary"
       onClick={drawMode=="line"?clearCanvas:clearZone}
        disabled={!isDrawingStart}
        className={classes.button}
      >
        Clear 
      </Button>
      <Button
        variant="contained"
        color="primary"
       onClick={()=>setDurationDialogOpen(true)}
       disabled={!isStreaming}
     
      >
       Draw
      </Button>
      <Menu
        anchorEl={null}
        open={durationDialogOpen}
        onClose={()=>setDurationDialogOpen(false)}
      >
        <MenuItem  onClick={() => handleDrawMode("line")}>Line</MenuItem>
        <MenuItem onClick={() => handleDrawMode("zone")}>Zone</MenuItem>
 
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
