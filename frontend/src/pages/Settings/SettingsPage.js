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
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import LinearProgress from "@mui/material/LinearProgress";
const SettingsPage = () => {
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
          const token = "vpbW2slErC8qKJaVrnyMNDd8HFu85pPErcGnFW8D";
          console.log(rep);
          //getTokenAPI(token);
          if (rep.data.success == true) {
            setSuccessMessage("Dashbord connected");
            setLoading(false);
            setError(false);
          } else {
            setSuccessMessage("Dashbord not connected");
            setLoading(false);
            setError(true);
          }

          setSnackbarOpen(true);
          fetchSettings(); // Rafraîchir les paramètres affichés après la mise à jour
        })
        .catch((error) => {
          console.error("Error updating settings:", error);
          setSuccessMessage("Connexion erreur");
        });

      // Appel de la fonction avec le token
    } else {
      // Si les paramètres n'existent pas, créez-les
      axios
        .post("http://localhost:3002/api/settings", platformSettings)
        .then(() => {
          console.log("Settings created successfully");
          setSnackbarOpen(true);
          fetchSettings(); // Rafraîchir les paramètres affichés après la création
        })
        .catch((error) => {
          console.error("Error creating settings:", error);
        });
    }
  };

  // Fonction pour basculer le mode sombre
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    console.log(newDarkMode);
    if (newDarkMode) {
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

  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        Settings
      </Typography>

      <Card style={{ marginTop: "20px" }}>
        <CardContent>
          <Typography variant="h5" component="h2">
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
              style={{ marginBottom: "10px" }}
            />
            <TextField
              label="Area Name"
              variant="outlined"
              fullWidth
              name="areaName"
              value={platformSettings.areaName || ""}
              onChange={handleInputChange}
              style={{ marginBottom: "10px" }}
            />
            <TextField
              label="Dashboard Token"
              variant="outlined"
              fullWidth
              name="dashboardToken"
              value={platformSettings.dashboardToken || ""}
              onChange={handleInputChange}
              style={{ marginBottom: "10px" }}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={saveSettings}
                  style={{ marginTop: "10px" }}
                >
                  Connect to dashboard
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                {loading && <LinearProgress />}
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
      <Card style={{ marginTop: "20px", padding: "20px" }}>
        <Typography variant="h5" component="h2">
          Theme Settings
        </Typography>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
          label="Dark Mode"
        />
      </Card>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={!error ? "success" : "error"}
        >
          {successMessage}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage;
