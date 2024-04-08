import React, { useState, useEffect } from "react";
import {
  Grid,
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import Pagination from "@material-ui/lab/Pagination";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
    paddingTop: theme.spacing(4),
  },
  formContainer: {
    maxWidth: "600px",
    margin: "auto",
    padding: theme.spacing(4),
    border: "2px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
  textField: {
    marginBottom: theme.spacing(2),
  },
  button: {
    marginRight: theme.spacing(1),
  },
  cameraList: {
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    border: "2px solid #ccc",
    padding: theme.spacing(2),
  },
  listItem: {
    marginBottom: theme.spacing(1),
    backgroundColor: "#fff",
    borderRadius: "4px",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  },
  listItemText: {
    fontWeight: "bold",
  },
  editButton: {
    color: "#2196f3",
  },
  deleteButton: {
    color: "#f44336",
  },
  pagination: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "center",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: theme.spacing(3),
    color: "#333", // Changez la couleur selon vos besoins
  },
}));

const CameraConfig = () => {
  const classes = useStyles();
  const [cameras, setCameras] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    username: "",
    password: "",
    rtspUrl: "",
    resolution: "",
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await axios.get("http://localhost:3002/api/cameras");
      setCameras(response.data);
    } catch (error) {
      console.error("Error fetching cameras:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddCamera = async () => {
    try {
      await axios.post("http://localhost:3002/api/cameras", formData);
      fetchCameras();
      setFormData({
        name: "",
        address: "",
        username: "",
        password: "",
        rtspUrl: "",
        resolution: "",
      });
    } catch (error) {
      console.error("Error adding camera:", error);
    }
  };

  const handleDeleteCamera = async (id) => {
    try {
      await axios.delete(`http://localhost:3002/api/cameras/${id}`);
      fetchCameras();
    } catch (error) {
      console.error("Error deleting camera:", error);
    }
  };

  const handleEditCamera = (camera) => {
    setFormData({
      id: camera._id,
      name: camera.name,
      address: camera.address,
      username: camera.username,
      password: camera.password,
      rtspUrl: camera.rtspUrl,
      resolution: camera.resolution,
    });
    setOpenDialog(true);
  };

  const handleUpdateCamera = async () => {
    try {
      await axios.put(
        `http://localhost:3002/api/cameras/${formData.id}`,
        formData
      );
      fetchCameras();
      setFormData({
        name: "",
        address: "",
        username: "",
        password: "",
        rtspUrl: "",
        resolution: "",
      });
      setOpenDialog(false);
    } catch (error) {
      console.error("Error updating camera:", error);
    }
  };

  const handleCloseDialog = () => {
    setFormData({
      name: "",
      address: "",
      username: "",
      password: "",
      rtspUrl: "",
      resolution: "",
    });
    setOpenDialog(false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const paginatedCameras = cameras.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container className={classes.root}>
      <Typography variant="h3" gutterBottom className={classes.pageTitle}>
        Camera Configuration
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <form className={classes.formContainer}>
            <TextField
              label="Camera Name"
              variant="outlined"
              fullWidth
              className={classes.textField}
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            <TextField
              label="IP Address"
              variant="outlined"
              fullWidth
              className={classes.textField}
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              className={classes.textField}
              name="username"
              value={formData.username}
              onChange={handleInputChange}
            />
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              className={classes.textField}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <TextField
              label="RTSP URL"
              variant="outlined"
              fullWidth
              className={classes.textField}
              name="rtspUrl"
              value={formData.rtspUrl}
              onChange={handleInputChange}
            />
            <TextField
              label="Resolution"
              variant="outlined"
              fullWidth
              className={classes.textField}
              name="resolution"
              value={formData.resolution}
              onChange={handleInputChange}
            />
            {formData.id ? (
              <Button
                variant="contained"
                color="primary"
                className={classes.button}
                onClick={handleUpdateCamera}
              >
                Update Camera
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                className={classes.button}
                onClick={handleAddCamera}
              >
                Add Camera
              </Button>
            )}
          </form>
        </Grid>
        <Grid item xs={12} sm={6}>
          <List className={classes.cameraList}>
            {paginatedCameras.map((camera) => (
              <ListItem key={camera._id} className={classes.listItem}>
                <ListItemText
                  primary={camera.name}
                  secondary={`RTSP URL: ${camera.rtspUrl}, Resolution: ${camera.resolution}`}
                  classes={{ primary: classes.listItemText }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => handleEditCamera(camera)}
                    className={classes.editButton}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteCamera(camera._id)}
                    className={classes.deleteButton}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <div className={classes.pagination}>
            <Pagination
              count={Math.ceil(cameras.length / itemsPerPage)}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </div>
        </Grid>
      </Grid>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Edit Camera</DialogTitle>
        <DialogContent>
          <TextField
            label="Camera Name"
            variant="outlined"
            fullWidth
            className={classes.textField}
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
          <TextField
            label="IP Address"
            variant="outlined"
            fullWidth
            className={classes.textField}
            name="address"
            value={formData.address}
            onChange={handleInputChange}
          />
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            className={classes.textField}
            name="username"
            value={formData.username}
            onChange={handleInputChange}
          />
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            className={classes.textField}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
          />
          <TextField
            label="RTSP URL"
            variant="outlined"
            fullWidth
            className={classes.textField}
            name="rtspUrl"
            value={formData.rtspUrl}
            onChange={handleInputChange}
          />
          <TextField
            label="Resolution"
            variant="outlined"
            fullWidth
            className={classes.textField}
            name="resolution"
            value={formData.resolution}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUpdateCamera} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CameraConfig;
