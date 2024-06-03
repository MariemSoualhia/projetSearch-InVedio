import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Snackbar,
  CssBaseline,
} from "@material-ui/core";
import { Alert, LinearProgress } from "@mui/material";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import NetworkConfig from "../NetworkConfig/NetworkConfig";
import {
  API_API_URL,
  API_API_URLDetection,
  API_API_URLRTSP,
} from "../../config/serverApiConfig";
const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
    paddingTop: theme.spacing(4),
  },
  form: {
    maxWidth: "600px",
    margin: "auto",
    padding: theme.spacing(4),
    border: `2px solid var(--border-color)`,
    borderRadius: "8px",
    backgroundColor: "var(--background-color)",
  },
  textField: {
    marginBottom: theme.spacing(2),
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "var(--input-border-color)",
        backgroundColor: "var(--input-background-color)",
      },
      "&:hover fieldset": {
        borderColor: "var(--input-border-color)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "var(--input-border-color)",
      },
      "& input": {
        color: "var(--input-text-color)",
      },
    },
    "& .MuiInputLabel-root": {
      color: "var(--label-color)",
    },
  },
  button: {
    marginRight: theme.spacing(1),
  },
  tableContainer: {
    marginTop: theme.spacing(2),
    backgroundColor: "var(--background-color)",
    borderRadius: "8px",
    border: `2px solid var(--border-color)`,
    padding: theme.spacing(2),
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: theme.spacing(3),
    color: "var(--text-color)",
  },
  tableHeader: {
    fontWeight: "bold",
  },
  pagination: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "center",
    "& .MuiPaginationItem-root": {
      color: "#9E58FF",
    },
  },
  dialogTitle: {
    backgroundColor: "var(--background-color)",
    color: "var(--text-color)",
  },
  dialogContent: {
    backgroundColor: "var(--background-color)",
    color: "var(--text-color)",
  },
  dialogActions: {
    backgroundColor: "var(--background-color)",
    color: "var(--text-color)",
  },
}));

const SettingsPage = () => {
  const classes = useStyles();
  const [darkMode, setDarkMode] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("currentuser"));

  const [platformSettings, setPlatformSettings] = useState({
    bassiraId: "",
    areaName: "",
    dashboardToken: "",
    userId: currentUser ? currentUser.id : "",
  });

  const [networkConfig, setNetworkConfig] = useState({
    interface: "eth0",
    dhcp: true,
    ip: "",
    subnetMask: "",
    gateway: "",
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Fetch initial settings on load
  useEffect(() => {
    const storedDarkMode = JSON.parse(localStorage.getItem("darkMode"));
    const storedSettings = JSON.parse(localStorage.getItem("platformSettings"));
    const storedNetworkConfig = JSON.parse(
      localStorage.getItem("networkConfig")
    );

    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode);
    }

    if (storedSettings !== null) {
      setPlatformSettings(storedSettings);
    } else {
      fetchSettings();
    }

    if (storedNetworkConfig !== null) {
      setNetworkConfig(storedNetworkConfig);
    }
  }, []);

  const fetchSettings = async () => {
    if (currentUser && currentUser.dashboardToken) {
      try {
        const response = await axios.get(API_API_URL + "/api/settings", {
          params: {
            token: currentUser.dashboardToken,
          },
        });
        if (response.data) {
          setPlatformSettings(response.data);
        } else {
          console.error("Error: No settings found or invalid response format");
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    console.log(platformSettings);
    if (platformSettings._id) {
      axios
        .put(
          API_API_URL + `/api/settings/${platformSettings._id}`,
          platformSettings
        )
        .then((rep) => {
          console.log("Settings updated successfully");
          if (rep.data.success === true) {
            setSuccessMessage("Dashboard connected");
            setError(false);
          } else {
            setSuccessMessage("Dashboard not connected");
            setError(true);
          }
          setSnackbarOpen(true);
          fetchSettings();
        })
        .catch((error) => {
          console.error("Error updating settings:", error);
          setSuccessMessage("Connection error");
          setError(true);
          setSnackbarOpen(true);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      console.log("i'm here");
      axios
        .post(API_API_URL + "/api/settings/", platformSettings)
        .then(() => {
          console.log("Settings created successfully");
          setSuccessMessage("Settings created successfully");
          setSnackbarOpen(true);
          fetchSettings();
        })
        .catch((error) => {
          console.error("Error creating settings:", error);
          setSuccessMessage("Error creating settings");
          setError(true);
          setSnackbarOpen(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const saveNetworkConfig = (config) => {
    setNetworkConfig(config);
    localStorage.setItem("networkConfig", JSON.stringify(config));
    setSuccessMessage("Network configuration saved successfully");
    setError(false);
    setSnackbarOpen(true);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", JSON.stringify(newDarkMode));
    if (newDarkMode) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlatformSettings({
      ...platformSettings,
      [name]: value,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const lightTheme = createTheme({
    palette: {
      type: "light",
    },
  });

  const darkTheme = createTheme({
    palette: {
      type: "dark",
    },
  });

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Container className={classes.root}>
        <Typography
          variant="h3"
          gutterBottom
          style={{ fontFamily: "time", fontSize: "56px", color: "#9E58FF" }}
        >
          Settings
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography
                  variant="h5"
                  component="h2"
                  style={{ fontFamily: "time", fontSize: "36px" }}
                  gutterBottom
                >
                  Dashboard Settings
                </Typography>
                <form>
                  <TextField
                    label="Bassira ID"
                    variant="outlined"
                    fullWidth
                    name="bassiraId"
                    value={platformSettings.bassiraId || ""}
                    onChange={handleInputChange}
                    style={{ marginBottom: "20px" }}
                  />
                  <TextField
                    label="Area Name"
                    variant="outlined"
                    fullWidth
                    name="areaName"
                    value={platformSettings.areaName || ""}
                    onChange={handleInputChange}
                    style={{ marginBottom: "20px" }}
                  />
                  <TextField
                    label="Dashboard Token"
                    variant="outlined"
                    fullWidth
                    name="dashboardToken"
                    value={platformSettings.dashboardToken || ""}
                    onChange={handleInputChange}
                    style={{ marginBottom: "20px" }}
                  />

                  <Button
                    variant="contained"
                    color="secondary"
                    style={{
                      backgroundColor: "#9E58FF",
                      fontFamily: "time",
                      fontSize: "20px",
                    }}
                    onClick={saveSettings}
                    fullWidth
                  >
                    Connect to dashboard
                  </Button>
                  {loading && (
                    <LinearProgress
                      color="secondary"
                      style={{
                        backgroundColor: "#F47B20",
                        color: "#9E58FF",
                        marginTop: "10px",
                      }}
                    />
                  )}
                </form>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography
                  variant="h5"
                  component="h2"
                  gutterBottom
                  style={{ fontFamily: "time", fontSize: "36px" }}
                >
                  Theme Settings
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      style={{ color: "#9E58FF" }}
                      checked={darkMode}
                      onChange={toggleDarkMode}
                    />
                  }
                  label="Dark Mode"
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <NetworkConfig onConfig={saveNetworkConfig} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            elevation={6}
            variant="filled"
            onClose={handleCloseSnackbar}
            severity={!error ? "success" : "error"}
          >
            {successMessage}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default SettingsPage;
