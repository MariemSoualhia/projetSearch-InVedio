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
  CardActions,
} from "@mui/material";
import { Edit, Delete } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { Snackbar, Alert, Switch, FormControlLabel } from "@mui/material";
import axios from "axios";
import api from "./api";
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
    backgroundColor: "var(--form-background-color)",
    boxShadow: theme.shadows[3],
  },
  textField: {
    marginBottom: "15px", // Add margin bottom
    paddingBottom: "15px",
    marginTop: "15px",

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
      "&.Mui-focused + .MuiInputLabel-root": {
        color: "#F47B20", // Focused label color
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
    fontFamily: "time",
    color: "#F47B20",
  },
  pagination: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "center",
    "& .MuiPaginationItem-root": {
      color: "#9E58FF",
    },
    "& .Mui-selected": {
      color: "#F47B20",
      backgroundColor: "#e1ccff", // Optional: to ensure no background color
    },
  },
  dialogTitle: {
    textAlign: "center", // Center the title
    color: "var(--text-color)",
  },
  dialogContent: {
    color: "var(--text-color)",
  },
  dialogActions: {
    color: "var(--text-color)",
  },
  editButton: {
    color: "#9E58FF",
  },
  deleteButton: {
    color: "#f44336",
  },
  infoButton: {
    color: "#1A237E",
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
  const currentUser = JSON.parse(localStorage.getItem("currentuser"));

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
      const response = await axios.get(API_API_URL + "/api/settings", {
        params: {
          token: currentUser.dashboardToken,
        },
      });

      setPlatformSettings(response.data);
      setNewZone((prevZone) => ({
        ...prevZone,
        areaName: response.data.areaName,
        CameraID: response.data.bassiraId,
        TokenAPI: response.data.dashboardToken,
      }));
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
   
      setNewZone((prevZone) => ({
        ...prevZone,
      
        zone_name: "", type: "",
      }));
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
  const handleCloseDialog = () => {
    setNewZone({
      zone_name: "",
      type: "",
    });
  };
  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Container className={classes.root}>
        {/* <Button onClick={toggleDarkMode}>
          Toggle to {darkMode ? "Light" : "Dark"} Mode
        </Button> */}
        <Typography
          variant="h3"
          gutterBottom
          className={classes.pageTitle}
          style={{ fontFamily: "time", fontSize: "56px", color: "#9E58FF" }}
        >
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
                <FormControl
                  fullWidth
                  className={classes.textField}
                  style={{ marginTop: "15px" }}
                >
                  <TextField
                    label="Zone Name"
                    name="zone_name"
                    value={newZone.zone_name}
                    onChange={handleInputChange}
                    required
                    //fullWidth
                    //className={classes.textField}
                  />
                </FormControl>

                <FormControl
                  fullWidth
                  className={classes.textField}
                  style={{ marginTop: "15px" }}
                >
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
                <FormControl
                  fullWidth
                  className={classes.textField}
                  style={{ marginTop: "15px" }}
                >
                  <TextField
                    label="Area Name"
                    name="areaName"
                    value={newZone.areaName}
                    onChange={handleInputChange}
                    //fullWidth
                    // className={classes.textField}
                    disabled
                  />
                </FormControl>
                <CardActions className={classes.dialogActions}>
                  <Button
                    type="submit"
                    className={classes.button}
                    variant="contained"
                    color="secondary"
                    sx={{
                      backgroundColor: "#9E58FF",
                      color: "#ffff",
                      fontFamily: "time",
                    }}
                  >
                    Add Zone
                  </Button>
                  <Button
                    onClick={handleCloseDialog}
                    variant="outlined"
                    color="secondary"
                    sx={{
                      color: "#F47B20",
                      borderColor: "#F47B20",
                      fontFamily: "time",
                    }}
                  >
                    Cancel
                  </Button>
                </CardActions>
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
                    <TableCell
                      style={{
                        fontFamily: "time",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      Zone Name
                    </TableCell>
                    <TableCell
                      style={{
                        fontFamily: "time",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      Type
                    </TableCell>
                    <TableCell
                      style={{
                        fontFamily: "time",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      Area Name
                    </TableCell>
                    <TableCell
                      style={{
                        fontFamily: "time",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
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
                          sx={{ color: "#9E58FF" }}
                          onClick={() => openEditDialog(zone)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          sx={{ color: "#F47B20" }}
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
                className={classes.pagination}
              />
            </div>
          </Grid>
        </Grid>
        {editZone && (
          <Dialog open={openDialog} onClose={closeEditDialog}>
            <DialogTitle
              className={classes.dialogTitle}
              style={{
                fontFamily: "time",
                fontSize: "25px",
                fontWeight: "bold",
              }}
            >
              Edit Zone
            </DialogTitle>
            <DialogContent className={classes.dialogContent}>
              <FormControl
                fullWidth
                className={classes.textField}
                style={{ marginTop: "15px" }}
              >
                <TextField
                  label="Zone Name"
                  name="zone_name"
                  value={editZone.zone_name}
                  onChange={handleEditChange}
                  required
                  //fullWidth
                  //className={classes.textField}
                />
              </FormControl>

              <FormControl
                fullWidth
                className={classes.textField}
                style={{ marginTop: "15px" }}
              >
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
              <FormControl
                fullWidth
                className={classes.textField}
                style={{ marginTop: "15px" }}
              >
                <TextField
                  label="Area Name"
                  name="areaName"
                  value={editZone.areaName}
                  onChange={handleEditChange}
                  //fullWidth
                  disabled
                  //className={classes.textField}
                />
              </FormControl>
            </DialogContent>
            <DialogActions className={classes.dialogActions}>
              <Button
                onClick={closeEditDialog}
                variant="outlined"
                color="secondary"
                sx={{
                  color: "#F47B20",
                  borderColor: "#F47B20",
                  fontFamily: "time",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSubmit}
                variant="contained"
                color="secondary"
                sx={{
                  backgroundColor: "#9E58FF",
                  color: "#ffff",
                  fontFamily: "time",
                }}
              >
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
