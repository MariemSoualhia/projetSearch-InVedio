import React, { useState, useEffect } from "react";
import DetectionPage from "./DetectionPage";
import axios from "axios";
import { API_API_URL } from "../../config/serverApiConfig";
import { Grid, Button } from "@material-ui/core";
import QueuePlayNextIcon from '@mui/icons-material/QueuePlayNext';
const AllDetection = () => {
  const [components, setComponents] = useState([]);
  const [cameras, setCameras] = useState([]);

  const fetchCameras = async () => {
    try {
      const response = await axios.get(API_API_URL + "/api/cameras");
      console.log("Cameras:", response.data);
      setCameras(response.data);
    } catch (error) {
      console.error("Error fetching cameras:", error);
    }
  };

  const fetchStreams = async () => {
    try {
      const response = await axios.get(API_API_URL + "/api/stream/play");
      console.log("Streams:", response.data);
      if (response.data.length === 0) {
        setComponents([
          {
            id: "default-stream",
            stream: (
              <Grid item xs={6} key="default-stream">
                <DetectionPage allCameras={cameras} stream={{}} />
              </Grid>
            )
          }
        ]);
      } else {
        setComponents(
          response.data.map((stream, index) => ({
            id: `stream-${index}`,
            stream: (
              <Grid item xs={6} key={`stream-${index}`}>
                <DetectionPage allCameras={cameras} stream={stream} />
              </Grid>
            )
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

  const addComponent = () => {
    setComponents(prevComponents => [
      ...prevComponents,
      {
        id: `stream-${prevComponents.length}`,
        stream: (
          <Grid item xs={6} key={`stream-${prevComponents.length}`}>
            <DetectionPage allCameras={cameras} stream={{}} />
          </Grid>
        )
      }
    ]);
  };

  return (
    <>
      <Grid container spacing={2}>
      <Grid container spacing={2}>
        {components.map(component => component.stream)}
   
  
      </Grid>
      <Button  variant="contained" onClick={addComponent}>
      <QueuePlayNextIcon />
      </Button>
      </Grid>
    </>
  );
};

export default AllDetection;
