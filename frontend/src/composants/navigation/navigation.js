import React, { useState, useEffect } from "react";
import { Menu, Dropdown, Switch, Avatar } from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
  AppstoreOutlined,
  VideoCameraOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import SwitchVideoIcon from "@mui/icons-material/SwitchVideo";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import VideoSettingsIcon from "@mui/icons-material/VideoSettings";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import SettingsIcon from "@mui/icons-material/Settings";
import CropFreeIcon from "@mui/icons-material/CropFree";
import "./navigation.css";
import {
  API_API_URL,
  API_API_URLDetection,
  API_API_URLRTSP,
} from "../../config/serverApiConfig";
const { SubMenu } = Menu;

const items = [
  {
    label: "Settings",
    key: "settings",
    icon: <SettingsIcon style={{ color: "var(--icon-color)" }} />,
    path: "/settingsPage",
  },
  {
    label: "All streams",
    key: "streams",
    icon: <LiveTvIcon style={{ color: "var(--icon-color)" }} />,
    path: "/liveAll",
  },

  {
    label: "Zone Config",
    key: "zoneConfig",
    icon: <CropFreeIcon style={{ color: "var(--icon-color)" }} />,
    path: "/zoneManager",
  },
  {
    label: "Stream Counting",
    key: "live",
    icon: <SwitchVideoIcon style={{ color: "var(--icon-color)" }} />,
    path: "/videoComponent",
  },
  {
    label: "List of Records",
    key: "records",
    icon: <VideoSettingsIcon style={{ color: "var(--icon-color)" }} />,
    path: "/videoList",
  },
];

const Navigation = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("currentuser"))
  );

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentuser");
    localStorage.removeItem("selectedCameraList");
    console.log("Déconnexion...");
    navigate("/");
    window.location.reload();
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  };

  const menu = (
    <Menu className="logout-item">
      <Menu.Item key="profile">
        <Link to="/profile" style={{ fontFamily: "time", fontSize: "18px" }}>
          Profil
        </Link>
      </Menu.Item>
      <Menu.Item
        key="logout"
        style={{ fontFamily: "time", fontSize: "18px" }}
        onClick={handleLogout}
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Menu mode="horizontal" className={`menu-horizontal ${theme}`}>
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

      <Dropdown overlay={menu} placement="bottomRight" className="logout-item">
        <Menu.Item key="user" className="logout-item">
          <Avatar
            src={API_API_URL + `${user.photoProfil}`}
            alt="User Profile Picture"
          />
        </Menu.Item>
      </Dropdown>
    </Menu>
  );
};

export default Navigation;
