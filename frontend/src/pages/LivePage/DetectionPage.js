import React, { useState, useRef, useEffect } from "react";
import JSMpeg from "@cycjimmy/jsmpeg-player";
import moment from "moment";
import axios from "axios";
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
  ListItemIcon,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  FormGroup,
  Box,
  Select,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import { Col, Row } from "antd";
import { makeStyles } from "@material-ui/core/styles";
import { ContactSupportOutlined, Videocam } from "@material-ui/icons";
import { API_API_URL } from "../../config/serverApiConfig";

const useStyles = makeStyles((theme) => ({
  streamContainer: {
    position: "relative",
    width: "854px",
    height: "480px",
  },
  stream: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: theme.spacing(1),
    backgroundColor: "transparent",
  },
  controlsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: "#f0f0f0",
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
  },
  button: {
    margin: theme.spacing(1),
    borderRadius: theme.spacing(2),
    color: "#fff",
  },
  buttonStop: {
    margin: theme.spacing(1),
    borderRadius: theme.spacing(2),
    padding: `${theme.spacing(1)}px ${theme.spacing(3)}px`,
    color: "#fff",
    backgroundColor: "#f44336",
  },
  radio: {
    "&$checked": {
      color: "#f44336",
    },
  },
  checked: {},
}));

const DetectionPage = ({ camera, stream: initialStream, allCameras }) => {
  const classes = useStyles();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedCamera, setSelectedCamera] = useState({
    name: "",
  });
  const [stream, setStream] = useState(initialStream);
  const [videoPath, setVideoPath] = useState("");

  const handleCameraButtonClick = (camera) => {
    // Your existing functionality to handle camera button click
  };

  const handleFileChange = (event) => {
    setVideoPath(URL.createObjectURL(event.target.files[0]));
  };

  const handleUpload = async () => {
    if (!videoFile) return;

    const formData = new FormData();
    formData.append("file", videoFile);

    try {
      const response = await axios.post(`${API_API_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        console.log("Video uploaded successfully:", response.data);
        // Handle the uploaded video (e.g., set video path)
      } else {
        console.error("Error uploading video:", response.data.message);
      }
    } catch (error) {
      console.error("Error uploading video:", error);
    }
  };

  return (
    <>
      <div className={classes.streamContainer}>
        <video
          id="video-player"
          ref={videoRef}
          className={classes.stream}
          autoPlay
          controls
          playsInline
          muted
        >
          Your browser does not support video
          <source src={videoPath} type="video/mp4" />
        </video>

        <canvas
          ref={canvasRef}
          className={classes.stream}
          width={960}
          height={544}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
        />
      </div>
      {!stream.output_port && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleCameraButtonClick(camera)}
          className={classes.button}
        >
          Play
        </Button>
      )}

      {(stream.output_port || videoPath) && (
        <>
          <Box sx={{ width: "100%", textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              {stream.stream_name} : {stream.input_stream}
            </Typography>
          </Box>
          <Row>
            <Col span={12}>
              <FormControl component="fieldset">
                <RadioGroup
                  color="#f44336"
                  aria-labelledby="demo-radio-buttons-group-label"
                  value={drawMode}
                  onChange={handleDrawModeChange}
                  row
                >
                  <FormControlLabel
                    value="roi"
                    control={
                      <Radio
                        classes={{
                          root: classes.radio,
                          checked: classes.checked,
                        }}
                      />
                    }
                    label="ROI"
                  />
                  <FormControlLabel
                    value="line"
                    control={
                      <Radio
                        classes={{
                          root: classes.radio,
                          checked: classes.checked,
                        }}
                      />
                    }
                    label="Trippwaire"
                  />
                </RadioGroup>
              </FormControl>
            </Col>
            <Col span={12}>
              <InputLabel id="demo-simple-select-label">
                Link to zone{" "}
              </InputLabel>
              <Select labelId="direction-label" id="direction-select" required>
                {drawMode === "roi" &&
                  internalZones.map((zone, index) => (
                    <MenuItem
                      key={index}
                      value={zone.zone_name}
                      onClick={() => handleSelectLink(zone)}
                    >
                      {zone.zone_name}
                    </MenuItem>
                  ))}
                {drawMode === "line" &&
                  gateZones.map((zone, index) => (
                    <MenuItem
                      key={index}
                      value={zone.zone_name}
                      onClick={() => handleSelectLink(zone)}
                    >
                      {zone.zone_name}
                    </MenuItem>
                  ))}
              </Select>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              {drawMode === "roi" && (
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isTimer === "on"}
                        onChange={handleTimerChange}
                        classes={{
                          root: classes.radio,
                          checked: classes.checked,
                        }}
                      />
                    }
                    label="Timer"
                  />
                </FormGroup>
              )}
            </Col>
            <Row></Row>
          </Row>
          <Row>
            {drawMode === "line" && (
              <>
                <Col span={8}>
                  <FormControl style={{ width: "80%" }}>
                    <InputLabel id="demo-simple-select-label">
                      Position
                    </InputLabel>
                    <Select
                      labelId="direction-label"
                      id="direction-select"
                      value={drawDirection}
                      onChange={handleDirectionChange}
                    >
                      <MenuItem value="left">Left</MenuItem>
                      <MenuItem value="right">Right</MenuItem>
                    </Select>
                  </FormControl>
                </Col>
                <Col span={8}>
                  <FormControl style={{ width: "80%" }}>
                    <InputLabel>Flow direction</InputLabel>
                    <Select
                      labelId="direction-label"
                      id="direction-select"
                      value={drawFlowDirection}
                      onChange={handleFlowDirectionChange}
                    >
                      <MenuItem value="in_out">In/Out</MenuItem>
                      <MenuItem value="in">In</MenuItem>
                      <MenuItem value="out">Out</MenuItem>
                    </Select>
                  </FormControl>
                </Col>
              </>
            )}
          </Row>
          <br />
          <br />
          <Row>
            <Col span={6}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => drawRectangle(drawDirection)}
                className={classes.button}
                disabled={!link}
              >
                Start Counting
              </Button>
            </Col>
            <Col span={6}>
              <Button
                variant="contained"
                onClick={stopStream}
                className={classes.buttonStop}
              >
                Stop Stream
              </Button>
            </Col>
            <Col span={6}>
              <Button
                variant="contained"
                color="primary"
                onClick={clearCanvas}
                disabled={!isDrawingStart}
                className={classes.button}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default DetectionPage;
