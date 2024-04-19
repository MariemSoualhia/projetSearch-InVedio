import React from 'react';
import NetworkConfig from './NetworkConfig'; // Importez votre composant NetworkConfig
import axios from "axios";
const NetworkConfigPage = () => {
  const handleNetworkConfig = async (config) => {


    try {
      const data = await axios.post("http://localhost:3002/config", config);
      console.log('Réponse du serveur :', data);
    
    } catch (error) {
      console.error("Error  :", error);
    }
  };

  return (
    <div >
    
      <NetworkConfig onConfig={handleNetworkConfig} />
    </div>
  );
};

export default NetworkConfigPage;
