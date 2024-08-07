import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  CircularProgress,
  Modal,
  Backdrop,
  Fade,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
  Alert,
  Snackbar,
  Slider
} from "@mui/material";
import {
  API_API_URL,
  API_API_URLDetection,
  API_API_URLRTSP,
  API_API_SEARCH,
} from "../../config/serverApiConfig";

const predefinedClasses = [
  "person",
  "bicycle",
  "car",
  "cat",
  "bag",
  "motorcycle",
  "airplane",
  "bus",
  "train",
  "truck",
  "boat",
  "traffic light",
  "fire hydrant",
  // Add more classes as needed
];

const VideoPlayer = ({ videoId, videoPath }) => {
  const videoRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [highlightTime, setHighlightTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [threshold, setThreshold] = useState(0.1);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }
  }, [videoId]);

  const handleClassChange = async (event) => {
    const {
      target: { value },
    } = event;
    setSelectedClasses(typeof value === "string" ? value.split(",") : value);
    setSearchResults([]); // Clear previous search results

    setLoading(true);
    try {
      const data = {
        video_path: videoPath,
        object: value, // Only search for the first selected class
        threshold: threshold
      };
      console.log(data)
      const response = await axios.post(API_API_SEARCH + "/detect", data);
      if (response.data.first_detection_time === undefined) {
        throw new Error("No detection time found for the selected class.");
      }
      const res = [response.data.first_detection_time];
      setSearchResults(res);
    } catch (error) {
      console.error("Error fetching detection times:", error);
      setAlertMessage(error.message || "Failed to search in video.");
      setAlertSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (event, newValue) => {
    setThreshold(newValue);
  };

  const handleResultClick = (timestamp) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      videoRef.current.pause();
      // Capture the frame after seeking to the timestamp
      videoRef.current.addEventListener("seeked", captureFrame, { once: true });
    }
    setHighlightTime(timestamp);
    setSearchResults([]); // Clear search results when a timestamp is clicked
  };

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = canvas.toDataURL("image/jpeg");
    setSelectedFrame(frame);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedFrame(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={alertSeverity}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
      <FormControl variant="outlined" fullWidth margin="normal">
        <InputLabel id="class-select-label">Select Classes</InputLabel>
        <Select
          labelId="class-select-label"
          value={selectedClasses}
          onChange={handleClassChange}
          input={
            <OutlinedInput id="select-multiple-chip" label="Select Classes" />
          }
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {predefinedClasses.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ width: "80%", margin: "20px auto" }}>
        <Typography variant="h6">Accuracy: {threshold.toFixed(2)}</Typography>
        <Slider
          value={threshold}
          onChange={handleSliderChange}
          step={0.05}
          marks
          min={0}
          max={1}
          valueLabelDisplay="auto" 
          sx={{
            color: "#9E58FF", 
            '& .MuiSlider-thumb': {
              width: 24,
              height: 24,
              '&:focus, &:hover, &.Mui-active': {
                boxShadow: '0px 0px 0px 8px rgba(158, 88, 255, 0.16)',
              },
            },
            '& .MuiSlider-track': {
              height: 8,
            },
            '& .MuiSlider-rail': {
              height: 8,
            },
          }}
        />
      </Box>
      <video
        ref={videoRef}
        width="100%"
        height="300px"
        controls
        crossOrigin="anonymous"
        style={{ borderRadius: 8 }}
      >
        <source src={API_API_URL + `/api/videos/${videoId}`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {searchResults.length > 0 && (
        <List>
          {searchResults.map((timestamp, index) => (
            <ListItem
              button
              key={index}
              onClick={() => handleResultClick(timestamp)}
            >
              <ListItemText primary={`Result at ${timestamp} seconds`} />
            </ListItem>
          ))}
        </List>
      )}
      <Typography variant="h6" gutterBottom>
        
      </Typography>
      <Paper
        elevation={3}
        sx={{ overflowX: "auto", whiteSpace: "nowrap", padding: 1 }}
      >
        {loading && <CircularProgress />}
      </Paper>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={modalOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "80%",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            {selectedFrame && (
              <img src={selectedFrame} alt="Selected Frame" width="100%" />
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default VideoPlayer;
