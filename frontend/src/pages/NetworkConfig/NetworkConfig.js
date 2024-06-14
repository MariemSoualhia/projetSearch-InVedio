import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Button,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  root: {
    margin: "0 auto",
    padding: theme.spacing(4),
    border: "1px solid #ccc",
    borderRadius: theme.spacing(2),
    backgroundColor: "var(--background-color)",
    maxWidth: 600,
  },
  title: {
    marginBottom: theme.spacing(5),
    paddingBottom: theme.spacing(4),
  },
  textField: {
    marginBottom: theme.spacing(2),
  },
  button: {
    borderRadius: theme.spacing(2),
    padding: `${theme.spacing(1.5)}px ${theme.spacing(4)}px`,
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
    marginTop: theme.spacing(2),
  },
}));

const NetworkConfig = ({ onConfig }) => {
  const classes = useStyles();
  const [interfaceName, setInterfaceName] = useState("eth0");
  const [dhcp, setDhcp] = useState(true);
  const [ip, setIp] = useState("");
  const [subnetMask, setSubnetMask] = useState("");
  const [gateway, setGateway] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    document.body.className = savedTheme || "light";
  }, []);

  const handleConfig = async () => {
    const config = {
      interface: interfaceName,
      dhcp: dhcp,
      ip: dhcp ? "" : ip,
      prefix: dhcp ? "" : subnetMask,
      gateway: dhcp ? "" : gateway,
    };
    
    try {
      const response = await axios.post("http://localhost:3002/config", config);
      console.log('Réponse du serveur :', response.data);
      setResponseMessage(`Succès : ${response.data}`);
      onConfig(config);
    } catch (error) {
      console.error('Erreur lors de la configuration du réseau :', error);
      setResponseMessage(`Erreur : ${error.response ? error.response.data : error.message}`);
    }
  };

  return (
    <ThemeProvider
      theme={createTheme({
        palette: { mode: localStorage.getItem("theme") || "light" },
      })}
    >
      <CssBaseline />
      <Paper className={classes.root} elevation={3}>
        <Typography
          variant="h4"
          className={classes.title}
          style={{ fontFamily: "time", fontSize: "36px" }}
        >
          Network Configuration
        </Typography>
        <TextField
          fullWidth
          label="Interface Name"
          variant="outlined"
          value={interfaceName}
          onChange={(e) => setInterfaceName(e.target.value)}
          className={classes.textField}
        />
        <FormControl component="fieldset">
          <RadioGroup
            row
            aria-label="configuration"
            name="configuration"
            value={dhcp ? "dhcp" : "manual"}
            onChange={(e) => setDhcp(e.target.value === "dhcp")}
          >
            <FormControlLabel
              value="dhcp"
              control={<Radio style={{ color: "#F47B20" }} />}
              label="Automatic DHCP"
            />
            <FormControlLabel
              value="manual"
              control={<Radio style={{ color: "#F47B20" }} />}
              label="Manual Configuration"
            />
          </RadioGroup>
        </FormControl>
        {!dhcp && (
          <div>
            <TextField
              fullWidth
              label="IP Address"
              variant="outlined"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className={classes.textField}
            />
            <TextField
              fullWidth
              label="Subnet Mask"
              variant="outlined"
              value={subnetMask}
              onChange={(e) => setSubnetMask(e.target.value)}
              className={classes.textField}
            />
            <TextField
              fullWidth
              label="Gateway"
              variant="outlined"
              value={gateway}
              onChange={(e) => setGateway(e.target.value)}
              className={classes.textField}
            />
          </div>
        )}
        <Button
          variant="contained"
          onClick={handleConfig}
          style={{
            fontFamily: "time",
            fontSize: "20px",
            backgroundColor: "#9E58FF",
          }}
          className={classes.button}
        >
          Configure
        </Button>
        {responseMessage && (
          <Typography variant="body1" color="error" style={{ marginTop: 16 }}>
            {responseMessage}
          </Typography>
        )}
      </Paper>
    </ThemeProvider>
  );
};

export default NetworkConfig;
