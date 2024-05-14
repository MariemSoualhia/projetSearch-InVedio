import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout from "./composants/Layout/Layout";
import LivePage from "./pages/LivePage/LivePage";
import CameraConfig from "./pages/CameraConfig/CameraConfig";
import LoginPage from "./pages/Login/LoginPage";
import VideoList from "./pages/RecordsPage/VideoList";
import NetworkConfigPage from "./pages/NetworkConfig/NetworkConfigPage";
import CanvasLine from "./CanvasLine";
import CanvasWithArea from "./CanvasWithArea";
import MultipleStreamsPage from "./pages/LivePage/MultipleStreamsPage";
import VideoComponent from "./pages/VideoComponent/VideoComponent";
import StreamPage from "./pages/VideoComponent/StreamPage";
//import WebRTCStreamer from "./pages/VideoComponent/WebRTCStreamer";
import DetectionPage from "./pages/LivePage/DetectionPage";
import AllDetection from "./pages/LivePage/AllDetection";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import VideoUpload from "./pages/LivePage/VideoUpload";
import ZoneManager from "./pages/zoneManager/zoneManager";
import SettingsPage from "./pages/Settings/SettingsPage";
// Fonction pour vérifier si l'utilisateur est connecté
const isUserAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token; // Renvoie true si le token existe, sinon false
};

function App() {
  return (
    <Router>
      {isUserAuthenticated() ? (
        <Layout>
          <Routes>
            {/* Routes protégées */}
            <Route path="/" element={<MultipleStreamsPage />} />
            <Route path="/live" element={<LivePage />} />
            <Route path="/liveAll" element={<MultipleStreamsPage />} />
            <Route path="/camera_config" element={<CameraConfig />} />
            <Route path="/videoList" element={<VideoList />} />
            <Route path="/networkConfig" element={<NetworkConfigPage />} />
            <Route path="/videoComponent" element={<AllDetection />} />
            <Route path="/canvasLine" element={<CanvasLine />} />
            <Route path="/canvasWithArea" element={<CanvasWithArea />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/VideoUpload" element={<VideoUpload />} />
            <Route path="/zoneManager" element={<ZoneManager />} />
            <Route path="/settingsPage" element={<SettingsPage />} />

            {/* Route publique pour la page Login */}
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </Layout>
      ) : (
        <Routes>
          {/* Route publique pour la page Login */}
          <Route path="/login" element={<LoginPage />} />
          {/* Redirection vers la page de connexion pour toutes les autres URL */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
