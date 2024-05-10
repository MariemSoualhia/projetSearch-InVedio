import React, { useState , useEffect} from "react";
import DetectionPage from "./DetectionPage"; // Importez le composant que vous voulez afficher
import axios from "axios"
import { API_API_URL } from "../../config/serverApiConfig";

const AllDetection = () => {
  const [components, setComponents] = useState([]);
  const [cameras, setCameras] = useState([]);
  const fetchCameras = async () => {
    try {
      const response = await axios.get(API_API_URL+"/api/cameras");
      console.log("fiirsstttt", response.data)
      setCameras(response.data);
    } catch (error) {
      console.error("Error fetching cameras:", error);
    }
  };
  useEffect(() => {

    fetchCameras();
    //initializeVideo();
  }, []);
  const addComponent = () => {
    const newComponents = [...components];
    newComponents.push(<DetectionPage key={newComponents.length} allCameras={cameras} />);
    setComponents(newComponents);
  };

 
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
