import React, { useEffect, useState } from "react";
import axios from "axios";
import VideoPlayer from "./VideoPlayer";
import {
  Button,
  Typography,
  TextField,
  Modal,
  Box,
  Grid,
  Paper,
  IconButton,
  Pagination,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  MenuItem,
  Select,
  Alert,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  // ... your existing styles
}));

const CLIENT_ID =
  "1006175347970-bgkml5qrl8296b1ndi4630m6satmq7qg.apps.googleusercontent.com";
const API_KEY = "AIzaSyB1u_yZ4ebhUsm-LXjtib-U7CTLTf_sq-s";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

const VideoList = () => {
  const classes = useStyles();
  const [videos, setVideos] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [videoToShare, setVideoToShare] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sharePlatform, setSharePlatform] = useState("");
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [error, setError] = useState("");
  const [succes, setSucces] = useState("");
  const [loading, setLoading] = useState(false);
  const videosPerPage = 6;

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  useEffect(() => {
    fetchVideos();
  }, [page, searchTerm]);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const loadGapi = () => {
      if (window.gapi) {
        window.gapi.load("client", initClient);
      } else {
        console.error("Google API client library not found.");
        setError("Google API client library not found.");
      }
    };

    if (window.gapi) {
      loadGapi();
    } else {
      window.addEventListener("gapi-load", loadGapi);
    }

    return () => window.removeEventListener("gapi-load", loadGapi);
  }, []);

  const initClient = async () => {
    try {
      await window.gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
        ],
      });
      setGapiLoaded(true);
    } catch (error) {
      console.error("Error initializing GAPI client:", error);
      setError("Failed to initialize Google API client.");
    }
  };

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:3002/api/videos/", {
        params: { search: searchTerm },
      });
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setError("Failed to fetch videos.");
    }
    setLoading(false);
  };

  const handleDelete = async (videoId) => {
    try {
      await axios.delete(`http://127.0.0.1:3002/api/videos/${videoId}`);
      fetchVideos();
    } catch (error) {
      console.error("Error deleting video:", error);
      setError("Failed to delete video.");
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setVideoToDelete(null);
  };

  const handleShowDeleteModal = (videoId) => {
    setVideoToDelete(videoId);
    setShowDeleteModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setVideoToShare(null);
    setSharePlatform("");
  };

  const handleShowShareModal = (videoId) => {
    setVideoToShare(videoId);
    setShowShareModal(true);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDownload = async (videoId, videoName) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:3002/api/videos/${videoId}/download`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "video/mp4" });
      const handle = await window.showSaveFilePicker({
        suggestedName: `${videoName}.mp4`,
        types: [
          {
            accept: {
              "video/mp4": [".mp4"],
            },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      setSucces("download video");
    } catch (error) {
      console.error("Error downloading video:", error);
      setError("Failed to download video.");
    }
  };

  const handleGoogleDriveAuth = () => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) {
          console.error("Error during Google Drive authentication:", response);
          setError("Failed to authenticate with Google Drive.");
          return;
        }
        handleShare(response.access_token);
      },
    });

    tokenClient.requestAccessToken({ prompt: "consent" });
  };

  const handleShare = async (accessToken) => {
    try {
      // Fetch the video URL from your server
      const response = await axios.get(
        `http://127.0.0.1:3002/api/videos/${videoToShare}/url`
      );
      console.log("Video URL response:", response.data);
      const videoUrl = response.data.url;

      // Check if the video URL is accessible
      const headResponse = await fetch(videoUrl, { method: "HEAD" });
      if (!headResponse.ok) {
        throw new Error(`Failed to fetch video: ${headResponse.statusText}`);
      }
      console.log("Video HEAD response:", headResponse);

      // Fetch the video blob from the URL
      const videoResponse = await fetch(videoUrl);
      if (!videoResponse.ok) {
        throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
      }
      const videoBlob = await videoResponse.blob();
      console.log("Video blob:", videoBlob);

      // Check the size of the blob
      if (videoBlob.size < 1024) {
        throw new Error(
          "The video blob is too small, indicating an issue with fetching the video content."
        );
      }

      const fileMetadata = {
        name: "Shared Video",
        mimeType: videoBlob.type, // Use the correct MIME type from the blob
      };

      // Load the Google Drive API client
      await window.gapi.client.load("drive", "v3");

      // Initialize the Google API client with the access token
      window.gapi.client.setToken({ access_token: accessToken });

      // Create FormData to handle the file upload
      const formData = new FormData();
      formData.append(
        "metadata",
        new Blob([JSON.stringify(fileMetadata)], { type: "application/json" })
      );
      formData.append("file", videoBlob);

      // Create the file on Google Drive using fetch
      const uploadResponse = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: new Headers({
            Authorization: `Bearer ${accessToken}`,
          }),
          body: formData,
        }
      );

      const uploadResult = await uploadResponse.json();
      if (!uploadResult.id) {
        throw new Error("Failed to upload video to Google Drive");
      }

      const driveShareUrl = `https://drive.google.com/file/d/${uploadResult.id}/view`;
      window.open(driveShareUrl, "_blank");

      setShowShareModal(false);
      setVideoToShare(null);
      setSharePlatform("");
    } catch (error) {
      console.error("Error sharing video:", error);
      setError("Failed to share video.");
    }
  };

  const startIndex = (page - 1) * videosPerPage;
  const endIndex = startIndex + videosPerPage;

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
      <Container>
        <Typography variant="h4" gutterBottom className={classes.title}>
          Video List
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {succes && <Alert severity="success">{succes}</Alert>}
        <TextField
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          fullWidth
          margin="normal"
          placeholder="Search for videos..."
          className={classes.searchField}
        />

        <Grid container spacing={3}>
          {loading ? (
            <CircularProgress />
          ) : (
            videos.slice(startIndex, endIndex).map((video) => (
              <Grid item key={video._id} xs={12} sm={6} md={4}>
                <Paper elevation={3} className={classes.videoCard}>
                  <Typography variant="h6" className={classes.videoTitle}>
                    {video.name}
                  </Typography>
                  <Typography variant="body2" className={classes.cameraInfo}>
                    <strong>Camera:</strong> {video.cameraName}
                  </Typography>
                  <VideoPlayer
                    videoId={video._id}
                    width="100%"
                    height="300px"
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: 2,
                    }}
                  >
                    <IconButton
                      aria-label="delete"
                      className={classes.deleteButton}
                      onClick={() => handleShowDeleteModal(video._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      aria-label="download"
                      className={classes.downloadButton}
                      onClick={() => handleDownload(video._id, video.name)}
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      aria-label="share"
                      className={classes.shareButton}
                      onClick={() => handleShowShareModal(video._id)}
                    >
                      <ShareIcon />
                    </IconButton>
                  </Box>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: 3 }}>
          <Pagination
            count={Math.ceil(videos.length / videosPerPage)}
            page={page}
            onChange={handlePageChange}
            color="primary"
            className={classes.pagination}
          />
        </Box>

        <Modal open={showDeleteModal} onClose={handleCloseDeleteModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              minWidth: 300,
              maxWidth: 400,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Confirm Deletion
            </Typography>
            <Typography gutterBottom>
              Are you sure you want to delete this video?
            </Typography>
            <Box
              sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}
            >
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCloseDeleteModal}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleDelete(videoToDelete);
                  handleCloseDeleteModal();
                }}
                sx={{ marginLeft: 1 }}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Modal>

        <Modal open={showShareModal} onClose={handleCloseShareModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              minWidth: 300,
              maxWidth: 400,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Share Video
            </Typography>
            <Select
              value={sharePlatform}
              onChange={(e) => setSharePlatform(e.target.value)}
              displayEmpty
              fullWidth
            >
              <MenuItem value="" disabled>
                Select a platform
              </MenuItem>
              <MenuItem value="GoogleDrive">Google Drive</MenuItem>
              {/* Add more platforms here */}
            </Select>
            <Box
              sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}
            >
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCloseShareModal}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGoogleDriveAuth}
                sx={{ marginLeft: 1 }}
                disabled={!sharePlatform}
              >
                Share
              </Button>
            </Box>
          </Box>
        </Modal>
      </Container>
    </ThemeProvider>
  );
};

export default VideoList;
