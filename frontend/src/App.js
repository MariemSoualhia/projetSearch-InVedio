import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Layout from './composants/Layout/Layout';
import LivePage from './pages/LivePage/LivePage';
import CameraConfig from './pages/CameraConfig/CameraConfig';
import LoginPage from "./pages/Login/LoginPage";
import VideoList from "./pages/RecordsPage/VideoList";
import NetworkConfigPage from "./pages/NetworkConfig/NetworkConfigPage";
import CanvasLine from "./CanvasLine";
import CanvasWithArea from "./CanvasWithArea";
import MultipleStreamsPage from "./pages/LivePage/MultipleStreamsPage";
// Fonction pour vérifier si l'utilisateur est connecté
const isUserAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token; // Renvoie true si le token existe, sinon false
};

function App() {
  return (
    <Router>
      {
        isUserAuthenticated()? (<Layout>
          <Routes>
            {/* Route protégée pour la page Live */}
            <Route path="/" element={isUserAuthenticated() ? <LivePage /> : <Navigate to="/login" />} />
            
            {/* Route protégée pour la page Live */}
            <Route path="/live" element={isUserAuthenticated() ? <LivePage /> : <Navigate to="/login" />} />
            <Route path="/liveAll" element={isUserAuthenticated() ? <MultipleStreamsPage /> : <Navigate to="/login" />} />

            {/* Route protégée pour la page CameraConfig */}
            <Route path="/camera_config" element={isUserAuthenticated() ? <CameraConfig /> : <Navigate to="/login" />} />
            <Route path="/videoList" element={isUserAuthenticated() ? <VideoList /> : <Navigate to="/login" />} />
            <Route path="/networkConfig" element={isUserAuthenticated() ? <NetworkConfigPage /> : <Navigate to="/login" />} />
            <Route path="/canvasLine" element={isUserAuthenticated() ? <CanvasLine /> : <Navigate to="/login" />} />
            <Route path="/canvasWithArea" element={isUserAuthenticated() ? <CanvasWithArea /> : <Navigate to="/login" />} />
            
            {/* Route publique pour la page Login */}
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </Layout>): (<Routes>
         
            
            {/* Route publique pour la page Login */}
            <Route path="/login" element={<LoginPage />} />
          </Routes>)
      }
      
    </Router>
  );
}

export default App;
