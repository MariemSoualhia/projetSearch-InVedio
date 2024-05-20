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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    margin: "0 auto",
    padding: theme.spacing(4),
    border: "1px solid var(--border-color)",
    borderRadius: theme.spacing(2),
    backgroundColor: "var(--background-color)",
  },
  title: {
    marginBottom: theme.spacing(2),
    fontWeight: "bold",
    fontSize: "1.5rem",
    color: "var(--text-color)",
    borderBottom: `2px solid var(--text-color)`,
    paddingBottom: theme.spacing(1),
  },
  videoCard: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    backgroundColor: "var(--input-background-color)",
    borderRadius: theme.spacing(1),
  },
  videoTitle: {
    marginBottom: theme.spacing(1.5),
    color: "var(--text-color)",
    fontWeight: "bold",
    fontSize: "1.2rem",
    textAlign: "center",
  },
  cameraInfo: {
    marginBottom: theme.spacing(1),
    textAlign: "center",
    color: "var(--text-color)",
  },
  deleteButton: {
    color: theme.palette.error.main,
  },
  downloadButton: {
    color: theme.palette.success.main,
  },
  searchField: {
    marginBottom: theme.spacing(2),
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "var(--input-border-color)",
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
  pagination: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(3),
    "& .MuiPaginationItem-root": {
      color: "#9E58FF",
    },
  },
}));

const VideoList = () => {
  const classes = useStyles();
  const [videos, setVideos] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
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

  const fetchVideos = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:3002/api/videos/", {
        params: { search: searchTerm },
      });
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const handleDelete = async (videoId) => {
    try {
      await axios.delete(`http://127.0.0.1:3002/api/videos/${videoId}`);
      fetchVideos();
    } catch (error) {
      console.error("Error deleting video:", error);
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

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDownload = async (videoId) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:3002/api/videos/${videoId}/download`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${videoId}.mp4`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading video:", error);
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
        <Button onClick={handleThemeToggle}>
          Toggle to {darkMode ? "Light" : "Dark"} Mode
        </Button>
        <Typography variant="h4" gutterBottom className={classes.title}>
          Video List
        </Typography>

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
          {videos.slice(startIndex, endIndex).map((video) => (
            <Grid item key={video._id} xs={12} sm={6} md={4}>
              <Paper elevation={3} className={classes.videoCard}>
                <Typography variant="h6" className={classes.videoTitle}>
                  {video.name}
                </Typography>
                <Typography variant="body2" className={classes.cameraInfo}>
                  <strong>Camera:</strong> {video.cameraName}
                </Typography>
                <VideoPlayer videoId={video._id} width="100%" height="300px" />
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
                    onClick={() => handleDownload(video._id)}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          ))}
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
      </Container>
    </ThemeProvider>
  );
};

export default VideoList;
