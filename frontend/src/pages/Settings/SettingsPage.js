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
  const [platformSettings, setPlatformSettings] = useState({
    bassiraId: "",
    areaName: "",
    dashboardToken: "",
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  // Récupération des paramètres initiaux au chargement
  useEffect(() => {
    const storedDarkMode = JSON.parse(localStorage.getItem("darkMode"));
    const storedSettings = JSON.parse(localStorage.getItem("platformSettings"));

    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode);
    }

    if (storedSettings !== null) {
      setPlatformSettings(storedSettings);
    } else {
      fetchSettings(); // Si les paramètres n'existent pas, chargez-les depuis l'API
    }
  }, []);

  // Fonction pour récupérer les paramètres depuis l'API
  const fetchSettings = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/settings");
      if (Array.isArray(response.data) && response.data.length > 0) {
        setPlatformSettings(response.data[0]);
      } else {
        console.error("Error: No settings found or invalid response format");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    if (platformSettings._id) {
      // Si les paramètres existent déjà, effectuez une mise à jour
      axios
        .put(
          `http://localhost:3002/api/settings/${platformSettings._id}`,
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
          fetchSettings(); // Rafraîchir les paramètres affichés après la mise à jour
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

      // Appel de la fonction avec le token
    } else {
      // Si les paramètres n'existent pas, créez-les
      axios
        .post("http://localhost:3002/api/settings", platformSettings)
        .then(() => {
          console.log("Settings created successfully");
          setSuccessMessage("Settings created successfully");
          setSnackbarOpen(true);
          fetchSettings(); // Rafraîchir les paramètres affichés après la création
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

  // Fonction pour basculer le mode sombre
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", JSON.stringify(newDarkMode));
    if (newDarkMode == true) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
    // Stockage du mode sombre
  };

  // Fonction pour gérer les changements d'entrée
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlatformSettings({
      ...platformSettings,
      [name]: value,
    });
  };

  // Fonction pour fermer le snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Dark and light theme configurations
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
        <Typography variant="h3" gutterBottom>
          Settings
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
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
                    color="primary"
                    onClick={saveSettings}
                    style={{ marginTop: "20px" }}
                    fullWidth
                  >
                    Connect to dashboard
                  </Button>
                  {loading && <LinearProgress style={{ marginTop: "10px" }} />}
                </form>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Theme Settings
                </Typography>
                <FormControlLabel
                  control={
                    <Switch checked={darkMode} onChange={toggleDarkMode} />
                  }
                  label="Dark Mode"
                />
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
