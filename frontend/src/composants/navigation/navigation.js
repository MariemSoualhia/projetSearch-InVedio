import React, { useState, useEffect } from "react";
import { Menu, Dropdown } from "antd";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
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
import "./navigation.css";

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
  //{
  //label: "Network Config",
  //key: "network",
  //icon: <AppstoreOutlined />,
  //path: "/networkConfig",
  //},
];

const Navigation = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");

    console.log("Déconnexion...");
    navigate("/");
    window.location.reload();
  };
  const menu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/profile">Profil</Link>
      </Menu.Item>
      <Menu.Item key="settings">
        <Link to="/settings">Paramètres</Link>
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>
        Déconnexion
      </Menu.Item>
    </Menu>
  );
  return (
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
      {/* <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        className="logout-item"
      >
        Logout
      </Menu.Item> */}
      <Dropdown overlay={menu} placement="bottomRight" className="logout-item">
        <Menu.Item key="user" icon={<UserOutlined />} className="user-item" />
      </Dropdown>
    </Menu>
  );
};

export default Navigation;
