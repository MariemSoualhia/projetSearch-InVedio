import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  Card,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  CircularProgress,
  CssBaseline,
  Pagination,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { Edit, Delete } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { Snackbar, Alert, Switch, FormControlLabel } from "@mui/material";
import axios from "axios";
import api from "./api";

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
    //backgroundColor: "var(--background-color)",
    color: "var(--text-color)",
  },
  dialogContent: {
    //backgroundColor: "var(--background-color)",
    color: "var(--text-color)",
  },
  dialogActions: {
    //backgroundColor: "var(--background-color)",
    color: "var(--text-color)",
  },
}));

const ZoneManager = () => {
  const classes = useStyles();
  const [zones, setZones] = useState([]);
  const [newZone, setNewZone] = useState({
    zone_name: "",
    type: "",
    areaName: "",
    CameraID: "",
    TokenAPI: "",
  });
  const [editZone, setEditZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });
  const [platformSettings, setPlatformSettings] = useState({
    bassiraId: "",
    areaName: "",
    dashboardToken: "",
  });

  useEffect(() => {
    fetchZones();
    fetchSettings();
    const storedDarkMode = JSON.parse(localStorage.getItem("darkMode"));
    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode);
    }
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const fetchZones = async () => {
    try {
      const response = await api.get("/zones");
      setZones(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching zones:", error);
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/settings");
      if (Array.isArray(response.data) && response.data.length > 0) {
        setPlatformSettings(response.data[0]);
        setNewZone((prevZone) => ({
          ...prevZone,
          areaName: response.data[0].areaName,
          CameraID: response.data[0].bassiraId,
          TokenAPI: response.data[0].dashboardToken,
        }));
      } else {
        console.error("Error: No settings found or invalid response format");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewZone({ ...newZone, [name]: value });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditZone({ ...editZone, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/zones", newZone);
      handleSuccessSnackbar("Zone added successfully");
      fetchZones();
      setNewZone({ zone_name: "", type: "", areaName: "" });
    } catch (error) {
      console.error("Error creating zone:", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/zones/${editZone._id}`, editZone);
      handleSuccessSnackbar("Zone updated successfully");
      fetchZones();
      setEditZone(null);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error updating zone:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/zones/${id}`);
      handleSuccessSnackbar("Zone deleted successfully");
      fetchZones();
    } catch (error) {
      console.error("Error deleting zone:", error);
    }
  };

  const openEditDialog = (zone) => {
    setEditZone(zone);
    setOpenDialog(true);
  };

  const closeEditDialog = () => {
    setEditZone(null);
    setOpenDialog(false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) {
    return <CircularProgress color="inherit" />;
  }

  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedZones = zones.slice(indexOfFirstItem, indexOfLastItem);

  const handleSuccessSnackbar = (message) => {
    setSuccessMessage(message);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Theme configuration for dark and light mode
  const lightTheme = createTheme({
    palette: {
      mode: "light",
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", JSON.stringify(newDarkMode));
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Container className={classes.root}>
        {/* <Button onClick={toggleDarkMode}>
          Toggle to {darkMode ? "Light" : "Dark"} Mode
        </Button> */}
        <Typography variant="h3" gutterBottom className={classes.pageTitle}>
          Zone Management
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
          <Card>
            <form
              onSubmit={handleSubmit}
              className={classes.form}
              noValidate
              autoComplete="off"
            >
              <TextField
                label="Zone Name"
                name="zone_name"
                value={newZone.zone_name}
                onChange={handleInputChange}
                required
                fullWidth
                className={classes.textField}
              />
              <br></br>
              <br></br>
              <FormControl fullWidth className={classes.textField}>
                <InputLabel className={classes.inputLabel}>Type</InputLabel>
                <Select
                  name="type"
                  value={newZone.type}
                  onChange={handleInputChange}
                  label="Type"
                >
                  <MenuItem value="gate zone">Gate</MenuItem>
                  <MenuItem value="internal zone">Internal Zone</MenuItem>
                </Select>
              </FormControl>
              <br></br>
              <br></br>
              <TextField
                label="Area Name"
                name="areaName"
                value={newZone.areaName}
                onChange={handleInputChange}
                fullWidth
                className={classes.textField}
                disabled
              />
              <br></br>
              <br></br>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.button}
              >
                Add Zone
              </Button>
            </form>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TableContainer
              component={Paper}
              className={classes.tableContainer}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.tableHeader}>
                      Zone Name
                    </TableCell>
                    <TableCell className={classes.tableHeader}>Type</TableCell>
                    <TableCell className={classes.tableHeader}>
                      Area Name
                    </TableCell>
                    <TableCell className={classes.tableHeader}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedZones.map((zone) => (
                    <TableRow key={zone._id}>
                      <TableCell>{zone.zone_name}</TableCell>
                      <TableCell>{zone.type}</TableCell>
                      <TableCell>{zone.areaName}</TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => openEditDialog(zone)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() => handleDelete(zone._id)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <div className={classes.pagination}>
              <Pagination
                count={Math.ceil(zones.length / itemsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </div>
          </Grid>
        </Grid>
        {editZone && (
          <Dialog open={openDialog} onClose={closeEditDialog}>
            <DialogTitle className={classes.dialogTitle}>Edit Zone</DialogTitle>
            <DialogContent className={classes.dialogContent}>
              
              <TextField
                label="Zone Name"
                name="zone_name"
                value={editZone.zone_name}
                onChange={handleEditChange}
                required
                fullWidth
                className={classes.textField}
              />
                <br></br>
                <br></br>
              <FormControl fullWidth className={classes.textField}>
                <InputLabel className={classes.inputLabel}>Type</InputLabel>
                <Select
                  name="type"
                  value={editZone.type}
                  onChange={handleEditChange}
                  label="Type"
                >
                  <MenuItem value="gate zone">Gate</MenuItem>
                  <MenuItem value="internal zone">Internal Zone</MenuItem>
                </Select>
              </FormControl>
              <br></br>
              <br></br>
              <TextField
                label="Area Name"
                name="areaName"
                value={editZone.areaName}
                onChange={handleEditChange}
                fullWidth
                disabled
                className={classes.textField}
              />
            </DialogContent>
            <DialogActions className={classes.dialogActions}>
              <Button onClick={closeEditDialog} color="secondary">
                Cancel
              </Button>
              <Button onClick={handleEditSubmit} color="primary">
                Update
              </Button>
            </DialogActions>
          </Dialog>
        )}
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
            severity="success"
          >
            {successMessage}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default ZoneManager;
