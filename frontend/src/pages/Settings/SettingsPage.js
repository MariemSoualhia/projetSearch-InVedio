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

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [platformSettings, setPlatformSettings] = useState({
    bassiraId: "",
    areaName: "",
    dashboardToken: "",
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);

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

  // Fonction pour créer ou mettre à jour les paramètres
  const saveSettings = () => {
    if (platformSettings._id) {
      // Si les paramètres existent déjà, effectuez une mise à jour
      axios
        .put(
          `http://localhost:3002/api/settings/${platformSettings._id}`,
          platformSettings
        )
        .then(() => {
          console.log("Settings updated successfully");
          setSnackbarOpen(true);
          fetchSettings(); // Rafraîchir les paramètres affichés après la mise à jour
        })
        .catch((error) => {
          console.error("Error updating settings:", error);
        });
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
    localStorage.setItem("darkMode", JSON.stringify(newDarkMode)); // Stockage du mode sombre
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
      <Grid container alignItems="center">
        <Grid item xs={6}>
          <Typography variant="subtitle1">Dark Mode</Typography>
        </Grid>
        <Grid item xs={6} style={{ textAlign: "right" }}>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={toggleDarkMode}
                name="darkModeSwitch"
                color="primary"
              />
            }
            label=""
          />
        </Grid>
      </Grid>
      <Card style={{ marginTop: "20px" }}>
        <CardContent>
          <Typography variant="h5" component="h2">
            Platform Settings
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
            <Button
              variant="contained"
              color="primary"
              onClick={saveSettings}
              style={{ marginTop: "10px" }}
            >
              Save Settings
            </Button>
          </form>
        </CardContent>
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
          severity="success"
        >
          Settings saved
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage;
