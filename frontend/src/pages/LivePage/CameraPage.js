import React, { useState, useEffect } from "react";
import {
  Grid,
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  ThemeProvider,
  createTheme,
  CssBaseline,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Box,
  Tooltip,
} from "@mui/material";
import { makeStyles } from "@material-ui/core/styles";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import InfoIcon from "@material-ui/icons/Info";
import { PlayArrow, Stop, FiberManualRecord } from "@material-ui/icons";
import axios from "axios";
import moment from "moment";
import JSMpeg from "@cycjimmy/jsmpeg-player";
import { API_API_URL } from "../../config/serverApiConfig";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
    paddingTop: theme.spacing(4),
  },
  formContainer: {
    maxWidth: "600px",
    margin: "auto",
    padding: theme.spacing(4),
    border: `2px solid var(--border-color)`,
    borderRadius: "8px",
    backgroundColor: "var(--background-color)",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
    },
  },
  textField: {
    marginBottom: theme.spacing(2),
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "var(--input-border-color)",
        backgroundColor: "var(--input-background-color)",
      },
      "&:hover fieldset": {
        borderColor: "var(--input-border-color)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "var(--input-border-color)",
      },
      "& input": {
        color: "var(--input-text-color)",
      },
    },
    "& .MuiInputLabel-root": {
      color: "var(--label-color)",
    },
  },
  button: {
    marginRight: theme.spacing(1),
    backgroundColor: "#9E58FF",
  },
  cameraList: {
    backgroundColor: "var(--background-color)",
    borderRadius: "8px",
    border: `2px solid var(--border-color)`,
    padding: theme.spacing(2),
  },
  listItem: {
    marginBottom: theme.spacing(1),
    backgroundColor: "var(--input-background-color)",
    borderRadius: "4px",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    color: "var(--text-color)",
  },
  listItemText: {
    "& .MuiListItemText-primary": {
      fontWeight: "bold",
      color: "var(--text-color)",
    },
    "& .MuiListItemText-secondary": {
      color: "var(--text-color)",
    },
  },
  editButton: {
    color: "var(--icon-color)",
  },
  deleteButton: {
    color: "#f44336",
  },
  infoButton: {
    color: "#1A237E",
  },
  streamContainer: {
    margin: "10px",
    padding: theme.spacing(2),
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  pagination: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "center",
    "& .MuiPaginationItem-root": {
      color: "#9E58FF",
    },
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: theme.spacing(3),
    color: "var(--text-color)",
  },
  inputLabel: {
    color: "var(--label-color)",
  },
  dialogTitle: {
    //backgroundColor: "var(--background-color)",
    color: "var(--text-color)",
  },
  dialogContent: {
    //backgroundColor: "var(--background-color)",
    color: "var(--text-color)",
  },
  dialogActions: {
    //backgroundColor: "var(--background-color)",
    color: "var(--text-color)",
  },
}));

const CameraPage = () => {
  const classes = useStyles();
  const [cameras, setCameras] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    username: "",
    password: "",
    resolution: "",
  });
  const [listAddress, setListAddress] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [currentCamera, setCurrentCamera] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  useEffect(() => {
    fetchCameras();
    fetchCamerasAddress();
  }, []);

  useEffect(() => {
    const storedAddresses = localStorage.getItem("addresses");
    if (storedAddresses) {
      setListAddress(JSON.parse(storedAddresses));
    } else {
      fetchCamerasAddress();
    }
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const fetchCameras = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/cameras");
      setCameras(response.data);
    } catch (error) {
      console.error("Error fetching cameras:", error);
    }
  };

  const fetchCamerasAddress = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/scan_ips");
      setListAddress(response.data.list_ips);
      localStorage.setItem("addresses", JSON.stringify(response.data.list_ips));
    } catch (error) {
      console.error("Error fetching cameras:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddCamera = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:3002/api/cameras", formData);
      fetchCameras();
      setFormData({
        name: "",
        address: "",
        username: "",
        password: "",
        resolution: "",
      });
      setLoading(false);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error adding camera:", error);
      setLoading(false);
    }
  };

  const handleDeleteCamera = async (id) => {
    try {
      await axios.delete(`http://localhost:3002/api/cameras/${id}`);
      fetchCameras();
    } catch (error) {
      console.error("Error deleting camera:", error);
    }
  };

  const handleEditCamera = (camera) => {
    setFormData({
      id: camera._id,
      name: camera.name,
      address: camera.address,
      username: camera.username,
      password: camera.password,
      resolution: camera.resolution,
    });
    setEditDialogOpen(true);
  };

  const handleAddressChange = (event) => {
    setFormData({ ...formData, address: event.target.value });
  };

  const handleUpdateCamera = async () => {
    try {
      await axios.put(
        `http://localhost:3002/api/cameras/${formData.id}`,
        formData
      );
      fetchCameras();
      setFormData({
        name: "",
        address: "",
        username: "",
        password: "",
        resolution: "",
      });
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating camera:", error);
    }
  };

  const handleCloseDialog = () => {
    setFormData({
      name: "",
      address: "",
      username: "",
      password: "",
      resolution: "",
    });
    setOpenDialog(false);
    setEditDialogOpen(false);
    setInfoDialogOpen(false);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
   
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={() => setOpenDialog(true)}
        >
          + Add Camera
        </Button>

        <Grid container spacing={2}>
          {cameras.map((camera) => (
            <Grid item xs={12} sm={6} md={4} key={camera.id}>
              <StreamComponent
                camera={camera}
                handleEditCamera={handleEditCamera}
                handleDeleteCamera={handleDeleteCamera}
                setInfoDialogOpen={setInfoDialogOpen}
                setCurrentCamera={setCurrentCamera}
                classes={classes}
              />
            </Grid>
          ))}
        </Grid>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle className={classes.dialogTitle}>Add Camera</DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <TextField
              label="Camera Name"
              variant="outlined"
              fullWidth
              className={classes.textField}
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              color="secondary"
            />
            <br></br>
            <br></br>
            <FormControl fullWidth variant="outlined">
              <InputLabel
                id="address-select-label"
                className={classes.inputLabel}
              >
                IP Address
              </InputLabel>
              <br></br>
            <br></br>
              <Select
                labelId="address-select-label"
                id="address-select"
                value={formData.address}
                onChange={handleAddressChange}
                label="IP Address"
                color="secondary"
              >
                {listAddress.map((address, index) => (
                  <MenuItem key={index} value={address}>
                    {address}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <br />
            <br />
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              className={classes.textField}
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              color="secondary"
            />
                      <br></br>
            <br></br>
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              className={classes.textField}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              color="secondary"
            />
          </DialogContent>
          <DialogActions className={classes.dialogActions}>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleAddCamera} color="primary">
              Add
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={editDialogOpen} onClose={handleCloseDialog}>
          <DialogTitle className={classes.dialogTitle}>Edit Camera</DialogTitle>
          <DialogContent className={classes.dialogContent}>
          <br></br>
        
            <TextField
              label="Camera Name"
              variant="outlined"
              fullWidth
              className={classes.textField}
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              color="secondary"
            />
             <br></br>
            <br></br>
            <FormControl fullWidth variant="outlined">
              <InputLabel
                id="address-select-label"
                className={classes.inputLabel}
              >
                IP Address
              </InputLabel>
              <br></br>
            <br></br>
              <Select
                labelId="address-select-label"
                id="address-select"
                value={formData.address}
                onChange={handleAddressChange}
                label="IP Address"
                color="secondary"
              >
                {listAddress.map((address, index) => (
                  <MenuItem key={index} value={address}>
                    {address}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <br />
            <br />
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              className={classes.textField}
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              color="secondary"
            />
             <br></br>
            <br></br>
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              className={classes.textField}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              color="secondary"
            />
          </DialogContent>

          <DialogActions className={classes.dialogActions}>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleUpdateCamera} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={infoDialogOpen} onClose={handleCloseDialog}>
          <DialogTitle className={classes.dialogTitle}>Camera Info</DialogTitle>
          <DialogContent className={classes.dialogContent}>
          <br></br>
          
            <Typography>Name: {currentCamera?.name}</Typography>
            <br></br>
            <Typography>IP Address: {currentCamera?.address}</Typography>
            <br></br>
            <Typography>Username: {currentCamera?.username}</Typography>
            <br></br>
            <Typography>Password: {currentCamera?.password}</Typography>
            <br></br>
            <Typography>Resolution: {currentCamera?.resolution}</Typography>
          </DialogContent>
          <DialogActions className={classes.dialogActions}>
            <Button onClick={handleCloseDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

    </ThemeProvider>
  );
};

const StreamComponent = ({
  camera,
  handleEditCamera,
  handleDeleteCamera,
  setInfoDialogOpen,
  setCurrentCamera,
  classes,
}) => {
  const [isStreaming, setIsStreaming] = useState(
    localStorage.getItem(`isStreaming-${camera.rtspUrl}`) === "true"
  );
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    setIsRecording(
      localStorage.getItem(`isRecording-${camera.rtspUrl}`) === "true"
    );
  }, []);

  useEffect(() => {
    const url = `ws://127.0.0.1:${camera.port}`;
    const canvasId = `canvas-${camera.rtspUrl}`;
    let canvas = document.getElementById(canvasId);
    new JSMpeg.Player(url, { canvas: canvas });
  }, [camera]);

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

  const startStream = async (rtspUrl, port) => {
    try {
      const resp = await axios.get(
        API_API_URL + `/streamAll?rtsp=${rtspUrl}&port=${port}`
      );
      console.log(resp);
      localStorage.setItem(`isStreaming-${rtspUrl}`, "true");
      setIsStreaming(true);
    } catch (error) {
      console.error("Error starting stream:", error);
    }
  };

  const stopStreamHandler = async (port) => {
    try {
      await axios.get(API_API_URL + `/stopStream?port=${port}`);
      localStorage.removeItem(`isStreaming-${camera.rtspUrl}`);
      setIsStreaming(false);
    } catch (error) {
      console.error("Error stopping stream:", error);
    }
  };

  const startRecording = async (rtspUrl, port, cameraName) => {
    try {
      let dateTime = moment();
      let nameRecord = cameraName + dateTime.format("YYYY-MM-DD_HH:mm:ss");
      const response = await axios.post(
        API_API_URL + "/api/startAllRecording",
        {
          url: rtspUrl,
          port: port,
          recordingDuration: 3600,
          name: nameRecord,
          cameraName: cameraName,
        }
      );
      console.log(response);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = async (port) => {
    try {
      await axios.post(API_API_URL + "/api/stopAllRecording", null, {
        params: { port: port },
      });
      setIsRecording(false);
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  const handleInfoClick = () => {
    setCurrentCamera(camera);
    setInfoDialogOpen(true);
  };

  return (
    <div className={classes.streamContainer} style={{ position: "relative" }}>
      <canvas id={`canvas-${camera.rtspUrl}`} width={532} height={324}></canvas>
      <p
        style={{
          position: "absolute",
          top: 0,
          left: 20,
          color: "#1A237E",
        }}
      >{`${camera.name} - ${new Date().toLocaleString()}`}</p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <IconButton
          onClick={handleStreamAction}
          disabled={isRecording}
          className={classes.button}
          style={{ color: isStreaming ? "#ff0000" : "#1A237E" }}
        >
          {isStreaming ? <Stop /> : <PlayArrow />}
          <span style={{ marginLeft: "5px", fontSize: "0.6em" }}>Stream</span>
        </IconButton>

        <IconButton
          onClick={handleRecordAction}
          disabled={!isStreaming}
          className={classes.button}
          style={{ color: isRecording ? "#ff0000" : "#1A237E" }}
        >
          <FiberManualRecord />
          <span style={{ marginLeft: "5px", fontSize: "0.6em" }}>Record</span>
        </IconButton>

        <IconButton onClick={handleInfoClick} className={classes.infoButton}>
          <InfoIcon />
        </IconButton>

        <IconButton
          onClick={() => handleEditCamera(camera)}
          className={classes.editButton}
        >
          <EditIcon />
        </IconButton>

        <IconButton
          onClick={() => handleDeleteCamera(camera._id)}
          className={classes.deleteButton}
        >
          <DeleteIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default CameraPage;
