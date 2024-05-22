import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

const VideoPlayer = ({ videoId }) => {
  const videoRef = useRef(null);
  const previewRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [highlightTime, setHighlightTime] = useState(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }
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
      videoRef.current.play();
    }
    setHighlightTime(timestamp);
    if (previewRef.current) {
      previewRef.current.currentTime = timestamp;
    }
  };

  const handlePreviewTimeUpdate = () => {
    if (previewRef.current) {
      const currentTime = previewRef.current.currentTime;
      if (currentTime >= highlightTime && currentTime < highlightTime + 5) {
        previewRef.current.style.border = "5px solid red";
      } else {
        previewRef.current.style.border = "none";
      }
    }
  };

  return (
    <Box>
      <TextField
        label="Search within video"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={handleSearchChange}
        margin="normal"
      />
      <video ref={videoRef} width="100%" height="300px" controls autoPlay>
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
      {/* <Typography variant="h6" gutterBottom>
        Preview:
      </Typography>
      <video
        ref={previewRef}
        width="100%"
        height="150px"
        controls
        onTimeUpdate={handlePreviewTimeUpdate}
      >
        <source
          src={`http://localhost:3002/api/videos/${videoId}`}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video> */}
    </Box>
  );
};

export default VideoPlayer;
