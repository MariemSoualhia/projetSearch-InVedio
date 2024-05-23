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
// import WebRTCStreamer from "./pages/VideoComponent/WebRTCStreamer";
import DetectionPage from "./pages/LivePage/DetectionPage";
import AllDetection from "./pages/LivePage/AllDetection";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import VideoUpload from "./pages/LivePage/VideoUpload";
import ZoneManager from "./pages/zoneManager/zoneManager";
import SettingsPage from "./pages/Settings/SettingsPage";
import CameraPage from "./pages/LivePage/CameraPage";
import ResetPasswordPage from "./pages/Login/ResetPasswordPage";

// Fonction pour vérifier si l'utilisateur est connecté
const isUserAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token; // Renvoie true si le token existe, sinon false
};

function App() {
  return (
    <Router>
      <Routes>
        {isUserAuthenticated() ? (
          <>
            {/* Routes protégées */}
            <Route
              path="/"
              element={
                <Layout>
                  <CameraPage />
                </Layout>
              }
            />
            <Route
              path="/live"
              element={
                <Layout>
                  <CameraPage />
                </Layout>
              }
            />
            <Route
              path="/liveAll"
              element={
                <Layout>
                  <CameraPage />
                </Layout>
              }
            />
            <Route
              path="/camera_config"
              element={
                <Layout>
                  <CameraConfig />
                </Layout>
              }
            />
            <Route
              path="/videoList"
              element={
                <Layout>
                  <VideoList />
                </Layout>
              }
            />
            <Route
              path="/networkConfig"
              element={
                <Layout>
                  <NetworkConfigPage />
                </Layout>
              }
            />
            <Route
              path="/videoComponent"
              element={
                <Layout>
                  <AllDetection />
                </Layout>
              }
            />
            <Route
              path="/canvasLine"
              element={
                <Layout>
                  <CanvasLine />
                </Layout>
              }
            />
            <Route
              path="/canvasWithArea"
              element={
                <Layout>
                  <CanvasWithArea />
                </Layout>
              }
            />
            <Route
              path="/profile"
              element={
                <Layout>
                  <ProfilePage />
                </Layout>
              }
            />
            <Route
              path="/VideoUpload"
              element={
                <Layout>
                  <VideoUpload />
                </Layout>
              }
            />
            <Route
              path="/zoneManager"
              element={
                <Layout>
                  <ZoneManager />
                </Layout>
              }
            />
            <Route
              path="/settingsPage"
              element={
                <Layout>
                  <SettingsPage />
                </Layout>
              }
            />
            {/* Route publique pour la page Login */}
            {/* <Route path="/login" element={<LoginPage />} /> */}
            {/* <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            /> */}
          </>
        ) : (
          <>
            {/* Route publique pour la page Login */}
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />
            {/* Redirection vers la page de connexion pour toutes les autres URL */}
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
