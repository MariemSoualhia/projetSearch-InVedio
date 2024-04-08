
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from './composants/Layout/Layout';
import LivePage from './pages/LivePage/LivePage';
import CameraConfig from './pages/CameraConfig/CameraConfig';

function App() { 
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LivePage />} />
          <Route path="/live" element={<LivePage />} />
          <Route path="/camera_config" element={<CameraConfig />} />
          {/* Ajoutez d'autres routes ici */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
