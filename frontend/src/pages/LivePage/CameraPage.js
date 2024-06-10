// src/components/CameraPage.js
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
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import { PlayArrow, Stop, FiberManualRecord } from "@material-ui/icons";
import InfoIcon from "@material-ui/icons/Info";
import { makeStyles } from "@material-ui/core/styles";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import axios from "axios";
import { API_API_URL, API_API_URLRTSP } from "../../config/serverApiConfig";
import moment from "moment";
import JSMpeg from "@cycjimmy/jsmpeg-player";
const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
    paddingTop: theme.spacing(4),
  },
  button: {
    marginRight: theme.spacing(1),
    backgroundColor: "#9E58FF",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#8E4CE0",
    },
  },
  dialogContent: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  uploadButton: {
    marginRight: theme.spacing(1),
    backgroundColor: "#9E58FF",
    color: "#fff",
    fontFamily: "time",
    marginBottom: theme.spacing(2),
  },
  textField: {
    marginBottom: "15px",
    marginTop: "15px",
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
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    fetchCameras();
    fetchCamerasAddress();
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const fetchCameras = async () => {
    try {
      const response = await axios.get(API_API_URL + "/api/cameras");
      setCameras(response.data);
    } catch (error) {
      console.error("Error fetching cameras:", error);
      showSnackbar("Failed to fetch cameras.", "error");
    }
  };

  const fetchCamerasAddress = async () => {
    try {
      const response = await axios.get(API_API_URLRTSP + "/scan_ips");
      setListAddress(response.data.list_ips);
      localStorage.setItem("addresses", JSON.stringify(response.data.list_ips));
    } catch (error) {
      console.error("Error fetching camera addresses:", error);
      showSnackbar("Failed to fetch IP cameras.", "error");
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
    try {
      setLoading(true);
      await axios.post(API_API_URL + "/api/cameras", formData);
      fetchCameras();
      setFormData({
        name: "",
        address: "",
        username: "",
        password: "",
        resolution: "",
      });
      setOpenDialog(false);
      showSnackbar("Camera added successfully!", "success");
    } catch (error) {
      console.error("Error adding camera:", error);
      setLoading(false);
      showSnackbar("Failed to add camera.", "error");
    }
    setLoading(false);
  };

  const handleDeleteCamera = async (id) => {
    try {
      await axios.delete(API_API_URL + `/api/cameras/${id}`);
      fetchCameras();
      showSnackbar("Camera deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting camera:", error);
      showSnackbar("Failed to delete camera.", "error");
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

  const handleUpdateCamera = async () => {
    try {
      await axios.put(API_API_URL + `/api/cameras/${formData.id}`, formData);
      fetchCameras();
      setFormData({
        name: "",
        address: "",
        username: "",
        password: "",
        resolution: "",
      });
      setEditDialogOpen(false);
      showSnackbar("Camera updated successfully!", "success");
    } catch (error) {
      console.error("Error updating camera:", error);
      showSnackbar("Failed to update camera.", "error");
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
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(API_API_URL + "/api/videosUploads/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setUploadStatus("File uploaded successfully");
        setOpenUploadDialog(false);
      } else {
        setUploadStatus("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("Error uploading file");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Button
        variant="contained"
        className={classes.button}
        onClick={() => setOpenDialog(true)}
      >
        + Add Camera
      </Button>
      <Button
        variant="contained"
        className={classes.uploadButton}
        onClick={() => setOpenUploadDialog(true)}
      >
        Upload Video
      </Button>

      {cameras.length === 0 ? (
        <Typography
          variant="h6"
          align="center"
          style={{ marginTop: "20px", fontFamily: "time", fontSize: "36px" }}
        >
          No cameras available. Please add a new camera &nbsp;
          <ReportGmailerrorredIcon
            style={{
              marginTop: "20px",
              marginBottom: "-10px",
              color: "#F47B20",
              width: "45px",
              height: "45px",
            }}
          />
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {cameras.map((camera) => (
            <Grid item xs={12} sm={6} md={4} key={camera.id}>
              <StreamComponent
                camera={camera}
                handleEditCamera={handleEditCamera}
                handleDeleteCamera={handleDeleteCamera}
                classes={classes}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle className={classes.dialogTitle}>Add Camera</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <FormControl fullWidth className={classes.textField}>
            <TextField
              label="Camera Name"
              variant="outlined"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl fullWidth variant="outlined" className={classes.textField}>
            <InputLabel id="address-select-label">IP Address</InputLabel>
            <Select
              labelId="address-select-label"
              id="address-select"
              value={formData.address}
              onChange={handleInputChange}
              name="address"
            >
              {listAddress.map((address, index) => (
                <MenuItem key={index} value={address}>
                  {address}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth className={classes.textField}>
            <TextField
              label="Username"
              variant="outlined"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl fullWidth className={classes.textField}>
            <TextField
              label="Password"
              variant="outlined"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddCamera}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle className={classes.dialogTitle}>Edit Camera</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <FormControl fullWidth className={classes.textField}>
            <TextField
              label="Camera Name"
              variant="outlined"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl fullWidth variant="outlined" className={classes.textField}>
            <InputLabel id="address-select-label">IP Address</InputLabel>
            <Select
              labelId="address-select-label"
              id="address-select"
              value={formData.address}
              onChange={handleInputChange}
              name="address"
            >
              {listAddress.map((address, index) => (
                <MenuItem key={index} value={address}>
                  {address}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth className={classes.textField}>
            <TextField
              label="Username"
              variant="outlined"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl fullWidth className={classes.textField}>
            <TextField
              label="Password"
              variant="outlined"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateCamera}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)}>
        <DialogTitle className={classes.dialogTitle}>Upload Video</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <input
            accept="video/*"
            style={{ display: "none" }}
            id="raised-button-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="raised-button-file">
            <Button variant="contained" component="span" className={classes.uploadButton}>
              Choose File
            </Button>
          </label>
          {uploadStatus && (
            <Typography
              variant="body2"
              style={{ color: "red", marginTop: "10px" }}
            >
              {uploadStatus}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleUpload} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

const StreamComponent = ({
  camera,
  handleEditCamera,
  handleDeleteCamera,
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
      await axios.get(
        API_API_URL + `/streamAll?rtsp=${rtspUrl}&port=${port}`
      );
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
      await axios.post(API_API_URL + "/api/startAllRecording", {
        url: rtspUrl,
        port: port,
        recordingDuration: 3600,
        name: nameRecord,
        cameraName: cameraName,
      });
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
          style={{ color: isStreaming ? "#ff0000" : "#9E58FF" }}
        >
          {isStreaming ? <Stop /> : <PlayArrow />}
          <span style={{ marginLeft: "5px", fontSize: "0.6em" }}>Stream</span>
        </IconButton>

        <IconButton
          onClick={handleRecordAction}
          disabled={!isStreaming}
          className={classes.button}
          style={{ color: isRecording ? "#ff0000" : "#9E58FF" }}
        >
          <FiberManualRecord />
          <span style={{ marginLeft: "5px", fontSize: "0.6em" }}>Record</span>
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
