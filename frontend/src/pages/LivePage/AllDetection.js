import React, { useState, useEffect } from "react";
import DetectionPage from "./DetectionPage";
import axios from "axios";
import { API_API_URL } from "../../config/serverApiConfig";
import { Grid, Button, Typography } from "@material-ui/core";

const AllDetection = () => {
  const [components, setComponents] = useState([]);
  const [streams, setStreams] = useState([]);
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
      setStreams(response.data);
      const newComponents = response.data.map((stream, index) => (
        <DetectionPage key={index} allCameras={cameras} stream={stream} />
      ));
      setComponents(newComponents);
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
      <DetectionPage key={prevComponents.length} allCameras={cameras} stream={{}} />
    ]);
  };

  return (
    <>

    <Grid container spacing={2}>
      {components.length !== 0 ? (
        components.map((component, index) => (
          <div key={index}>{component}</div>
        ))
      ) : (
        <Grid item xs={12} sm={6} md={4} >
          <DetectionPage key={0} allCameras={cameras} stream={{}} />
          </Grid>
      )}
        </Grid>
      <button onClick={addComponent}>+</button>
    
    </>
  );
};

export default AllDetection;
