import React, { useState } from "react";
import {
  Typography,
  Divider,
  Box,
  Avatar,
  Button,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Grid,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
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
    backgroundColor: "#9E58FF",
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
const ProfilePage = () => {
  const storedUser = JSON.parse(localStorage.getItem("currentuser"));
  const [user, setUser] = useState(storedUser);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setUser(storedUser);
    setEditing(false);
    setChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(
        `http://localhost:3002/api/user/update/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        }
      );
      localStorage.setItem("currentuser", JSON.stringify(user));
      setEditing(false);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      setSnackbarMessage("Profile updated successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error updating profile:", error.message);
      setSnackbarMessage("Error updating profile. Please try again.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setSnackbarMessage("Passwords do not match.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3002/api/user/change-password/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      setSnackbarMessage("Password changed successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error.message);
      setSnackbarMessage("Error changing password. Please try again.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUploadProfilePicture = async () => {
    if (!selectedFile) {
      setSnackbarMessage("No file selected.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    const formData = new FormData();
    formData.append("photoProfil", selectedFile);

    try {
      const response = await fetch(
        `http://localhost:3002/api/user/update-profile-picture/${user._id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const updatedUser = await response.json();
      localStorage.setItem("currentuser", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setSnackbarMessage("Profile picture updated successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error updating profile picture:", error.message);
      setSnackbarMessage("Error updating profile picture. Please try again.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 8,
        px: 2,
        maxWidth: 800,
        margin: "auto",
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={
                <Avatar
                  sx={{ width: 100, height: 100 }}
                  src={`http://localhost:3002${user.photoProfil}`}
                />
              }
              action={
                editing && (
                  <IconButton color="primary" component="label">
                    <PhotoCamera />
                    <input type="file" hidden onChange={handleFileChange} />
                  </IconButton>
                )
              }
              title={
                <Typography variant="h5">
                  {user.username || "User Profile"}
                </Typography>
              }
            />
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <TextField
                label="Username"
                value={user.username}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
                variant="outlined"
                fullWidth
                disabled={!editing}
                sx={{ mb: 2 }}
              />
              <br></br>
              <br></br>
              <TextField
                label="Email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                variant="outlined"
                fullWidth
                disabled={!editing}
                sx={{ mb: 2 }}
              />
            </CardContent>
            <CardActions>
              {!editing ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveProfile}
                  >
                    Save Profile
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUploadProfilePicture}
                  >
                    Upload Profile Picture
                  </Button>
                </>
              )}
            </CardActions>
          </Card>
        </Grid>
        {changingPassword && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <TextField
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 2 }}
                />
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleChangePassword}
                >
                  Save New Password
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )}
        {!changingPassword && (
          <Grid item xs={12}>
            <Card>
              <CardActions>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => setChangingPassword(true)}
                  sx={{ mr: 2 }}
                >
                  Change Password
                </Button>
                {/* Uncomment the button below to enable account deletion */}
                {/* <Button variant="contained" color="error">
                  Delete Account
                </Button> */}
              </CardActions>
            </Card>
          </Grid>
        )}
      </Grid>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
