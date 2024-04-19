import React from "react";
import { Menu } from "antd";
import { Link, useHistory } from "react-router-dom";
import { useNavigate } from "react-router-dom"; 
import { AppstoreOutlined, VideoCameraOutlined, LogoutOutlined } from "@ant-design/icons";
import "./navigation.css";
const { SubMenu } = Menu;

const items = [
  {
    label: "Live",
    key: "live",
    icon: <VideoCameraOutlined />,
    path: "/",
  },
  {
    label: "Camera Config",
    key: "cameraConfig",
    icon: <AppstoreOutlined />,
    path: "/camera_config",
  },
  {
    label: "list of records",
    key: "records",
    icon: <AppstoreOutlined />,
    path: "/videoList",
  },
  {
    label: "NetworkConfig",
    key: "network",
    icon: <AppstoreOutlined />,
    path: "/networkConfig",
  },
  
  // Ajoutez d'autres éléments de menu avec leurs chemins
];

const Navigation = () => {
  const navigate = useNavigate(); 
  const handleLogout = () => {
    // Supprimer le token JWT du localStorage
    localStorage.removeItem('token');
    
    // Rediriger l'utilisateur vers la page de connexion par exemple
    navigate('/login');
    window.location.reload()
    
    console.log("Déconnexion...");
  };

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
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout} style={{ marginLeft: 'auto' }}>
        Logout
      </Menu.Item>
    </Menu>
  );
};

export default Navigation;
