import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";

const VideoPlayer = ({ videoId }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [highlightTime, setHighlightTime] = useState(null);
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(false);
  const frameWidth = 100;
  const frameHeight = 60;
  const frameInterval = 5; // seconds

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }
  }, [videoId]);

  useEffect(() => {
    const captureFrames = async () => {
      if (videoRef.current) {
        setLoading(true);
        const video = videoRef.current;
        video.crossOrigin = "anonymous";
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const framesArray = [];

        video.addEventListener("loadeddata", () => {
          canvas.width = frameWidth;
          canvas.height = frameHeight;
          const captureFrame = (time) => {
            video.currentTime = time;
            video.addEventListener(
              "seeked",
              function capture() {
                context.drawImage(video, 0, 0, frameWidth, frameHeight);
                framesArray.push(canvas.toDataURL("image/jpeg"));
                if (time + frameInterval < video.duration) {
                  captureFrame(time + frameInterval);
                } else {
                  setFrames(framesArray);
                  setLoading(false);
                }
                video.removeEventListener("seeked", capture);
              },
              { once: true }
            );
          };
          captureFrame(0);
        });
      }
    };

    captureFrames();
  }, [videoId]);

  const handleSearchChange = async (event) => {
    setSearchTerm(event.target.value);
    if (event.target.value.length > 2) {
      const response = await axios.get(
        `http://localhost:3002/api/videos/${videoId}/search?term=${event.target.value}`
      );
      setSearchResults(response.data.results);
    } else {
      setSearchResults([]);
    }
  };

  const handleResultClick = (timestamp) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      //videoRef.current.play();
    }
    setHighlightTime(timestamp);
    setSearchResults([]); // Clear search results when a timestamp is clicked
  };

  const handleVideoTimeUpdate = () => {
    const currentTime = videoRef.current.currentTime;
    const frameIndex = Math.floor(currentTime / frameInterval);
    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      frames.forEach((frame, index) => {
        const img = new Image();
        img.src = frame;
        img.onload = () => {
          const x = index * frameWidth;
          context.drawImage(img, x, 0, frameWidth, frameHeight);
          if (index === frameIndex) {
            context.strokeStyle = "red";
            context.lineWidth = 2;
            context.strokeRect(x, 0, frameWidth, frameHeight);
          }
        };
      });
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <TextField
        label="Search within video"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={handleSearchChange}
        margin="normal"
      />
      <video
        ref={videoRef}
        width="100%"
        height="300px"
        controls
        onTimeUpdate={handleVideoTimeUpdate}
        autoPlay
        crossOrigin="anonymous"
        style={{ borderRadius: 8 }}
      >
        <source
          src={`http://localhost:3002/api/videos/${videoId}`}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
      {searchResults.length > 0 && (
        <List>
          {searchResults.map((result, index) => (
            <ListItem
              button
              key={index}
              onClick={() => handleResultClick(result.timestamp)}
            >
              <ListItemText primary={`Result at ${result.timestamp} seconds`} />
            </ListItem>
          ))}
        </List>
      )}
      <Typography variant="h6" gutterBottom>
        Video Frames:
      </Typography>
      <Paper
        elevation={3}
        sx={{ overflowX: "auto", whiteSpace: "nowrap", padding: 1 }}
      >
        {loading ? (
          <CircularProgress />
        ) : (
          <canvas
            ref={canvasRef}
            width={frames.length * frameWidth}
            height={frameHeight}
          />
        )}
      </Paper>
    </Box>
  );
};

export default VideoPlayer;
