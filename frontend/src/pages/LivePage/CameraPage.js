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
import { makeStyles } from "@material-ui/core/styles";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import InfoIcon from "@material-ui/icons/Info";
import { PlayArrow, Stop, FiberManualRecord } from "@material-ui/icons";
import { Col, Row } from "antd";
import axios from "axios";
import moment from "moment";
import JSMpeg from "@cycjimmy/jsmpeg-player";
import {
  API_API_URL,
  API_API_URLDetection,
  API_API_URLRTSP,
} from "../../config/serverApiConfig";
import { LinearProgress } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
    paddingTop: theme.spacing(4),
  },
  formContainer: {
    maxWidth: "600px",
    margin: "auto",
    padding: theme.spacing(4),
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: "8px",
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
    },
  },
  textField: {
    marginBottom: "15px", // Add margin bottom
    paddingBottom: "15px",
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
  button: {
    marginRight: theme.spacing(1),
    backgroundColor: "#9E58FF",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#8E4CE0",
    },
  },
  cameraList: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: "8px",
    border: `2px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
  },
  listItem: {
    marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    borderRadius: "4px",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    color: theme.palette.text.primary,
  },
  listItemText: {
    "& .MuiListItemText-primary": {
      fontWeight: "bold",
    },
    "& .MuiListItemText-secondary": {
      color: theme.palette.text.secondary,
    },
  },
  editButton: {
    color: "#9E58FF",
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

  pageTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: theme.spacing(3),
    color: theme.palette.text.primary,
  },
  pagination: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "center",
    "& .MuiPaginationItem-root": {
      color: "#9E58FF",
    },
  },
  dialogTitle: {
    //backgroundColor: "var(--background-color)",
    textAlign: "center", // Center the title
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

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
      const response = await axios.get(API_API_URL + "/api/cameras");
      setCameras(response.data);
    } catch (error) {
      console.error("Error fetching cameras:", error);
      showSnackbar("Failed to fetching cameras.", "error");
    }
  };

  const fetchCamerasAddress = async () => {
    try {
      const response = await axios.get(API_API_URLRTSP + "/scan_ips");
      setListAddress(response.data.list_ips);
      localStorage.setItem("addresses", JSON.stringify(response.data.list_ips));
    } catch (error) {
      console.error("Error fetching ip cameras:", error);
      showSnackbar("Failed fetching ip cameras.", "error");
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
      const res = await axios.post(API_API_URL + "/api/cameras", formData);
      if (res) {
        fetchCameras();
        setFormData({
          name: "",
          address: "",
          username: "",
          password: "",
          resolution: "",
        });
        //setLoading(false);
        setOpenDialog(false);
        showSnackbar("Camera added successfully!", "success");
      }
    } catch (error) {
      console.error("Error adding camera:", error);
      setLoading(false);
      showSnackbar("Failed to add camera.", "error");
    }
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

  const handleAddressChange = (event) => {
    setFormData({ ...formData, address: event.target.value });
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
    setInfoDialogOpen(false);
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

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Button
        variant="contained"
        className={classes.button}
        style={{
          fontFamily: "time",
          fontSize: "16px",
          backgroundColor: "#9E58FF",
          fontweight: "bold",
        }}
        onClick={() => setOpenDialog(true)}
      >
        + Add Camera
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
                setInfoDialogOpen={setInfoDialogOpen}
                setCurrentCamera={setCurrentCamera}
                classes={classes}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle
          className={classes.dialogTitle}
          style={{
            fontFamily: "time",
            fontSize: "25px",
            fontWeight: "bold",
          }}
        >
          Add Camera
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <FormControl
            fullWidth
            className={classes.textField}
            style={{ marginTop: "15px" }}
          >
            <TextField
              label="Camera Name"
              variant="outlined"
              //fullWidth
              //className={classes.textField}
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              style={{ marginTop: "15px" }}
            />
          </FormControl>

          <FormControl
            fullWidth
            variant="outlined"
            className={classes.textField}
            style={{ marginTop: "15px" }}
          >
            <InputLabel
              id="address-select-label"
              className={classes.inputLabel}
            >
              IP Address
            </InputLabel>
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

          <FormControl fullWidth className={classes.textField}>
            <TextField
              label="Username"
              variant="outlined"
              //fullWidth
              //className={classes.textField}
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              color="secondary"
              style={{ marginTop: "15px" }}
            />
          </FormControl>

          <FormControl fullWidth className={classes.textField}>
            <TextField
              label="Password"
              variant="outlined"
              //fullWidth
              //className={classes.textField}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              color="secondary"
              style={{ marginTop: "15px" }}
            />
          </FormControl>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          {loading == true && <CircularProgress color="secondary" />}
          {!loading && (
            <>
              <Button
                onClick={handleCloseDialog}
                variant="outlined"
                color="secondary"
                sx={{
                  color: "#F47B20",
                  borderColor: "#F47B20",
                  fontFamily: "time",
                }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                color="secondary"
                sx={{
                  backgroundColor: "#9E58FF",
                  color: "#ffff",
                  fontFamily: "time",
                }}
                onClick={handleAddCamera}
              >
                Save
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle
          className={classes.dialogTitle}
          style={{
            fontFamily: "time",
            fontSize: "25px",
            fontWeight: "bold",
          }}
        >
          Edit Camera
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <FormControl
            fullWidth
            className={classes.textField}
            style={{ marginTop: "15px" }}
          >
            <TextField
              label="Camera Name"
              variant="outlined"
              //fullWidth
              //className={classes.textField}
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              color="secondary"
            />
          </FormControl>

          <FormControl
            fullWidth
            variant="outlined"
            className={classes.textField}
            style={{ marginTop: "15px" }}
          >
            <InputLabel
              id="address-select-label"
              className={classes.inputLabel}
            >
              IP Address
            </InputLabel>
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

          <FormControl
            fullWidth
            className={classes.textField}
            style={{ marginTop: "15px" }}
          >
            <TextField
              label="Username"
              variant="outlined"
              //fullWidth
              //className={classes.textField}
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              color="secondary"
            />
          </FormControl>

          <FormControl
            fullWidth
            className={classes.textField}
            style={{ marginTop: "15px" }}
          >
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
          </FormControl>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          {loading == true && (
            <LinearProgress
              color="secondary"
              style={{
                backgroundColor: "#F47B20",
                color: "#9E58FF",
                marginTop: "10px",
              }}
            />
          )}
          {!loading && (
            <>
              <Button
                onClick={handleCloseDialog}
                variant="outlined"
                color="secondary"
                sx={{
                  color: "#F47B20",
                  borderColor: "#F47B20",
                  fontFamily: "time",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateCamera}
                variant="contained"
                color="secondary"
                sx={{
                  backgroundColor: "#9E58FF",
                  color: "#ffff",
                  fontFamily: "time",
                }}
              >
                Update
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={infoDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle className={classes.dialogTitle}>Camera Info</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Typography>Name: {currentCamera?.name}</Typography>
          <Typography>IP Address: {currentCamera?.address}</Typography>
          <Typography>Username: {currentCamera?.username}</Typography>
          <Typography>Password: {currentCamera?.password}</Typography>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button onClick={handleCloseDialog} color="primary">
            Close
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
