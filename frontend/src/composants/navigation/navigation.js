import React, { useState, useEffect } from "react";
import { Menu } from "antd";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom"; 
import { AppstoreOutlined, VideoCameraOutlined, LogoutOutlined } from "@ant-design/icons";
import SwitchVideoIcon from '@mui/icons-material/SwitchVideo';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import VideoSettingsIcon from '@mui/icons-material/VideoSettings';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import "./navigation.css";
import {
  Box,
  Button,
  Checkbox,
  Container,
  CssBaseline,
  FormControlLabel,
  Grid,
  Paper,
  TextField,
  Typography,
  ThemeProvider,
  createTheme,
} from '@mui/material';
const { SubMenu } = Menu;

const items = [
  {
    label: "All streams",
    key: "streams",
    icon: <LiveTvIcon />,
    path: "/liveAll",
  },
  {
    label: "Camera Config",
    key: "cameraConfig",
    icon: <CameraAltIcon />,
    path: "/camera_config",
  },
  {
    label: "Camera Stream",
    key: "live",
    icon: <SwitchVideoIcon />,
    path: "/videoComponent",
  },

  {
    label: "List of Records",
    key: "records",
    icon: <VideoSettingsIcon />,
    path: "/videoList",
  },
];

const Navigation = () => {
  const navigate = useNavigate(); 
  const [darkMode, setDarkMode] = useState(false); // État du mode sombre

  // Charger le mode sombre à partir du localStorage lors de la première montée en charge
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode');
    if (isDarkMode === 'true') {
      setDarkMode(true);
    }
  }, []);

  // Enregistrer le mode sombre dans le localStorage lorsqu'il est modifié
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    console.log("Déconnexion...");
    navigate('/');
    window.location.reload();
  };

  // Couleurs pour les thèmes sombre et clair
  const darkPalette = {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#f50057",
    },
  };

  const lightPalette = {
    primary: {
      main: "#2196f3",
    },
    secondary: {
      main: "#f50057",
    },
  };

  // Création des thèmes
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      ...darkPalette,
    },
  });

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      ...lightPalette,
    },
  });

  // Fonction pour basculer entre les thèmes
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode; // Nouvelle valeur du mode sombre
    setDarkMode(newDarkMode); // Mettre à jour l'état du mode sombre
    
    // Mettre à jour le localStorage avec la nouvelle valeur du mode sombre
    localStorage.setItem('darkMode', newDarkMode.toString());
  };
  
  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Menu mode="horizontal" className="menu-horizontal">
        <Menu.Item key="logo" className="logo-container">
          <Link to="/" className="logo-container">
            <img
              src="https://data-doit.com/wp-content/uploads/2022/11/datadoit1-150x150.png"
              alt="Logo de la plateforme"
              className="logo-img"
            />
            <div className="logo-text">DATADOIT</div>
          </Link>
        </Menu.Item>
        {items.map((item) => (
          <Menu.Item key={item.key} icon={item.icon}>
            <Link to={item.path}>{item.label}</Link>
          </Menu.Item>
        ))}
        <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout} className="logout-item">
          Logout
        </Menu.Item>
        <Menu.Item key="themeToggle" icon={darkMode ? <Brightness7Icon /> : <Brightness4Icon />} onClick={toggleDarkMode}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </Menu.Item>
      </Menu>
    </ThemeProvider> 
  );
};

export default Navigation;
