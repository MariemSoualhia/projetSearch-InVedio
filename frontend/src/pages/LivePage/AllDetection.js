import React, { useState, useEffect } from "react";
import DetectionPage from "./DetectionPage";
import axios from "axios";
import {
  API_API_URL,
  API_API_URLDetection,
  API_API_URLRTSP,
} from "../../config/serverApiConfig";
import {
  Grid,
  Button,
  Typography,
  CircularProgress,
  Box,
} from "@material-ui/core";
import QueuePlayNextIcon from "@mui/icons-material/QueuePlayNext";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
    paddingTop: theme.spacing(4),
  },
  form: {
    maxWidth: "600px",
    margin: "auto",
    padding: theme.spacing(4),
    border: `2px solid var(--border-color)`,
    borderRadius: "8px",
    backgroundColor: "var(--form-background-color)",
    boxShadow: theme.shadows[3],
  },
  textField: {
    marginBottom: "15px",
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
      "&.Mui-focused + .MuiInputLabel-root": {
        color: "#F47B20",
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
  },
  tableContainer: {
    marginTop: theme.spacing(2),
    backgroundColor: "var(--background-color)",
    borderRadius: "8px",
    border: `2px solid var(--border-color)`,
    padding: theme.spacing(2),
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: theme.spacing(3),
    color: "var(--text-color)",
  },
  tableHeader: {
    fontWeight: "bold",
    fontFamily: "time",
    color: "#F47B20",
  },
  pagination: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "center",
    "& .MuiPaginationItem-root": {
      color: "#9E58FF",
    },
    "& .Mui-selected": {
      color: "#F47B20",
      backgroundColor: "#e1ccff",
    },
  },
  dialogTitle: {
    textAlign: "center",
    color: "var(--text-color)",
  },
  dialogContent: {
    color: "var(--text-color)",
  },
  dialogActions: {
    color: "var(--text-color)",
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
  uploadButton: {
    marginRight: theme.spacing(1),
    backgroundColor: "#9E58FF",
    color: "#fff",
    fontFamily: "time",
    marginBottom: theme.spacing(2),
  },
}));

const AllDetection = () => {
  const [components, setComponents] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const classes = useStyles();

  const fetchCameras = async () => {
    try {
      const response = await axios.get(API_API_URL + "/api/cameras");
      console.log("Cameras:", response.data);
      setCameras(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cameras:", error);
      setLoading(false);
    }
  };

  const fetchStreams = async () => {
    try {
      const response = await axios.get(API_API_URL + "/api/stream/play");
      console.log("Streams:", response.data);
      if (response.data.length === 0) {
      } else {
        setComponents(
          response.data.map((stream, index) => ({
            id: `stream-${index}`,
            stream: (
              <Grid item xs={6} key={`stream-${index}`}>
                <DetectionPage allCameras={cameras} stream={stream} />
              </Grid>
            ),
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching streams:", error);
    }
  };

  useEffect(() => {
    fetchCameras();
    fetchStreams();
  }, []);

  const addComponent = (camera) => {
    setComponents((prevComponents) => [
      ...prevComponents,
      {
        id: `stream-${prevComponents.length}`,
        stream: (
          <Grid item xs={6} key={`stream-${prevComponents.length}`}>
            <DetectionPage
              camera={camera}
              allCameras={cameras}
              stream={camera}
            />
          </Grid>
        ),
      },
    ]);
  };

  const handleCameraButtonClick = (camera) => {
    addComponent(camera);
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
      const response = await axios.post(API_API_URL + "/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setUploadStatus("File uploaded successfully");
        const dataCam = {
          rtspUrl: response.data.filePath,
          name: response.data.filePath,
        };
        console.log("File uploaded successfully", response.data.filePath);
        handleCameraButtonClick(dataCam);
      } else {
        setUploadStatus("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("Error uploading file");
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {loading ? (
            <CircularProgress />
          ) : (
            <Grid container spacing={2}>
              {cameras.map((camera) => (
                <Grid item key={camera.id}>
                  <Button
                    variant="contained"
                    className={classes.button}
                    style={{
                      fontFamily: "time",
                      fontSize: "16px",
                      backgroundColor: "#9E58FF",
                      fontWeight: "bold",
                    }}
                    onClick={() => handleCameraButtonClick(camera)}
                    startIcon={<QueuePlayNextIcon />}
                  >
                    {camera.name}
                  </Button>
                </Grid>
              ))}
  
            </Grid>
          )}
        </Grid>
        <Grid container spacing={2}>
          {components.map((component) => component.stream)}
        </Grid>
      </Grid>
    </>
  );
};

export default AllDetection;
