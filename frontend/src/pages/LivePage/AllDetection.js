import React, { useState, useEffect } from "react";
import DetectionPage from "./DetectionPage"; // Importez le composant que vous voulez afficher
import axios from "axios";
import { API_API_URL } from "../../config/serverApiConfig";

const AllDetection = () => {
  const [components, setComponents] = useState([]);
  const [streams, setStreams] = useState([]);

  const [cameras, setCameras] = useState([]);
  const fetchCameras = async () => {
    try {
      const response = await axios.get(API_API_URL + "/api/cameras");
      console.log("fiirsstttt", response.data);
      setCameras(response.data);
    } catch (error) {
      console.error("Error fetching cameras:", error);
    }
  };
  const fetchStreams = async () => {
    try {
      const response = await axios.get(API_API_URL + "/api/stream/play");
      console.log("fiirsstttt", response.data);
      setStreams(response.data);
    } catch (error) {
      console.error("Error fetching cameras:", error);
    }
  };
  useEffect(() => {
    fetchCameras();
    fetchStreams();
    //initializeVideo();
  }, []);
  const addComponent = () => {
    const newComponents = [...components];
    newComponents.push(
      <DetectionPage key={newComponents.length} allCameras={cameras} />
    );
    setComponents(newComponents);
  };
  useEffect(() => {
    const newComponents = streams
      .filter((stream) => stream.streamplay === true)
      .map((stream, index) => (
        <DetectionPage key={index} allCameras={cameras} stream={stream} />
      ));
    setComponents(newComponents);
  }, [streams, cameras]);

  return (
    <>
      {components.map((component, index) => (
        <div key={index}>{component}</div>
      ))}
      <button onClick={addComponent}>+</button>
    </>
  );
};

export default AllDetection;
